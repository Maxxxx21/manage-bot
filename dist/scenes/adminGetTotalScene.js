"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminGetTotalScene = void 0;
const telegraf_1 = require("telegraf");
const keyboards_1 = require("../utils/keyboards");
const exitFunction_1 = require("../utils/exitFunction");
const adminRepository_1 = require("../Repository/adminRepository");
const parseSingleDate = (dateInput) => {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.([0-9]{4})$/;
    if (!dateRegex.test(dateInput))
        return null;
    const [day, month, year] = dateInput.split('.');
    return `${year}-${month}-${day}`;
};
const processDateInput = (dateInput) => {
    if (dateInput.includes('-')) {
        const dates = dateInput.split('-').map(d => d.trim());
        if (dates.length !== 2)
            return null;
        const startDate = parseSingleDate(dates[0]);
        const endDate = parseSingleDate(dates[1]);
        if (!startDate || !endDate)
            return null;
        if (new Date(startDate) > new Date(endDate))
            return null;
        return { startDate, endDate };
    }
    else {
        const singleDate = parseSingleDate(dateInput);
        if (!singleDate)
            return null;
        return { startDate: singleDate, endDate: singleDate };
    }
};
const formatedDateTime = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const formattedDate = `${day}.${month}.${year}`;
    const formattedTime = `${hours}:${minutes}`;
    return { formattedDate, formattedTime };
};
exports.adminGetTotalScene = new telegraf_1.Scenes.WizardScene("adminGetTotalScene", async (ctx) => {
    const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
    const keyboard = (0, adminRepository_1.createManagerKeybord)(allManagers);
    await ctx.reply(`👨‍💼 Статистику какого менеджера будем смотреть?`, keyboard);
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`❌ Произошла ошибка. Попробуйте все заново.`, keyboards_1.keyboards.adminActionsKeyboard);
        console.error(`Произошла ошибка при переходе между шагами сцены. Шаг 0.`);
        return ctx.scene.leave();
    }
    if (await (0, exitFunction_1.exitFunction)(ctx, ctx.message.text))
        return;
    const wizardState = ctx.wizard.state;
    const managerToGetTotal = ctx.message.text;
    const manager = managerToGetTotal.split(` `);
    const id = Number(manager[1]);
    wizardState.id = id;
    if (isNaN(id)) {
        await ctx.reply(`❌ Произошла ошибка. Повторите все заново.`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    await ctx.reply(`📊 Выберите тип депозита: `, keyboards_1.keyboards.fdOrRdTotalKeyboard);
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`❌ Произошла ошибка. Попробуйте еще раз.`, keyboards_1.keyboards.startKeyboard);
        console.error(`Произошла ошибка при переходе между шагами сцены. Шаг 1.`);
        return;
    }
    if (await (0, exitFunction_1.exitFunction)(ctx, ctx.message.text))
        return;
    const fdOdRdOrTotal = ctx.message.text.toLowerCase();
    const wizardState = ctx.wizard.state;
    if (fdOdRdOrTotal === 'fd') {
        wizardState.fd_rd_total = 'fd';
        await ctx.reply(`✍️ Введите одиночную дату/период в формате:\n\nОдиночная дата: ДД.ММ.ГГГГ\n\nПериод: ДД.ММ.ГГГГ-ДД.ММ.ГГГГ: `, keyboards_1.keyboards.exitKeyboard);
        return ctx.wizard.next();
    }
    else if (fdOdRdOrTotal === 'rd') {
        wizardState.fd_rd_total = 'rd';
        await ctx.reply(`✍️ Введите одиночную дату/период в формате:\n\nОдиночная дата: ДД.ММ.ГГГГ\n\nПериод: ДД.ММ.ГГГГ-ДД.ММ.ГГГГ: `, keyboards_1.keyboards.exitKeyboard);
        return ctx.wizard.next();
    }
    else if (fdOdRdOrTotal === 'общая сумма') {
        wizardState.fd_rd_total = 'total';
        await ctx.reply(`✍️ Введите одиночную дату/период в формате:\n\nОдиночная дата: ДД.ММ.ГГГГ\n\nПериод: ДД.ММ.ГГГГ-ДД.ММ.ГГГГ: `, keyboards_1.keyboards.exitKeyboard);
        return ctx.wizard.next();
    }
    else {
        await ctx.reply(`❌ Произошла ошибка. Попробуйте с самого начала.`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`❌ Ошибка. Начните все заново.`);
        await ctx.reply(`➡️ Выберите роль: `, keyboards_1.keyboards.startKeyboard);
        console.error(`Произошла ошибка при переходе между шагами сцены. Шаг 2.`);
        return ctx.scene.leave();
    }
    if (await (0, exitFunction_1.exitFunction)(ctx, ctx.message.text))
        return;
    const userInput = ctx.message.text;
    const date = processDateInput(userInput);
    const wizardState = ctx.wizard.state;
    const fd_rd_total = wizardState.fd_rd_total;
    const id = wizardState.id;
    if (!date) {
        await ctx.reply(`❌ Произошла ошибка при вводе даты. Попробуйте с самого начала.`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    if (fd_rd_total === 'fd' || fd_rd_total === 'rd') {
        const orderAmount = await ctx.adminRepository.getTotalFdOrRdAmountbyManager(id, fd_rd_total, date.startDate, date.endDate);
        const orders = await ctx.adminRepository.getAllFdOrRdOrdersByManager(id, fd_rd_total, date.startDate, date.endDate);
        const totalAmount = orderAmount?.total_fd_amount || 0;
        const fd_rd_display = fd_rd_total.toUpperCase();
        let message = `👨‍💼 Менеджер ${id}\n`;
        message += `✍️ Тип: ${fd_rd_display}\n`;
        message += `💰 Общая сумма: ${totalAmount} €\n`;
        message += `🗓️ Период: ${date.startDate} - ${date.endDate}\n\n`;
        message += `📋 Список Ордеров:\n\n`;
        orders.forEach((order) => {
            const dateTime = formatedDateTime(order.created_at);
            message += `- №${order.id} | ${(order.fd_rd).toUpperCase()} | ${order.cardholder_name} | ${order.amount} € | ${dateTime.formattedDate} ${dateTime.formattedTime}\n`;
        });
        await ctx.reply(message);
        await ctx.reply(`➡️ Выберите роль:`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    else if (wizardState.fd_rd_total === 'total') {
        const orderAmount = await ctx.adminRepository.getTotalAmountByManager(id, date.startDate, date.endDate);
        const orders = await ctx.adminRepository.getAllOrdersByManager(id, date.startDate, date.endDate);
        const totalAmount = orderAmount.total_amount;
        let message = `👨‍💼 Менеджер ${id}\n`;
        message += `📊 Тип: Общая\n`;
        message += `💰 Общая сумма: ${totalAmount} €\n`;
        message += `🗓️ Период: ${userInput}\n\n`;
        message += `📋 Список Ордеров:\n\n`;
        orders.forEach((order) => {
            const dateTime = formatedDateTime(order.created_at);
            message += `- №${order.id} | ${(order.fd_rd).toUpperCase()} | ${order.cardholder_name} | ${order.amount} € | ${dateTime.formattedDate} ${dateTime.formattedTime}\n`;
        });
        await ctx.reply(message);
        await ctx.reply(`🚪 Возвращаемся в главное меню...`);
        await ctx.reply(`➡️ Выберите роль:`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    else {
        await ctx.reply(`❌ Произошла ошибка. Попробуйте с самого начала.`, keyboards_1.keyboards.startKeyboard);
        console.error(`Произошла ошибка при подсчете суммы менеджеров. `);
        return ctx.scene.leave();
    }
});
