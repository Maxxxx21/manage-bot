import { Scenes, Telegraf, } from "telegraf"; 
import { MyContext, SessionData } from "../utils/types";
import { createManagerKeybord } from "../Repository/adminRepository";
import { keyboards } from "../utils/keyboards"; 
import { exitFunction } from "../utils/exitFunction";

const pass: string = 'admin';

export const adminDeleteManagerScene = new Scenes.WizardScene<MyContext>(
    "adminDeleteManagerScene",
    // async (ctx) => {
    //     const userId = await ctx.repository.getUser(ctx.from!.id);
    //     const roleManagerId = await ctx.repository.getRoleIdByName(`👨‍💼Админ`);
    //     const isManager = await ctx.repository.checkRegisteredUser(userId, roleManagerId as number);

    //     if (!isManager) {
    //         await ctx.reply(`Эта опция доступна только для 👨‍💼Админа. Чтобы продолжить, пожалуйста, зарегистрируйтесь, отправив команду: /register.`);
    //         return ctx.scene.leave();
    //     } else if (isManager) {
    //         return ctx.wizard.next();
    //     }
    // },
    // async (ctx) => {
    //     await ctx.reply(`🔒 Введите пароль: `, keyboards.exitKeyboard);
    //     return ctx.wizard.next();
    // },

    // async (ctx) => {
    //     if (!ctx.message || !('text' in ctx.message)) {
    //         await ctx.reply(`Произошла ошибка. Выходим в меню.`, keyboards.startKeyboard);
    //         return ctx.scene.leave();
    //     };

    //     if(await exitFunction(ctx, ctx.message.text)) return ctx.scene.leave();

    //     if (ctx.message.text !== pass) {
    //         await ctx.reply(`❌ Неверный пароль. Попробуйте заново.`);
    //         return;
    //     } else if( ctx.message.text === pass) {
    //         const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
    //         const keyboard = createManagerKeybord(allManagers);
    //         await ctx.reply(`✅ Пароль верный.`);
    //         await ctx.reply(`Какого менеджера будем удалять?`, keyboard);

    //         return ctx.wizard.next(); 
    //     }
    // },

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
        };

        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            return ctx.scene.leave();
        }

        const allManagers = await ctx.adminRepository.getAllManagersForAdmin();
        const keyboard = createManagerKeybord(allManagers);

        // const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        // if(exitFunctionResult) {
        //     return ctx.scene.leave();
        // }

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

        const deactivateUser = await ctx.adminRepository.doActivateOrDeactivateUser(managerId, false);
        
        if (!deactivateUser) {
            console.error(`Произошла ошибка при удалении пользователя.`);
            await ctx.reply(`❌ Произошла ошибка, попробуйте заново.`, keyboard);
        } 

        await ctx.reply(`🗑️↩️ Менеджер ${managerId} был успешно удален ✅. \n\n➡️ Выберите роль для дальнейших действий:`, keyboards.startKeyboard);
        return ctx.scene.leave(); 
    }
);