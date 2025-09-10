"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyboards = void 0;
const telegraf_1 = require("telegraf");
exports.keyboards = {
    startKeyboard: telegraf_1.Markup.keyboard([
        ["Менеджер", "Дропер"],
    ]).resize().oneTime()
};
