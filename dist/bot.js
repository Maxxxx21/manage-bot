"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
require("dotenv/config");
const createOrder_1 = require("./scenes/createOrder");
const userRegistrationScene_1 = require("./scenes/userRegistrationScene");
const repository_1 = require("./Repository/repository");
const keyboards_1 = require("./utils/keyboards");
const db_1 = require("./utils/db");
const token = process.env["BOT_TOKEN"];
if (!token) {
    console.error(`Какие то проблемы с токеном.`);
    process.exit(1);
}
;
const orderRepository = new repository_1.Repository(db_1.pool);
const bot = new telegraf_1.Telegraf(token);
console.log(`Бот успешно запускается.`);
const stage = new telegraf_1.Scenes.Stage([createOrder_1.createOrderScene, userRegistrationScene_1.userRegistrationScene]);
bot.use((0, telegraf_1.session)());
bot.use(stage.middleware());
bot.use((ctx, next) => {
    ctx.repository = orderRepository;
    return next();
});
bot.on('callback_query', (ctx) => {
    const callbackData = 'data' in ctx.callbackQuery ? ctx.callbackQuery.data : '';
    if (callbackData && callbackData.startsWith(`take_order_`)) {
        return ctx.scene.enter(`takeOrderScene`);
    }
    ;
});
bot.command(`createorder`, (ctx) => {
    return ctx.scene.enter(`createOrderScene`);
});
bot.start(async (ctx) => {
    let username = ctx.from?.username || ctx.from?.first_name;
    await ctx.reply(`Приветствую, ${username}! \nВыбери свою роль: `, keyboards_1.keyboards.startKeyboard);
});
bot.command(`register`, (ctx) => {
    return ctx.scene.enter(`userRegistrationScene`);
});
bot.hears("Менеджер", (ctx) => {
    ctx.scene.enter(`createOrderScene`);
});
bot.launch();
