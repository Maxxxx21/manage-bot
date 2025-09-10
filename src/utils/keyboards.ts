import { Markup, Telegraf } from "telegraf"; 
import { userRegistrationScene } from "../scenes/userRegistrationScene";

export const keyboards = { 
    startKeyboard: Markup.keyboard([
        ["👨‍💼Менеджер", "⛑️Дропер"],
        ['👨‍💼Админ', '🕺🏽Мои роли'] 
    ]).resize().oneTime(),

    adminGetTotalOrderAmountOfManager: Markup.keyboard([
        ['FD', 'RD'], 
        ['FD и RD']
    ]).resize().oneTime(),

    userRegistrationKeyboard: Markup.keyboard([
        ["👨‍💼Менеджер", "⛑️Дропер"],
        ['👨‍💼Админ', '🚪Выйти']
    ]).resize().oneTime(),

    adminActionsKeyboard: Markup.keyboard([
        ['🗑️ Удалить менеджера', '📊 Просмотр статистики менеджера'],
        ['🚪 Выйти']
    ]).resize().oneTime(),

    exitKeyboard: Markup.keyboard([
        ['🚪 Выйти']
    ]).resize().oneTime(), 

    fdOrRdTotalKeyboard: Markup.keyboard([
        ['FD', 'RD'], 
        ['Общая сумма', '🚪 Выйти']
    ]).resize().oneTime(), 

    confirmKeyboard: Markup.keyboard([
        ['Подтвердить', '🚪 Выйти']
    ]).resize().oneTime(),

    actionWithOrderKeyboard: Markup.keyboard([
        ['Прислать фото', 'Отправить комментарий']
    ]).resize().oneTime(),

    fdOrRDKeyboard: Markup.keyboard([
        ['FD', 'RD'], 
        ['🚪 Выйти']
    ]).resize().oneTime(),


};