const express = require("express");
const { Telegraf, Markup } = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const PORT = process.env.PORT || 10000;
let siteEnabled = true;

app.get("/", (req, res) => {
  res.json({ ok: true, siteEnabled });
});

app.get("/api/status", (req, res) => {
  res.json({ enabled: siteEnabled });
});

const OWNER_ID = process.env.OWNER_ID;

function isOwner(ctx) {
  return String(ctx.from.id) === String(OWNER_ID);
}

const menu = () =>
  Markup.inlineKeyboard([
    [
      Markup.button.callback("🟢 Включить", "SITE_ON"),
      Markup.button.callback("🔴 Выключить", "SITE_OFF")
    ],
    [Markup.button.callback("📊 Статус", "SITE_STATUS")]
  ]);

bot.start(async (ctx) => {
  if (!isOwner(ctx)) return ctx.reply("⛔ У тебя нет доступа.");
  await ctx.reply("🌐 Управление сайтом", menu());
});

bot.action("SITE_ON", async (ctx) => {
  if (!isOwner(ctx)) return;
  siteEnabled = true;
  await ctx.answerCbQuery("Сайт включён");
  await ctx.editMessageText("🟢 Сайт включён\n\nСайт снова работает.", menu());
});

bot.action("SITE_OFF", async (ctx) => {
  if (!isOwner(ctx)) return;
  siteEnabled = false;
  await ctx.answerCbQuery("Сайт выключен");
  await ctx.editMessageText(
    "🔴 Сайт выключен\n\nПосетители увидят страницу технических работ.",
    menu()
  );
});

bot.action("SITE_STATUS", async (ctx) => {
  if (!isOwner(ctx)) return;
  await ctx.answerCbQuery();
  await ctx.reply(siteEnabled ? "🟢 Сейчас сайт работает." : "🔴 Сейчас сайт выключен.");
});

bot.catch((err) => console.error("Telegram bot error:", err));

bot.launch().then(() => {
  console.log("Telegram bot started");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
