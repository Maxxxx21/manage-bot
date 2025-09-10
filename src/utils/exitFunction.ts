import { keyboards } from "./keyboards"
import { MyContext } from "./types";

export const exitFunction = async (ctx: MyContext, text?: string) => {
    if (text === "🚪 Выйти") {
        await ctx.reply(`🚪 Вы вышли в главное меню. \n\nВыберите роль: `, keyboards.startKeyboard);
        return true; 
    } else {
        return false; 
    }
}
//         await ctx.reply(`🚪 Вы вышли в главное меню. \n\nВыберите роль: `, keyboards.startKeyboard);
//         return ctx.scene.leave();
// }
// }