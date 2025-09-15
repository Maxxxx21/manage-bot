import { Telegraf, session, Scenes, Markup } from "telegraf";
import { IOrder, Repository } from "../Repository/repository";
import { query } from "../utils/db";
import { MyContext,SessionData } from "../utils/types"
import { keyboards } from "../utils/keyboards";
import { exitFunction } from "../utils/exitFunction";

const password = "man";

const formatedDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${day}.${month}.${year}`;
    const formattedTime = `${hours}:${minutes}`;

    return {formattedDate, formattedTime}; 
};

export const createOrderScene = new Scenes.WizardScene<MyContext>(
    `createOrderScene`,
    async (ctx) => {
        const userId = await ctx.repository.getUser(ctx.from!.id);
        const roleManagerId = await ctx.repository.getRoleIdByName(`👨‍💼Менеджер`);
        const isManager = await ctx.repository.checkRegisteredUser(userId, roleManagerId as number);

        if (!isManager) {
            await ctx.reply(`Эта опция доступна только для 👨‍💼Менеджеров. Чтобы продолжить, пожалуйста, зарегистрируйтесь, отправив команду: /register.`);
            return ctx.scene.leave();
        } else if (isManager) {
            //await ctx.reply(`🔒 Введите пароль: `, keyboards.exitKeyboard);
            await ctx.reply(`📝 Для создания ордера введите информацию в таком формате: \n💳 IBAN 💳\n👤 ФИО 👤 \n💵 Сумма 💵 `, keyboards.exitKeyboard);
            return ctx.wizard.next();
        }
    }, 

    // async(ctx) => {
    //     if(!ctx.message || !('text' in ctx.message)) {
    //         await ctx.reply(`Произошла ошибка. Попробуйте еще раз.`, keyboards.confirmKeyboard);
    //         return;
    //     };

    //     await ctx.reply(`🔒 Введите пароль: `, keyboards.exitKeyboard);

    //     return ctx.wizard.next();
    // }, 
    // async (ctx) => { 
    //     if(!ctx.message || !('text' in ctx.message)) {
    //         await ctx.reply(`Произошла ошибка. Попробуйте еще раз.`, keyboards.confirmKeyboard);
    //         return;
    //     };

    //     if(ctx.message.text === '🚪Выйти') {
    //         await exitFunction(ctx, ctx.message.text);
    //     };

    //     if(ctx.message.text === password) {
    //         await ctx.reply(`✅ Пароль верный.`);
    //         await ctx.reply(`📝 Для создания ордера введите информацию в таком формате: \n💳 IBAN 💳\n👤 ФИО 👤 \n💵 Сумма 💵 `, keyboards.exitKeyboard);
    //         return ctx.wizard.next();
    //     } else if (ctx.message.text !== password) { 
    //         await ctx.reply(`❌ Неверный пароль. Попробуйте еще раз.`);

    //         if (await exitFunction(ctx, ctx.message.text)) return ctx.scene.leave();
    //         return;
    //     }
    // }, 
    async (ctx) => {
        if(!ctx.message || !('text' in ctx.message)) {
            await ctx.reply(`❌ Произошла ошибка. \n\nВозвращаемся в главное меню...`, keyboards.startKeyboard);
            return;
        };

        // if (await exitFunction(ctx, ctx.message.text)) return ctx.scene.leave();
        //  if(ctx.message.text === '🚪Выйти') {
        //     return await exitFunction(ctx, ctx.message.text);
        // };
        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            await ctx.reply(`Выходим из сцены...`)
            return ctx.scene.leave();
        }

        const inputLines = ctx.message.text.split(`\n`);

        if (inputLines.length !== 3 ) { 
            await ctx.reply(`⚠️ Некорректный формат записи ордера. Повторите попытку и введите данные в таком порядке: \n1. IBAN \n2. ФИО \n3. Сумма`);
            return;
        };

        const [number, cardholder_name, amount ] = inputLines; 

        if(isNaN(parseFloat(amount.trim()))) { 
            await ctx.reply(`❌ Некорректный формат суммы. Сумма должна быть числом. Попробуйте заново.`);
            return;
        };

        const wizardState = ctx.wizard.state as SessionData;
        wizardState.number = number.trim();
        wizardState.cardholder_name = cardholder_name.trim();
        wizardState.amount = amount.trim();
        await ctx.reply(`Проверьте данные ордера:\n\n💳 ${wizardState.number}\n👤 ${wizardState.cardholder_name}\n💵 ${wizardState.amount} €\n\n✍️ Введите "FD" или "RD"`, keyboards.fdOrRDKeyboard);
        return ctx.wizard.next();
    }, 
    async (ctx) => {
        if(!ctx.message || !('text' in ctx.message)) {
            await ctx.reply(`Произошла ошибка. Попробуйте еще раз.`, keyboards.confirmKeyboard);
            return;
        };

        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            return ctx.scene.leave();
        };
 

        const fdOrRd = ctx.message.text.toLowerCase();
        const wizardState = ctx.wizard.state as SessionData;
        
        if (fdOrRd === "fd") {
            const ordersWithTheSameIban = await ctx.repository.getOrdersByIbanFd(wizardState.number as string);
            wizardState.fd_rd = fdOrRd;

            if(ordersWithTheSameIban.length === 0) { 
                await ctx.reply(`ℹ️ По IBAN: ${wizardState.number} нет созданых ордеров.`);
                await ctx.reply(`Проверьте, пожалуйста, корректность данных. Если все верно, нажмите кнопку "Подтвердить" 👇`, keyboards.confirmKeyboard);
                return ctx.wizard.next();
            } else if(ordersWithTheSameIban.length > 0) {
                let message: string = `⚠️ По данному IBAN ${wizardState.number} были обнаружены следующие ордера:\n\n`;

                for (let order of ordersWithTheSameIban) {
                    const dateTime = formatedDateTime(order.created_at)
                    message += `\n\nОрдер №${order.id}\n💳 Номер карты: ${order.number}\n✍️ Тип: ${(order.fd_rd).toUpperCase()}\n👤 ФИО: ${order.cardholder_name}\n💵 Сумма: ${order.amount} €\n🕰️Дата создания: ${dateTime.formattedDate} ${dateTime.formattedTime}\n-------------------------`;
                };

                await ctx.reply(message, keyboards.confirmKeyboard);
                await ctx.reply(`Для отмены ордера отправьте любой текст, если все верно, нажмите "Подтвердить". 👇`, keyboards.confirmKeyboard);
                return ctx.wizard.next();
            };
        } else if (fdOrRd === "rd") {
            wizardState.fd_rd = fdOrRd;
            await ctx.reply(`Проверьте, пожалуйста, корректность данных. Если все верно, нажмите кнопку "Подтвердить" 👇`, keyboards.confirmKeyboard);
            return ctx.wizard.next();
        } else {
            await ctx.reply(`❌ Неверный тип. Введите "FD" или "RD".`);
            return;
        }
    }, 
    async (ctx) => { 
        if(!ctx.message || !('text' in ctx.message)) {
            await ctx.reply(`Произошла ошибка. Попробуйте еще раз.`, keyboards.confirmKeyboard);
            return;
        };

        const exitFunctionResult = await exitFunction(ctx, ctx.message.text);

        if(exitFunctionResult) {
            await ctx.reply(`Выходим из сцены...`)
            return ctx.scene.leave();
        }

        // if (await exitFunction(ctx, ctx.message.text)) return ctx.scene.leave();

        const confirm = ctx.message.text; 

        if(confirm !== "Подтвердить" ) {
            await ctx.reply(`❌ Вы отменили создание ордера.`, keyboards.startKeyboard);
            return ctx.scene.leave(); 
        } 
        
        const wizardState = ctx.wizard.state as SessionData;
        
        if(!ctx.from) { 
            console.error(`Не удалось получить информацию о пользователе. (ctx.from)`);
            await ctx.reply(`Произошла ошибка. Попробуйте позже.`, keyboards.startKeyboard);
            return ctx.scene.leave();
        };

        const managerId: number = await ctx.repository.getUser(ctx.from.id);

        const order: IOrder = {
            manager_id: managerId,
            droper_id: null,  
            number: wizardState.number as string,
            fd_rd: wizardState.fd_rd as 'fd' | 'rd',
            cardholder_name: wizardState.cardholder_name as string, 
            amount: wizardState.amount as string, 
            status: 'open', 
            created_at: new Date(), 
            update_at: new Date(), 
        };

        try { 
            const newOrder = await ctx.repository.insertOrder(
            order.manager_id, 
            order.droper_id,
            order.number,
            order.cardholder_name,
            order.fd_rd,
            order.amount
            );

            if(newOrder && newOrder.id) {
                await ctx.reply(`🎉 Ордер №${newOrder.id} успешно создан!`);
            }

            const allUsersByRole = await ctx.repository.getAllDropers();
            
            const messageText = `✨ Новый ордер №${newOrder.id} создан:\n\n💳 Номер карты: ${newOrder.number}\n✍️ Тип: ${(newOrder.fd_rd).toUpperCase()}\n👤 ФИО: ${newOrder.cardholder_name}\n💵 Сумма: ${newOrder.amount} €`;
            let successCount = 0;
            
            const takeOrderKeyboard = Markup.inlineKeyboard([
                Markup.button.callback(`Взять ордер`, `take_order_${newOrder.id}`)
            ]);

            for (let user of allUsersByRole) {
                try {
                    await ctx.telegram.sendMessage(user.telegram_id, messageText, takeOrderKeyboard); 
                    successCount++;
                } catch(error) { 
                    console.error(`Не удалось отправить сообщение пользователю ${user.telegram_id}:`, error); 
                }
            };  

            await ctx.reply(`✅ Рассылка завершена! Отправлено сообщений: ${successCount}.\n\n🚪 Возвращаемся в главное меню...`, keyboards.startKeyboard);
            return ctx.scene.leave();

        } catch(error) { 
            console.error(`Ошибка во время этапа рассылки:`, error);
            await ctx.reply(`Произошла ошибка во время этапа рассылки.`);
            return ctx.scene.leave();
        };
    }
);
