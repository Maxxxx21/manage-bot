"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminDeleteManagerScene = void 0;
const telegraf_1 = require("telegraf");
const adminRepository_1 = require("../Repository/adminRepository");
const keyboards_1 = require("../utils/keyboards");
exports.adminDeleteManagerScene = new telegraf_1.Scenes.WizardScene("adminDeleteManagerScene", async (ctx) => {
    const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
    const keyboard = (0, adminRepository_1.createManagerKeybord)(allManagers);
    await ctx.reply(`Какого менеджера будем удалять?`, keyboard);
    return ctx.wizard.next();
}, async (ctx) => {
    if (!ctx.message || !('text' in ctx.message)) {
        console.error(`Произошла ошибка при передачи id менеджера на шаге 0`);
        await ctx.reply(`❌ Проиошла ошибка. Вы вышли в главное меню.`);
        await ctx.reply(`➡️ Выберите роль для дальнейших действий: `, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
    const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
    const keyboard = (0, adminRepository_1.createManagerKeybord)(allManagers);
    if (ctx.message.text === '🚪Выйти') {
        await ctx.reply(`🔙 Выходим...`, keyboard);
        return ctx.scene.leave();
    }
    const managerIdUserInput = ctx.message.text;
    const managerIdUnprocessed = managerIdUserInput.split(' ');
    const managerId = Number(managerIdUnprocessed[1]);
    const roleId = await ctx.repository.getRoleIdByName('👨‍💼Менеджер');
    if (isNaN(managerId)) {
        if (isNaN(managerId)) {
            await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
            return ctx.scene.reenter();
        }
    }
    if (roleId === null) {
        console.error(`Произошла ошибка при получении роли менеджера.`);
        await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
        return ctx.scene.reenter();
    }
    const deleteUserRoleResult = await ctx.adminRepository.deleteUserRole(managerId, roleId);
    if (!deleteUserRoleResult) {
        console.error(`Произошла ошибка при удалении роли.`);
        await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
        return ctx.scene.reenter();
    }
    const deleteUserResult = await ctx.adminRepository.deleteUser(managerId);
    if (!deleteUserResult) {
        console.error(`Произошла ошибка при удалении пользователя.`);
        await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
    }
    await ctx.reply(`✅ Менеджер ${managerId} был успешно удален. \n\n➡️ Выберите роль для дальнейших действий:`, keyboards_1.keyboards.startKeyboard);
    return ctx.scene.leave();
});
