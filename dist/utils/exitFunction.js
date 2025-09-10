"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitFunction = void 0;
const keyboards_1 = require("./keyboards");
const exitFunction = async (ctx, text) => {
    if (text === "🚪 Выйти") {
        // await ctx.reply(`🚪 Вы вышли в главное меню. \n\nВыберите роль: `, keyboards.startKeyboard);
        //     return true; 
        // } else {
        //     return false; 
        // }
        await ctx.reply(`🚪 Вы вышли в главное меню. \n\nВыберите роль: `, keyboards_1.keyboards.startKeyboard);
        return ctx.scene.leave();
    }
};
exports.exitFunction = exitFunction;
