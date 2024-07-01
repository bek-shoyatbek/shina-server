import { config } from "dotenv";
import { Telegraf, session, Markup } from "telegraf";
import connectDb from "./connectDb.js";
import axios from "axios";
import { getUserOrders } from "./controllers.js";


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


bot.start(async (ctx) => {
  await ctx.reply("Assalamu Alaykum", {
    reply_markup: {
      remove_keyboard: true
    }
  });

  if (ctx.chat.type == "private") {
    if (!ctx.session.user) {
      await ctx.telegram.sendMessage(ctx.chat.id, "Telefon raqamingizni jo'nating", {
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
      });
    } else {
      await ctx.reply("Menu", Markup.keyboard(["Buyurtmalarim", Markup.button.webApp("Buyurtma berish", WEBAPP_URL + `?userContact=${ctx.session.user}&username=${ctx.message.from.username}`)]).resize());
    }
  }

});


bot.on("contact", async (ctx) => {
  const userContact = ctx.message.contact.phone_number.toString().slice(3);
  ctx.session.user = userContact;
  await ctx.reply("Menu", Markup.keyboard(["Buyurtmalarim", Markup.button.webApp("Buyurtma berish", WEBAPP_URL + `?userContact=${userContact}&username=${ctx.message.from.username}`)]).resize());
});

bot.hears("Buyurtmalarim", async (ctx) => {
  const userOrders = await getUserOrders(ctx.session.user, ctx.message.from.username);
  const currency = await getCurrency();
  if (userOrders.length > 0) {
    userOrders.forEach(async order => {
      const product = order.product;
      const creditType = order.creditType;
      const userContact = order.userContact;
      const username = order.username;
      if (product) {
        let orderMessage =
          `
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
          { source: './public/images/' + product.image },
          { caption: orderMessage }
        );
      }

    })
  } else {
    return ctx.reply('Buyurtmalar topilmadi');
  }
});

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


