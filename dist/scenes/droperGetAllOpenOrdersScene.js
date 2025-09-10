"use strict";
// import { Telegraf, Scenes, Markup } from "telegraf";
// import { MyContext, SessionData } from "../utils/types";
// import { Repository,  } from "../Repository/repository";
Object.defineProperty(exports, "__esModule", { value: true });
exports.droperGetAllOpenOrdersScene = void 0;
// export const droperGetAllOpenOrdersScene = new Scenes.WizardScene<MyContext> (
//     `droperGetAllOpenOrdersScene`,
// async (ctx) => {
//     const getAllOpenOrders = await ctx.repository.getAllOpenOrders();
//     if(!getAllOpenOrders) {
//         await ctx.reply(`В данный момент открытых ордеров нет.`);
//         return ctx.scene.leave();
//     }
//     await ctx.reply(`Открытые ордера: `);
//     for (let order of getAllOpenOrders) {
//         const message = `Ордер №${order.id} \n\n1. Номер карты: ${order.number}\n\n2. Тип: ${order.fd_rd}\n\n3. ФИО: ${order.cardholder_name}\n\n4. Сумма: ${order.amount} €`;
//         const keyboard = Markup.inlineKeyboard([
//             Markup.button.callback(`Взять ордер.`, `take_order_${order.id}`)
//         ])
//         await ctx.reply(message, keyboard);
//     };
//     return ctx.scene.leave();
// }
// )
const telegraf_1 = require("telegraf");
exports.droperGetAllOpenOrdersScene = new telegraf_1.Scenes.WizardScene(`droperGetAllOpenOrdersScene`, async (ctx) => {
    const userId = await ctx.repository.getUser(ctx.from.id);
    const roleDroperId = await ctx.repository.getRoleIdByName(`⛑️Дропер`);
    const isDroper = await ctx.repository.checkRegisteredUser(userId, roleDroperId);
    if (!isDroper) {
        await ctx.reply(`К сожалению, у Вас нет доступа. Зарегистрируйтесь как "⛑️Дропер", введя коменду: /register`);
        return ctx.scene.leave();
    }
    else if (isDroper) {
        return ctx.wizard.next();
    }
}, async (ctx) => {
    const getAllOpenOrders = await ctx.repository.getAllOpenOrders();
    if (getAllOpenOrders.length === 0) {
        await ctx.reply(`ℹ️ В данный момент открытых ордеров нет.`);
        return ctx.scene.leave();
    }
    await ctx.reply(`📝 Список доступных ордеров: `);
    for (let order of getAllOpenOrders) {
        const message = `✨ Ордер №${order.id}\n\n` +
            `💳 Номер карты: ${order.number}\n` +
            `✍️ Тип: ${order.fd_rd}\n` +
            `👤 ФИО: ${order.cardholder_name}\n` +
            `💵 Сумма: ${order.amount} €`;
        const keyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback(`Взять ордер`, `take_order_${order.id}`)
        ]);
        await ctx.reply(message, keyboard);
    }
    return ctx.scene.leave();
});
