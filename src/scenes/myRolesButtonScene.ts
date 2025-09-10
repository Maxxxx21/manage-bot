import { Telegraf, Scenes } from "telegraf";
import { MyContext, SessionData } from "../utils/types";
import { Repository } from "../Repository/repository";
import { keyboards } from "../utils/keyboards";

export const MyRolesButtonScene = new Scenes.WizardScene<MyContext>(
    `MyRolesButtonScene`,

    async (ctx) => {
        const userId = await ctx.repository.getUser(ctx.from!.id);
        const roleManagerId = await ctx.repository.getRoleIdByName(`👨‍💼Менеджер`);
        const roleDroperId = await ctx.repository.getRoleIdByName(`⛑️Дропер`);

        if (!userId) {
            await ctx.reply(`😟 У Вас нет ролей. Пожалуйста, зарегистрируйтесь. 😟`, keyboards.startKeyboard);
            return ctx.scene.leave();
        }

        const existsManager = await ctx.repository.checkRegisteredUser(userId, roleManagerId as number);
        const existsDroper = await ctx.repository.checkRegisteredUser(userId, roleDroperId as number);
        
        let message: string = `📝 Ваши роли:\n\n`;
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
        await ctx.reply(`➡️ Выберите роль для дальнейших действий:`, keyboards.startKeyboard);
        return ctx.scene.leave();
    }
);