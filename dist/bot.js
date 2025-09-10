"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
require("dotenv/config");
const createOrder_1 = require("./scenes/createOrder");
const userRegistrationScene_1 = require("./scenes/userRegistrationScene");
const repository_1 = require("./Repository/repository");
const keyboards_1 = require("./utils/keyboards");
const db_1 = require("./utils/db");
const adminRepository_1 = require("./Repository/adminRepository");
const adminScene_1 = require("./scenes/adminScene");
const adminGetTotalScene_1 = require("./scenes/adminGetTotalScene");
const dropperScene_1 = require("./scenes/dropperScene");
const adminDeleteManagerScene_1 = require("./scenes/adminDeleteManagerScene");
const droperGetAllOpenOrdersScene_1 = require("./scenes/droperGetAllOpenOrdersScene");
const myRolesButtonScene_1 = require("./scenes/myRolesButtonScene");
const token = process.env["BOT_TOKEN"];
if (!token) {
    console.error(`Какие то проблемы с токеном.`);
    process.exit(1);
}
;
const orderRepository = new repository_1.Repository(db_1.pool);
const admin_Repository = new adminRepository_1.adminRepository(db_1.pool);
const bot = new telegraf_1.Telegraf(token);
console.log(`Бот успешно запускается.`);
const stage = new telegraf_1.Scenes.Stage([createOrder_1.createOrderScene, userRegistrationScene_1.userRegistrationScene, adminScene_1.adminScene, adminGetTotalScene_1.adminGetTotalScene, dropperScene_1.droperScene, adminDeleteManagerScene_1.adminDeleteManagerScene, droperGetAllOpenOrdersScene_1.droperGetAllOpenOrdersScene, myRolesButtonScene_1.MyRolesButtonScene]);
bot.use((0, telegraf_1.session)());
bot.use((ctx, next) => {
    ctx.repository = orderRepository;
    return next();
});
bot.use((ctx, next) => {
    ctx.adminRepository = admin_Repository;
    return next();
});
bot.use(stage.middleware());
bot.command(`createorder`, (ctx) => {
    return ctx.scene.enter(`createOrderScene`);
});
bot.command(`menu`, async (ctx) => {
    await ctx.scene.leave();
    return ctx.reply(`➡️ Выберите роль для дальнейших действий:`, keyboards_1.keyboards.startKeyboard);
});
bot.start(async (ctx) => {
    let username = ctx.from?.username || ctx.from?.first_name;
    await ctx.reply(`Приветствую, ${username}! \nВыбери свою роль: `, keyboards_1.keyboards.startKeyboard);
});
bot.command(`register`, (ctx) => {
    return ctx.scene.enter(`userRegistrationScene`);
});
bot.hears("👨‍💼Менеджер", (ctx) => {
    return ctx.scene.enter(`createOrderScene`);
});
bot.hears("⛑️Дропер", (ctx) => {
    return ctx.scene.enter('droperGetAllOpenOrdersScene');
});
bot.hears('👨‍💼Админ', (ctx) => {
    return ctx.scene.enter(`adminScene`);
});
bot.hears('🕺🏽Мои роли', (ctx) => {
    return ctx.scene.enter(`MyRolesButtonScene`);
});
bot.action(/take_order_(\d+)/, async (ctx) => {
    const match = ctx.match;
    const orderId = parseInt(match[1], 10);
    const telegram_id = ctx.from.id;
    const dropperRoleId = await ctx.repository.getRoleIdByName('Дропер');
    if (dropperRoleId === null) {
        await ctx.reply(`❌ Произошла ошибка. `);
        return;
    }
    ;
    const getIdFromUsers = await ctx.repository.getUser(telegram_id);
    const checkRegisteredUser = await ctx.repository.checkRegisteredUser(getIdFromUsers, dropperRoleId);
    if (!checkRegisteredUser) {
        await ctx.reply(`❌ Вы не зарегистрированы как "Дропер".`);
        return;
    }
    ;
    ctx.session.orderId = orderId;
    return ctx.scene.enter(`droperScene`);
});
bot.launch();
