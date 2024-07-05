import { config } from "dotenv";
import { Telegraf, session, Markup } from "telegraf";
import connectDb from "./connectDb.js";
import axios from "axios";
import { getUserOrders } from "./controllers.js";
import { fetchLocations } from "./helpers/bot/get-all-locations.js";
import { isValidUrl } from "./helpers/bot/is-valid-url.js";
import { parseCoordinates } from "./helpers/bot/parse-coordinates.js";
import { groupLocationsByRegion } from "./helpers/bot/group-locations.js";

config();

const token = process.env.TOKEN;
const API_URL = process.env.API_URL;
const WEBAPP_URL = process.env.WEBAPP_URL;

connectDb();

export const bot = new Telegraf(token);

bot.use(session()).use((ctx, next) => {
  ctx.session ??= {}; // set session if no exists
  return next();
});

const mainMenu = Markup.keyboard([
  "Buyurtmalarim",
  Markup.button.webApp("Buyurtma berish", WEBAPP_URL),
  "Manzillarimiz📍",
]).resize();

async function sendMainMenu(ctx) {
  await ctx.reply(
    "Menu",
    Markup.keyboard([
      "Buyurtmalarim",
      Markup.button.webApp(
        "Buyurtma berish",
        WEBAPP_URL +
          `?userContact=${ctx.session.user}&username=${ctx.message.from.username}`
      ),
      "Manzillarimiz📍",
    ]).resize()
  );
}

bot.command("start", async (ctx) => {
  await ctx.reply("Assalamu Alaykum", {
    reply_markup: {
      remove_keyboard: true,
    },
  });

  if (ctx.chat.type == "private") {
    if (!ctx.session.user) {
      await ctx.telegram.sendMessage(
        ctx.chat.id,
        "Telefon raqamingizni jo'nating",
        {
          parse_mode: "Markdown",
          reply_markup: {
            one_time_keyboard: true,
            resize_keyboard: true,
            keyboard: [
              [
                {
                  text: "Jo'natish ",
                  request_contact: true,
                },
              ],
            ],
            force_reply: true,
          },
        }
      );
    } else {
      await sendMainMenu(ctx);
    }
  }
});

bot.on("contact", async (ctx) => {
  const userContact = ctx.message.contact.phone_number.toString().slice(3);
  ctx.session.user = userContact;
  await sendMainMenu(ctx);
});

bot.hears("Buyurtmalarim", async (ctx) => {
  const userOrders = await getUserOrders(
    ctx.session.user,
    ctx.message.from.username
  );
  const currency = await getCurrency();
  if (userOrders.length > 0) {
    userOrders.forEach(async (order) => {
      const product = order.product;
      const creditType = order.creditType;
      const userContact = order.userContact;
      const username = order.username;
      if (product) {
        let orderMessage = `
        ${product.full_name}
         To'lov turi: ${creditType} bo'lib to'lash
         Telefon : ${userContact}
         Telegram: @${username}
         Narxi: ${(parseFloat(product.price_usd) * currency).toFixed(2)} so'm
         Kompaniyasi: ${product.company}
         Diametri:${product.diameter}
         O'lchami:${product.size}
         Uzunligi:${product.width}`;

        await ctx.telegram.sendPhoto(
          ctx.chat.id,
          { source: "./public/images/" + product.image },
          { caption: orderMessage }
        );
      }
    });
  } else {
    return ctx.reply("Buyurtmalar topilmadi");
  }
});

// Handler for the "Locations📍" button and /locations command
bot.command("locations", handleLocations);
bot.hears("Manzillarimiz📍", handleLocations);

async function handleLocations(ctx) {
  try {
    const locations = await fetchLocations(API_URL);
    const locationsByRegion = groupLocationsByRegion(locations);

    if (Object.keys(locationsByRegion).length === 0) {
      return ctx.reply("No regions or locations found.");
    }

    const keyboard = Markup.keyboard([
      ...Object.keys(locationsByRegion).map((region) => [region]),
      ["Back to Main Menu"],
    ]).resize();

    await ctx.reply("Choose a region:", keyboard);

    // Store the grouped locations in session for later use
    ctx.session = {
      ...ctx.session,
      locationsByRegion,
      state: "selecting_region",
    };
  } catch (err) {
    console.error("Error in Locations📍 handler:", err);
    await ctx.reply("Sorry, there was an error fetching locations.");
  }
}

// Handler for region selection and back button
bot.hears(/.+/, async (ctx) => {
  const messageText = ctx.message.text;

  if (messageText === "Back to Main Menu") {
    ctx.session.state = null;
    return sendMainMenu(ctx);
  }

  const { locationsByRegion, state } = ctx.session || {};

  if (
    state === "selecting_region" &&
    locationsByRegion &&
    locationsByRegion[messageText]
  ) {
    const locationsInRegion = locationsByRegion[messageText];
    const keyboard = Markup.keyboard([
      ...locationsInRegion.map((loc) => [loc.name]),
      ["Back to Regions"],
      ["Back to Main Menu"],
    ]).resize();

    await ctx.reply(`Choose a location in ${messageText}:`, keyboard);

    // Store the selected region in session
    ctx.session = {
      ...ctx.session,
      selectedRegion: messageText,
      state: "selecting_location",
    };
  } else if (messageText === "Back to Regions") {
    return handleLocations(ctx);
  } else if (state === "selecting_location") {
    // This might be a location name, so let's check
    await handlePossibleLocation(ctx);
  }
});

// Function to handle possible location selection
async function handlePossibleLocation(ctx) {
  const messageText = ctx.message.text;
  const { locationsByRegion, selectedRegion } = ctx.session || {};

  if (!locationsByRegion || !selectedRegion) {
    return; // Exit if we don't have the necessary session data
  }

  const locationsInRegion = locationsByRegion[selectedRegion];
  const location = locationsInRegion.find(
    (loc) => loc.name.toLowerCase() === messageText.toLowerCase()
  );

  if (location) {
    try {
      if (isValidUrl(location.link)) {
        await ctx.reply(`${location.name}: ${location.link}`);
      }
      const coords = parseCoordinates(location.link);

      if (coords) {
        await ctx.replyWithLocation(coords.latitude, coords.longitude);
      } else {
        await ctx.reply(`Unable to process location for ${location.name}.`);
      }
    } catch (err) {
      console.error(`Error sending location ${location.name}:`, err);
      await ctx.reply(
        `Sorry, there was an error sending the location for ${location.name}.`
      );
    }
  } else {
    // Optional: respond if the message doesn't match any location
    await ctx.reply(
      "I didn't recognize that location name. Please choose from the provided options."
    );
  }
}

bot.catch(async (err, ctx) => {
  if (err) {
    console.log(err, ctx);
    await ctx.leaveChat();
    return;
  }
});

bot.use(async (ctx, err) => {
  try {
    if (!err) await ctx.reply("Command not found!", mainMenu);
    return;
  } catch (err) {
    console.error("Error:", err);
    return;
  }
});

async function getCurrency() {
  const res = await axios.get(API_URL + "/api/currency");
  const currency = res.data.data.val;
  return currency;
}
