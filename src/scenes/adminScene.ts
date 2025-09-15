import { Telegraf, Markup, Scenes  } from "telegraf";
import { Repository } from "../Repository/repository";
import { MyContext, SessionData } from "../utils/types";
import { createManagerKeybord } from "../Repository/adminRepository";
import { keyboards } from "../utils/keyboards";
import { exitFunction } from "../utils/exitFunction";
import { adminGetTotalScene } from "./adminGetTotalScene";

const pass = 'admin';

export const adminScene = new Scenes.WizardScene<MyContext>(
    `adminScene`,
     async (ctx) => {
            await ctx.reply(`🔒 Введите пароль: `, keyboards.exitKeyboard);
            return ctx.wizard.next();
        },
    
    async (ctx) => {
        if (!ctx.message || !('text' in ctx.message)) {
            await ctx.reply(`Произошла ошибка. Выходим в меню.`, keyboards.startKeyboard);
            return ctx.scene.leave();
        };
    
        //if(await exitFunction(ctx, ctx.message.text)) return ctx.scene.leave();
        
        // if(ctx.message.text === '🚪Выйти') {
        //     return await exitFunction(ctx, ctx.message.text);
        // };

        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            await ctx.reply(`Выходим из сцены...`)
            return ctx.scene.leave();
        }
    
        if (ctx.message.text !== pass) {
            await ctx.reply(`❌ Неверный пароль. Попробуйте заново.`);
            return;
        } else if( ctx.message.text === pass) {
            await ctx.reply(`✅ Пароль верный.`);
             await ctx.reply(`Выберите действие: `, keyboards.adminActionsKeyboard);
    
            return ctx.wizard.next(); 
        }
    },

    // async (ctx) => { 
    //     await ctx.reply(`Выберите действие: `, keyboards.adminActionsKeyboard
    // );
    // return ctx.wizard.next();
    // }, 

    async (ctx) => {
        if(!ctx.message || !('text' in ctx.message)) { 
            await ctx.reply(`Произошла ошибка. Необходими попробовать еще раз.`);
            return;
        }

        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            return ctx.scene.leave();
        }

        const action = ctx.message.text;
        
        
        if (action === '🗑️ Удалить менеджера') { 
            return ctx.scene.enter('adminDeleteManagerScene')
        } else if (action === '📊 Просмотр статистики менеджера') {
            return ctx.scene.enter('adminGetTotalScene');
        } else {
            await ctx.reply(`Произошла ошибка, попробуйте заново.`);
            return ctx.scene.reenter();
        }
    }
)