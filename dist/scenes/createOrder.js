"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderScene = void 0;
const telegraf_1 = require("telegraf");
exports.createOrderScene = new telegraf_1.Scenes.WizardScene(`createOrderScene`, async (ctx) => {
    await ctx.reply(`Для создания ордера введите номер карты/IBAN. `);
    return ctx.wizard.next();
}, async (ctx) => {
    if (ctx.message && 'text' in ctx.message) {
        const wizardState = ctx.wizard.state;
        wizardState.number = ctx.message.text;
        await ctx.reply(`1. ${wizardState.number} \nВведите "FD/RD" `);
        return ctx.wizard.next();
    }
    else {
        await ctx.reply(`Произошла ошибка. Пожалуйста, введите номер карты/IBAN заново.`);
        return;
    }
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`Введите "FD/RD заново. Произошла ошибка.`);
        return;
    }
    const wizardState = ctx.wizard.state;
    const fd_rd = ctx.message.text.toLowerCase();
    if (fd_rd !== 'fd' && fd_rd !== 'rd') {
        await ctx.reply(`Некорректный ввод. Введите "FD" или "RD". `);
        return;
    }
    wizardState.fd_rd = fd_rd;
    const number = wizardState.number;
    await ctx.reply(`1. ${number} \n\n2. ${fd_rd}\n\n3. Введите ФИО владельца карты:`);
    return ctx.wizard.next();
}, async (ctx) => {
    const wizardState = ctx.wizard.state;
    const fd_rd = wizardState.fd_rd;
    const number = wizardState.number;
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`Введите ФИО, пожалуйста, повторно.`);
        return;
    }
    const cardholder_name = ctx.message.text;
    wizardState.cardholder_name = cardholder_name;
    await ctx.reply(`1. ${number}\n\n2. ${fd_rd}\n\n3. ФИО: ${cardholder_name}.\n\n4. Введите сумму в формате 100.00`);
    return ctx.wizard.next();
}, async (ctx) => {
    const wizardState = ctx.wizard.state;
    const fd_rd = wizardState.fd_rd;
    const number = wizardState.number;
    const cardholder_name = wizardState.cardholder_name;
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`Введите номер карты/IBAN заново.`);
        return;
    }
    ;
    const amount = ctx.message.text;
    wizardState.amount = amount;
    await ctx.reply(`1. ${number}\n\n2. ${fd_rd}\n\n3. ФИО: ${cardholder_name} \n\n4. ${amount} \nВнимательно проверьте указанную информацию.\nЕсли все верно - нажмите "Подтвердить".`, telegraf_1.Markup.keyboard([`Подтвердить`]).resize().oneTime());
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`Произошла ошибка. Попробуйте еще раз.`, telegraf_1.Markup.keyboard([
            'Подтвердить'
        ]));
        return;
    }
    ;
    const confirm = ctx.message.text;
    if (confirm !== "Подтвердить") {
        await ctx.reply(`Ошибка.`);
        return ctx.scene.leave();
    }
    ;
    const wizardState = ctx.wizard.state;
    if (!wizardState.number && !wizardState.fd_rd && !wizardState.cardholder_name && !wizardState.amount) {
        await ctx.reply(`Нет данных для создания ордера. Попробуйте заново!`);
        return ctx.wizard.selectStep(0);
    }
    ;
    if (!ctx.from) {
        console.error(`Не удалось получить информацию о пользователе. (ctx.from)`);
        return;
    }
    const order = {
        manager_id: ctx.from.id,
        dropper_id: null,
        number: wizardState.number,
        fd_rd: wizardState.fd_rd,
        cardholder_name: wizardState.cardholder_name,
        amount: wizardState.amount,
        status: 'open',
        created_at: new Date(),
        update_at: new Date(),
    };
    try {
        const newOrder = await ctx.repository.insertOrder(order.manager_id, order.dropper_id, order.number, order.cardholder_name, order.fd_rd, order.amount);
        if (newOrder && newOrder.id) {
            await ctx.reply(`Ордер №${newOrder.id} успешно создан.`);
        }
        const AllUsersByRole = await ctx.repository.getAllUsersByRole(`Дроппер`);
        const messageText = `Новый ордер №${newOrder.id} создан:\n\n1. Номер карты: ${newOrder.number}\n\n2. Тип: ${newOrder.fd_rd}\n\n3. ФИО: ${newOrder.cardholder_name}\n\n4. Сумма: ${newOrder.amount}`;
        let successCount = 0;
        const takeOrderKeyboard = telegraf_1.Markup.inlineKeyboard([
            telegraf_1.Markup.button.callback(`Взять ордер.`, `take_order_${newOrder.id}`)
        ]);
        for (let user of AllUsersByRole) {
            try {
                ctx.telegram.sendMessage(user, messageText, takeOrderKeyboard);
                successCount++;
            }
            catch (error) {
                console.error(`Не удалось отправить сообщение пользователю ${user}:  `, error);
            }
            ;
            await ctx.reply(`Рассылка завершена! \nОтправлено сообщений: ${successCount}.`);
        }
    }
    catch (error) {
        console.error(`Ошибка во время этапа рассылки: `, error);
        await ctx.reply(`Произошла ошибка во время этапа рассылки.`);
    }
    ;
});
