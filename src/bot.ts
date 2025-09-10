import { Telegraf, Scenes, session } from "telegraf";
import  "dotenv/config";
import { createOrderScene } from "./scenes/createOrder";
import { userRegistrationScene } from "./scenes/userRegistrationScene";
import { Repository } from "./Repository/repository";
import { keyboards } from "./utils/keyboards";
import { pool } from "./utils/db"; 
import { WizardContext } from "telegraf/typings/scenes";
import { MyContext } from "./utils/types";
import { adminRepository } from "./Repository/adminRepository";
import { adminScene} from './scenes/adminScene';
import { adminGetTotalScene } from "./scenes/adminGetTotalScene";
import { SessionData } from "./utils/types";
import { droperScene } from "./scenes/dropperScene";
import { adminDeleteManagerScene} from "./scenes/adminDeleteManagerScene";
import { droperGetAllOpenOrdersScene} from "./scenes/droperGetAllOpenOrdersScene";
import { MyRolesButtonScene } from "./scenes/myRolesButtonScene";

const token = process.env["BOT_TOKEN"] as string; 

if(!token) { 
    console.error(`Какие то проблемы с токеном.`);
    process.exit(1);
}; 
 
const orderRepository = new Repository(pool); 
const admin_Repository = new adminRepository(pool);

const bot = new Telegraf<MyContext>(token);
console.log(`Бот успешно запускается.`);


const stage = new Scenes.Stage<MyContext>([createOrderScene, userRegistrationScene, adminScene, adminGetTotalScene, droperScene, adminDeleteManagerScene, droperGetAllOpenOrdersScene, MyRolesButtonScene]);

bot.use(session());
bot.use((ctx, next) => {
    (ctx as MyContext).repository = orderRepository; 
    return next(); 
});
bot.use((ctx, next) => {
    (ctx as MyContext).adminRepository =  admin_Repository;
    return next(); 
});
bot.use(stage.middleware());

bot.command(`createorder`, (ctx) => {
    return ctx.scene.enter(`createOrderScene`); 
});

bot.command(`menu`, async (ctx) => {
    await ctx.scene.leave();
    return ctx.reply(`➡️ Выберите роль для дальнейших действий:`, keyboards.startKeyboard);
})

bot.start( async (ctx)  => {
    let username: string = ctx.from?.username || ctx.from?.first_name;
    await ctx.reply(`Приветствую, ${username}! \nВыбери свою роль: `, keyboards.startKeyboard)
}); 

bot.command(`register`, (ctx) => {
    return ctx.scene.enter(`userRegistrationScene`); 
})

bot.hears("👨‍💼Менеджер", (ctx) => {
     return ctx.scene.enter(`createOrderScene`);
});

bot.hears("⛑️Дропер", (ctx) => {
    return ctx.scene.enter('droperGetAllOpenOrdersScene');
})

bot.hears('👨‍💼Админ', (ctx) => {
    return ctx.scene.enter(`adminScene`);
} );

bot.hears('🕺🏽Мои роли', (ctx) => {
    return ctx.scene.enter(`MyRolesButtonScene`);
})

bot.action(/take_order_(\d+)/, async (ctx: MyContext) => {
    const match = (ctx as any).match;
    const orderId = parseInt(match[1], 10);

    const telegram_id: number = ctx.from!.id;
    const dropperRoleId: number | null  = await ctx.repository.getRoleIdByName('Дропер');

    if(dropperRoleId === null) {
        await ctx.reply(`❌ Произошла ошибка. `); 
        return; 
    }; 

    const getIdFromUsers = await ctx.repository.getUser(telegram_id);
    const checkRegisteredUser = await ctx.repository.checkRegisteredUser(getIdFromUsers, dropperRoleId);

    if(!checkRegisteredUser) {
        await ctx.reply(`❌ Вы не зарегистрированы как "Дропер".`);
        return;
    }; 

    ctx.session.orderId = orderId;

    return ctx.scene.enter(`droperScene`);
})

bot.launch();
