import { Telegraf, Scenes, Markup } from "telegraf";
import { MyContext, SessionData } from "../utils/types";
import { keyboards } from "../utils/keyboards";

const mailingToAllDroppers = async (ctx: MyContext) => {
    const AllDropers = await ctx.repository.getAllDropers();
    const order = await ctx.repository.getOrderById(ctx.session.orderId as number);
    const messageText = `✨ Новый ордер №${order.id} создан:\n\n1. Номер карты: ${order.number}\n\n2. Тип: ${order.fd_rd}\n\n3. ФИО: ${order.cardholder_name}\n\n4. Сумма: ${order.amount}`;
    let successCount = 0;
                        
    const takeOrderKeyboard = Markup.inlineKeyboard([
        Markup.button.callback(`Взять ордер.`, `take_order_${order.id}`)
    ]);

    for (let user of AllDropers) {
        try {
            await ctx.telegram.sendMessage(user.telegram_id, messageText, takeOrderKeyboard); 
            successCount++;
        } catch(error) { 
            console.error(`Не удалось отправить сообщение пользователю ${user.telegram_id}:  `, error); 
        }
    }
}

export const droperScene = new Scenes.WizardScene<MyContext>(`droperScene`,

     async (ctx) => {
        const userId = await ctx.repository.getUser(ctx.from!.id);
        const roleDroperId = await ctx.repository.getRoleIdByName(`⛑️Дропер`);
        const isDroper = await ctx.repository.checkRegisteredUser(userId, roleDroperId as number);

        if (!isDroper) {
            await ctx.reply(`К сожалению, у Вас нет доступа. Зарегистрируйтесь как "⛑️Дропер", введя коменду: /register`);
            return ctx.scene.leave();
        } else if (isDroper) {
            await ctx.reply(`🛃Идет проверка, ожидайте, пожалуйста.`);
        }
    // },
    
    // async (ctx) => {
        const orderId = ctx.session.orderId;

        if(!orderId) {
            await ctx.reply(`❌ Не удалось взять ордер. Произошла ошибка.`);
            return ctx.scene.leave();
        }
        const droperId = await ctx.repository.getUser(ctx.from!.id);

        try {
            const success = await ctx.repository.takeOrHandleOrder(orderId, 'taken', droperId);

            if(!success) { 
                await ctx.reply("⚠️ Этот ордер уже взят другим дроппером или не доступен.");
                return ctx.scene.leave();
            }

            await ctx.reply(`✅ Вы взяли ордер №${orderId}. \n\nПросим Вас прислать фото или комментарий.`);
            const order = await ctx.repository.getOrderById(orderId);
            const manager = order.manager_id;
            const telegramIdManager = await ctx.repository.getTelegramIdById(manager);
            const message1 = `✅ Дроппер ${droperId} взял Ваш Ордер №${order.id}`; 
            const messageToManager = await ctx.telegram.sendMessage(telegramIdManager, message1 );
            return ctx.wizard.next();
        } catch(error) { 
            console.error(`Не получилось обновить статус ордера.`, error);
            await ctx.reply(`❌ Произошла ошибка. Попробуйте заново.`, keyboards.startKeyboard);
            return ctx.scene.leave();
        }
    }, 

    async (ctx) => {
        if(ctx.message && 'photo' in ctx.message) {
            const droperId = await ctx.repository.getUser(ctx.from!.id);
            const fileId: string = ctx.message.photo[ctx.message.photo.length - 1].file_id; 
            const caption = ctx.message.caption || 'Без комментария';
            const orderId: number = ctx.session.orderId as number;
            const order = await ctx.repository.getOrderById(orderId);


            const manager = order.manager_id;
            const telegramIdManager = await ctx.repository.getTelegramIdById(manager);
            //const message1 = `✅ Дроппер ${droperId} взял Ваш Ордер №${order.id}`; 
            //const messageToManager = await ctx.telegram.sendMessage(telegramIdManager, message1 );

            try { 
                await ctx.repository.addScreenshot(order.id, fileId);
                await ctx.repository.updateOrderStatus(order.id, 'done');
                await ctx.reply(`✅ Ваше фото успешно обработано.`);
            } catch(error) { 
                await ctx.reply (`❌ К сожалению, произошла ошибка.`);
                console.error(`Произошла ошибка во время внесения фото в бд.`, error);

                mailingToAllDroppers;
                await ctx.repository.removeDroperFromOrderAndSetStatusOpen(order.id);
                delete ctx.session.orderId;
                return ctx.scene.leave();
            }
            
            await ctx.telegram.sendPhoto(telegramIdManager, fileId, {
                caption:`✅ Дроппер ${droperId} завершил ордер №${order.id}.\n\nКомментарий: ${caption}`
            });
            delete ctx.session.orderId;
            return ctx.scene.leave();

        } else if(ctx.message && 'text' in ctx.message) {
            const droperId: number  = await ctx.repository.getUser(ctx.from!.id);
            const order = await ctx.repository.getOrderById(ctx.session.orderId as number);
            const managerId: number = order.manager_id;
            const telegramIdManager: number = await ctx.repository.getTelegramIdById(managerId); 

            const droperCommnet: string = ctx.message.text;
            try { 
                const success = await ctx.repository.insertCommentInOrder(order.id, droperCommnet);
                const sendMessage = await ctx.telegram.sendMessage(telegramIdManager, `❌ Дроппер ${droperId} добавил комментарий к ордеру №${order.id}:\n\n${droperCommnet}`);
                const updateStatus = await ctx.repository.updateOrderStatus(order.id, 'failed');

                if(success && sendMessage && updateStatus) {
                    await ctx.reply(`✅ Вы успешно отправили комментарий.\n\nВыберите роль:`, keyboards.startKeyboard);
                    delete ctx.session.orderId;
                    return ctx.scene.leave();
                } 
            } catch(error) {
                console.error(`Произошла ошибка при добавлении комментария к ордеру:`, error);
                await ctx.reply(`❌ Произошла ошибка. Попробуйте заново.`);
                mailingToAllDroppers;
                await ctx.repository.removeDroperFromOrderAndSetStatusOpen(order.id);
                delete ctx.session.orderId;
                return ctx.scene.leave();
            }
        } else {
            await ctx.reply(`⚠️ Пожалуйста, попробуйте все заново.`);
            mailingToAllDroppers; 
            delete ctx.session.orderId;
            return ctx.scene.leave();
        }
    }
);