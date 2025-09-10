"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRolesButtonScene = void 0;
const telegraf_1 = require("telegraf");
const keyboards_1 = require("../utils/keyboards");
exports.MyRolesButtonScene = new telegraf_1.Scenes.WizardScene(`MyRolesButtonScene`, async (ctx) => {
    const userId = await ctx.repository.getUser(ctx.from.id);
    const roleManagerId = await ctx.repository.getRoleIdByName(`👨‍💼Менеджер`);
    const roleDroperId = await ctx.repository.getRoleIdByName(`⛑️Дропер`);
    if (!userId) {
        await ctx.reply(`😟 У Вас нет ролей. Пожалуйста, зарегистрируйтесь. 😟`, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    const existsManager = await ctx.repository.checkRegisteredUser(userId, roleManagerId);
    const existsDroper = await ctx.repository.checkRegisteredUser(userId, roleDroperId);
    let message = `📝 Ваши роли:\n\n`;
    if (existsManager && existsDroper) {
        message += `👨‍💼Менеджер: ${userId}\n🕺🏽 Дроппер: ${userId}`;
    }
    else if (existsManager) {
        message += `👨‍💼Менеджер: ${userId}`;
    }
    else if (existsDroper) {
        message += `🕺🏽Дропер: ${userId}`;
    }
    else {
        message = `😟 У Вас нет ролей. Пожалуйста, зарегистрируйтесь. 😟`;
    }
    await ctx.reply(message);
    await ctx.reply(`➡️ Выберите роль для дальнейших действий:`, keyboards_1.keyboards.startKeyboard);
    return ctx.scene.leave();
});
