"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboards = void 0;
const telegraf_1 = require("telegraf");
exports.keyboards = {
    startKeyboard: telegraf_1.Markup.keyboard([
        ["👨‍💼Менеджер", "⛑️Дропер"],
        ['👨‍💼Админ', '🕺🏽Мои роли']
    ]).resize().oneTime(),
    adminGetTotalOrderAmountOfManager: telegraf_1.Markup.keyboard([
        ['FD', 'RD'],
        ['FD и RD']
    ]).resize().oneTime(),
    userRegistrationKeyboard: telegraf_1.Markup.keyboard([
        ["👨‍💼Менеджер", "⛑️Дропер"],
        ['👨‍💼Админ', '🚪Выйти']
    ]).resize().oneTime(),
    adminActionsKeyboard: telegraf_1.Markup.keyboard([
        ['🗑️ Удалить менеджера', '📊 Просмотр статистики менеджера'],
        ['🚪 Выйти']
    ]).resize().oneTime(),
    exitKeyboard: telegraf_1.Markup.keyboard([
        ['🚪 Выйти']
    ]).resize().oneTime(),
    fdOrRdTotalKeyboard: telegraf_1.Markup.keyboard([
        ['FD', 'RD'],
        ['Общая сумма', '🚪 Выйти']
    ]).resize().oneTime(),
    confirmKeyboard: telegraf_1.Markup.keyboard([
        ['Подтвердить', '🚪 Выйти']
    ]).resize().oneTime(),
    actionWithOrderKeyboard: telegraf_1.Markup.keyboard([
        ['Прислать фото', 'Отправить комментарий']
    ]).resize().oneTime(),
    fdOrRDKeyboard: telegraf_1.Markup.keyboard([
        ['FD', 'RD'],
        ['🚪 Выйти']
    ]).resize().oneTime(),
};
