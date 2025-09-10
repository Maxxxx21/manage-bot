"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRegistrationScene = void 0;
const telegraf_1 = require("telegraf");
const keyboards_1 = require("../utils/keyboards");
const exitFunction_1 = require("../utils/exitFunction");
exports.userRegistrationScene = new telegraf_1.Scenes.WizardScene(`userRegistrationScene`, async (ctx) => {
    await ctx.reply(`👉 Выберите роль для регистрации: `, keyboards_1.keyboards.userRegistrationKeyboard);
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`❌ Произошла ошибка. Пожалуйста, попробуйте еще раз.`);
        return;
    }
    const role = ctx.message.text;
    const roles = ["👨‍💼Менеджер", "⛑️Дропер", '👨‍💼Админ'];
    if (!roles.includes(role)) {
        await ctx.reply(`⚠️ Пожалуйста, выберите роль из предложенных.`);
        return ctx.wizard.back();
    }
    await ctx.reply(`🔒 Введите пароль для регистрации: `);
    const wizardState = ctx.wizard.state;
    wizardState.role = role;
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        await ctx.reply(`❌ Произошла ошибка. Попробуйте заново.`);
        return ctx.scene.reenter();
    }
    ;
    if (await (0, exitFunction_1.exitFunction)(ctx, ctx.message.text))
        return ctx.scene.leave();
    if (!ctx.from) {
        console.error(`Не удалось получить информацию о пользователе. (ctx.from)`);
        return;
    }
    const wizardState = ctx.wizard.state;
    const role = wizardState.role;
    const telegram_id = ctx.from.id;
    let userId;
    try {
        const existingUser = await ctx.repository.getUser(telegram_id);
        if (existingUser) {
            userId = existingUser;
        }
        else {
            const newUser = await ctx.repository.addUser(telegram_id);
            if (!newUser)
                throw new Error(`Не удалось добавить нового пользователя.`);
            userId = newUser.id;
        }
    }
    catch (error) {
        console.error(`Не удалось получить ID существующего пользователя`, error);
        await ctx.reply(`❌ Произошла ошибка. Попробуйте позже.`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    const password = ctx.message.text;
    const roleId = await ctx.repository.getRoleIdByName(role);
    console.log(userId);
    console.log(userId);
    console.log(userId);
    console.log(userId);
    if (!userId) {
        console.error(`Не удалось получить User Id для регистрации.`);
        await ctx.reply(`❌ Произошла ошибка. Пожалуйста, попробуйте заново.`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    if (!roleId) {
        console.error(`Произошла ошибка с ролью.`);
        await ctx.reply(`❌ Попробуйте позже. \n\n➡️ Выберите дальнейшие действия: `, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    if ((role === "👨‍💼Менеджер" && password !== 'man') || (role === "⛑️Дропер" && password !== 'drop') || (role === '👨‍💼Админ' && password !== 'admin')) {
        await ctx.reply(`❌ Неверный пароль. Попробуйте еще раз: `);
        return ctx.wizard.selectStep(1); // Шаг с вводом пароля
    }
    try {
        const isRegistered = await ctx.repository.getUserWithRole(userId, roleId);
        if (isRegistered) {
            await ctx.reply(`ℹ️ Вы уже зарегистрированы как ${role}.`);
            await ctx.reply(`➡️ Выберите дальнейшие действия: `, keyboards_1.keyboards.startKeyboard);
            console.log(`Юзер ${userId} уже был зарегистрирован как ${role}.`);
            return ctx.scene.leave();
        }
        else {
            const addRoleToUser = await ctx.repository.addRoleToUser(userId, role);
            if (addRoleToUser) {
                await ctx.reply(`✅ Вы успешно зарегистрировались как ${role}.`);
                console.log(`Новый пользователь ${userId} зарегистрировался как ${role}.`);
                await ctx.reply(`🚪 Выберите дальнейшие действия: `, keyboards_1.keyboards.startKeyboard);
                return ctx.scene.leave();
            }
            else {
                await ctx.reply(`❌ Ошибка.`);
                return ctx.scene.leave();
            }
        }
    }
    catch (error) {
        console.error(`Не удалось зарегистрироваться.`, error);
        await ctx.reply(`❌ Произошла ошибка во время регистрации. Попробуйте позже.`);
        return ctx.scene.leave();
    }
    // await ctx.reply(`🚪 Выберите дальнейшие действия: `, keyboards.startKeyboard);
    // return ctx.scene.leave();
});
