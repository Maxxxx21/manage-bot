import { Scenes, Telegraf, } from "telegraf"; 
import { MyContext, SessionData } from "../utils/types";
import { createManagerKeybord } from "../Repository/adminRepository";
import { keyboards } from "../utils/keyboards"; 

export const adminDeleteManagerScene = new Scenes.WizardScene<MyContext>(
    "adminDeleteManagerScene", 
    async (ctx) => {
        const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
        const keyboard = createManagerKeybord(allManagers);
        await ctx.reply(`Какого менеджера будем удалять?`, keyboard);
        return ctx.wizard.next(); 
    },

    async (ctx) => {
        
        if(!ctx.message || !('text' in ctx.message)) {
            console.error(`Произошла ошибка при передачи id менеджера на шаге 0`);
            await ctx.reply(`❌ Проиошла ошибка. Вы вышли в главное меню.`);
            await ctx.reply(`➡️ Выберите роль для дальнейших действий: `, keyboards.startKeyboard);
            return ctx.scene.leave();
        }

        const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
        const keyboard = createManagerKeybord(allManagers);

        if(ctx.message.text === '🚪Выйти') {
            await ctx.reply(`🔙 Выходим...`, keyboard);
            return ctx.scene.leave();
        }

        const managerIdUserInput: string = ctx.message.text;
        const managerIdUnprocessed: string[] = managerIdUserInput.split(' ');
        const managerId: number = Number(managerIdUnprocessed[1]);
        const roleId: number | null = await ctx.repository.getRoleIdByName('👨‍💼Менеджер');
        
        if(isNaN(managerId)) {
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

        if(!deleteUserRoleResult) { 
            console.error(`Произошла ошибка при удалении роли.`);
            await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
            return ctx.scene.reenter();
        }

        const deleteUserResult = await ctx.adminRepository.deleteUser(managerId);
        
        if (!deleteUserResult) {
            console.error(`Произошла ошибка при удалении пользователя.`);
            await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
        } 

        await ctx.reply(`✅ Менеджер ${managerId} был успешно удален. \n\n➡️ Выберите роль для дальнейших действий:`, keyboards.startKeyboard);
        return ctx.scene.leave(); 
    }
);