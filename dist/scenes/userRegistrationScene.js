"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegistrationScene = void 0;
const telegraf_1 = require("telegraf");
exports.userRegistrationScene = new telegraf_1.Scenes.WizardScene(`userRegistrationScene`, async (ctx) => {
    await ctx.reply(`Выберите роль для регистрации: `, telegraf_1.Markup.keyboard([
        ['Менеджер', 'Дропер'],
        ['Админ']
    ]).resize().oneTime());
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`Произошла ошибка. Попробуйте еще раз, пожалуйста.`);
        return;
    }
    ;
    const role = ctx.message.text;
    const wizardState = ctx.wizard.state;
    wizardState.role = role;
    if (role === 'Менеджер') {
        await ctx.reply(`Введите пароль: `);
        return ctx.wizard.next();
    }
    else if (role === 'Дропер') {
        await ctx.reply(`Введите пароль: `);
        return ctx.wizard.next();
    }
    else if (role === 'Админ') {
        await ctx.reply(`Введите пароль: `);
        return ctx.wizard.next();
    }
    else {
        await ctx.reply(`Повторите попытку заново.`);
        return;
    }
}, console.log(`pidor`), async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`Произошла ошибка. Введите пароль еще раз, пожалуйста.`);
        return;
    }
    ;
    if (!ctx.from) {
        console.error(`Не удалось получить информацию о пользователе. (ctx.from)`);
        return;
    }
    if (!ctx.chat) {
        console.error(`Не удалось получить информацию о пользователе. (ctx.chat)`);
        return;
    }
    const wizardState = ctx.wizard.state;
    const role = wizardState.role;
    const pass = ctx.message.text;
    const telegram_id = ctx.from.id;
    let chat_id;
    let isRegistered = false;
    let nextScene = null;
    if (telegram_id === undefined) {
        chat_id = ctx.chat.id;
    }
    ;
    if (!role) {
        await ctx.reply(`Произошла ошибка. Роль не определена.`);
        return;
    }
    ;
    switch (pass) {
        case `man`:
            if (role === 'Менеджер') {
                nextScene = `createOrderScene`;
                isRegistered = true;
            }
            break;
        case 'drop':
            if (role === 'Дропер') {
                isRegistered = true;
            }
            ;
            break;
        case `admin`:
            if (role === 'Админ') {
                isRegistered = true;
            }
            break;
        default:
            await ctx.reply(`Ошибка. Введите корректный пароль.`);
            return;
    }
    if (isRegistered && telegram_id) {
        await ctx.repository.userRegistration(telegram_id, role);
        await ctx.reply(`Вы успешно зарегистрированы как ${role}.`);
        if (nextScene) {
            return ctx.scene.enter(nextScene);
        }
        else {
            return ctx.scene.leave();
        }
    }
    else {
        await ctx.reply(`Ошибка регистрации. Попробуйте еще раз.`);
        return ctx.scene.reenter();
    }
});
