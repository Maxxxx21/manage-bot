import { Scenes, Markup } from "telegraf";
import { MyContext, SessionData } from "../utils/types";
import { keyboards } from "../utils/keyboards";
import { exitFunction } from "../utils/exitFunction";

const passForManager: string = 'man';
const passForDroper:string = 'drop';
const passForAdmin:string = 'admin';

export const userRegistrationScene = new Scenes.WizardScene<MyContext>(
    `userRegistrationScene`,
    async (ctx) => {
        await ctx.reply(`👉 Выберите роль для регистрации: `, keyboards.userRegistrationKeyboard);
        return ctx.wizard.next();
    },

    async (ctx) => {
        if (!ctx.message || !('text' in ctx.message)) {
            await ctx.reply(`❌ Произошла ошибка. Пожалуйста, попробуйте еще раз.`);
            return;
        }

        const role: string = ctx.message.text;
        const roles = ["👨‍💼Менеджер", "⛑️Дропер", '👨‍💼Админ'];

        if (!roles.includes(role)) {
            await ctx.reply(`⚠️ Пожалуйста, выберите роль из предложенных.`);
            return ctx.wizard.back();
        }

        await ctx.reply(`🔒 Введите пароль для регистрации: `);
        const wizardState = ctx.wizard.state as SessionData;
        wizardState.role = role;
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (!ctx.message || !('text' in ctx.message)) {
            await ctx.reply(`❌ Произошла ошибка. Попробуйте заново.`);
            return ctx.scene.reenter();
        }; 

        // if(ctx.message.text === '🚪Выйти') {
        //     return await exitFunction(ctx, ctx.message.text);
        // };
        //if (await exitFunction(ctx, ctx.message.text)) return ctx.scene.leave();

        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            return ctx.scene.leave();
        }

        if (!ctx.from) {
            console.error(`Не удалось получить информацию о пользователе. (ctx.from)`);
            return;
        }

        const wizardState = ctx.wizard.state as SessionData;
        const role: string = wizardState.role as string;
        const telegram_id: number = ctx.from.id;
        let userId;

        try {
            const existingUser = await ctx.repository.getUser(telegram_id);
            if (existingUser) {
                userId = existingUser;
            } else {
                const newUser = await ctx.repository.addUser(telegram_id);
                if (!newUser) throw new Error(`Не удалось добавить нового пользователя.`);
                userId = newUser.id;
            }

        } catch (error) {
            console.error(`Не удалось получить ID существующего пользователя`, error);
            await ctx.reply(`❌ Произошла ошибка. Попробуйте позже.`, keyboards.startKeyboard);
            return ctx.scene.leave();
        }

        const password: string = ctx.message.text;
        const roleId: number | null = await ctx.repository.getRoleIdByName(role);
        console.log(userId);
        console.log(userId);
        console.log(userId);
        console.log(userId);
        if (!userId) {
            console.error(`Не удалось получить User Id для регистрации.`);
            await ctx.reply(`❌ Произошла ошибка. Пожалуйста, попробуйте заново.`, keyboards.startKeyboard);
            return ctx.scene.leave();
        }

        if (!roleId) {
            console.error(`Произошла ошибка с ролью.`);
            await ctx.reply(`❌ Попробуйте позже. \n\n➡️ Выберите дальнейшие действия: `, keyboards.startKeyboard);
            return ctx.scene.leave();
        }

        if ((role === "👨‍💼Менеджер" && password !== passForManager) || (role === "⛑️Дропер" && password !== passForDroper) || (role === '👨‍💼Админ' && password !== passForAdmin)) {
            await ctx.reply(`❌ Неверный пароль. Попробуйте еще раз: `);
            return ctx.wizard.selectStep(1); // Шаг с вводом пароля
        }

        try {
            const isRegistered: boolean = await ctx.repository.getUserWithRole(userId, roleId);

            if (isRegistered) {
                await ctx.reply(`ℹ️ Вы уже зарегистрированы как ${role}.`);
                await ctx.reply(`➡️ Выберите дальнейшие действия: `, keyboards.startKeyboard);
                console.log(`Юзер ${userId} уже был зарегистрирован как ${role}.`);
                return ctx.scene.leave();
            } else {
                const addRoleToUser = await ctx.repository.addRoleToUser(userId, role);

                if (addRoleToUser) {
                    await ctx.reply(`✅ Вы успешно зарегистрировались как ${role}.`);
                    console.log(`Новый пользователь ${userId} зарегистрировался как ${role}.`);
                    await ctx.reply(`🚪 Выберите дальнейшие действия: `, keyboards.startKeyboard);
                    return ctx.scene.leave();
                } else {
                    await ctx.reply(`❌ Ошибка.`);
                    return ctx.scene.leave();
                }
            }
        } catch (error) {
            console.error(`Не удалось зарегистрироваться.`, error);
            await ctx.reply(`❌ Произошла ошибка во время регистрации. Попробуйте позже.`);
            return ctx.scene.leave();
        }
        // await ctx.reply(`🚪 Выберите дальнейшие действия: `, keyboards.startKeyboard);
        // return ctx.scene.leave();
    }
);