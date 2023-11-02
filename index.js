import { config } from "dotenv";
import { Telegraf, Scenes, session, Markup } from "telegraf";
import connectDb from "./connectDb.js";

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
      await ctx.reply("Menu", Markup.keyboard(["Buyurtmalarim", Markup.button.webApp("Buyurtma berish", WEBAPP_URL + `?userContact=${ctx.session.user}&username=${ctx.message.from.username}`)]).resize())
    }
  }

});


bot.on("contact", async (ctx) => {
  const contact = ctx.message.contact.phone_number;
  ctx.session.user = contact;
  await ctx.reply("Menu", Markup.keyboard(["Buyurtmalarim", Markup.button.webApp("Buyurtma berish", WEBAPP_URL + `?userContact=${ctx.session.user}&username=${ctx.message.from.username}`)]).resize())
});

bot.hears("Buyurtmalarim", async (ctx) => {
  const res = await fetch(API_URL + `/api/orders/${ctx.session.user}`, {
    method: "GET",
  });
  if (res.status != 204) {
    const orders = await res.json();
    console.log(orders);
  } else {
    await ctx.reply("Sizda hozircha buyurtmalar mavjud emas");
  }
});




bot.on("my_chat_member", async (ctx) => {
  console.log(ctx.chat.id);
})


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



