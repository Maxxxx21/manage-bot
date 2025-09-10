import {Context as TelegrafContext, Scenes} from 'telegraf'; 
import { Repository } from '../Repository/repository';
import { adminRepository } from '../Repository/adminRepository';

export interface SessionData extends Scenes.WizardSessionData {
    number?: string;
    cardholder_name?: string; 
    fd_rd?: 'fd' | 'rd'; 
    amount?: string; 
    role?: string; 
    telegram_id?: number;
    adminAction?: string;
    id?: number;
    fd_rd_total?: string;
    startDate?: string;
    endDate?: string;
    orderId?: number;
};

export interface MySession extends Scenes.WizardSession<SessionData>{
    orderId?: number;
    managerId?: number;
}

export interface MyContext extends TelegrafContext, Scenes.WizardSession<SessionData> {
    session: MySession;
    wizard: Scenes.WizardContextWizard<MyContext>;
    scene: Scenes.SceneContextScene<MyContext, SessionData>;
    repository: Repository;
    adminRepository: adminRepository; 

};



