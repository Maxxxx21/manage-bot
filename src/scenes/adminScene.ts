// import { Telegraf, Markup, Scenes  } from "telegraf";
// import { Repository } from "../Repository/repository";
// import { MyContext, SessionData } from "../utils/types";
// import { createManagerKeybord } from "../Repository/adminRepository";
// import { keyboards } from "../utils/keyboards";
// import { exitFunction } from "../utils/exitFunction";
// import { adminGetTotalScene } from "./adminGetTotalScene";

// export const adminScene = new Scenes.WizardScene<MyContext>(
//     `adminScene`,
//     async (ctx) => { 
//         await ctx.reply(`Выберите действие: `, keyboards.adminActionsKeyboard
//     );
//     return ctx.wizard.next();
//     }, 

//     async (ctx) => {
//         if(!ctx.message || !('text' in ctx.message)) { 
//             await ctx.reply(`Произошла ошибка. Необходими попробовать еще раз.`);
//             return;
//         }

//         if (await exitFunction(ctx, ctx.message.text)) return;

//         const action = ctx.message.text;
        
        
//         if (action === 'Удалить менеджера') { 
//             return ctx.scene.enter('adminDeleteManagerScene')
//         } else if (action === 'Просмотр статистики менеджера') {
//             return ctx.scene.enter('adminGetTotalScene');
//         } else {
//             await ctx.reply(`Произошла ошибка, попробуйте заново.`);
//             return ctx.scene.reenter();
//         }
//     }
// )

import { Telegraf, Markup, Scenes  } from "telegraf";
import { Repository } from "../Repository/repository";
import { MyContext, SessionData } from "../utils/types";
import { createManagerKeybord } from "../Repository/adminRepository";
import { keyboards } from "../utils/keyboards";
import { exitFunction } from "../utils/exitFunction";
import { adminGetTotalScene } from "./adminGetTotalScene";

export const adminScene = new Scenes.WizardScene<MyContext>(
    `adminScene`,
    async (ctx) => { 
        await ctx.reply(`Выберите действие: `, keyboards.adminActionsKeyboard
    );
    return ctx.wizard.next();
    }, 

    async (ctx) => {
        if(!ctx.message || !('text' in ctx.message)) { 
            await ctx.reply(`Произошла ошибка. Необходими попробовать еще раз.`);
            return;
        }

        if (await exitFunction(ctx, ctx.message.text)) return;

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