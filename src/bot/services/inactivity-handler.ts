require('dotenv').config();
import container from '../../util/inversify.config';
import { Message, GuildMember, Guild } from 'discord.js';
import { injectable } from 'inversify';
import { TYPES } from '../../util/types';
import { DbClient } from '../../util/dbclient';
import { Repository } from 'mongodb-typescript';
import { Logger } from 'typescript-logging';
import { AnichirakuUser } from '../entities/anchirakubot-user';
import { AnichirakuBotSettings } from '../entities/anichirakubot-settings';
import moment = require('moment');

@injectable()
export class InactivityHandler {

    private serviceLogger = container.get<Logger>(TYPES.ServiceLogger);

    async record_last_activity(message: Message) {
        const dbClient = container.get<DbClient>(TYPES.DbClient);
        const dbRepo = new Repository<AnichirakuUser>(AnichirakuUser, dbClient.db, "users");
        const settingsRepo = new Repository<AnichirakuBotSettings>(AnichirakuBotSettings, dbClient.db, "settings");
        const anichirakuUser = new AnichirakuUser();
        anichirakuUser.fill_user_properties_from_message(message);
        const guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
        this.serviceLogger.debug(`Inactivity Handler entered for user: ${anichirakuUser.UserName} with Anichiraku User ID: ${anichirakuUser.AnichirakuUserId}`);


        await dbRepo.findById(anichirakuUser.AnichirakuUserId).then(async (result) => {
            if (result == null) await dbRepo.insert(anichirakuUser);
            else await dbRepo.update(anichirakuUser);
        });

        const inactivityRole = await settingsRepo.findById(`${message.guild.id}_inactivity_role`)
        this.serviceLogger.debug(inactivityRole.Settings["inactivityRoleId"])
        if (inactivityRole == undefined) return;
        const inactiveRole = message.guild.roles.cache.find(role => role.id == inactivityRole.Settings["inactivityRoleId"]);
        this.serviceLogger.debug(inactiveRole.id);
        if (inactiveRole == undefined) return;
        else guildUser.roles.remove(inactiveRole);

        this.serviceLogger.debug('Inactivity Logger complete');
    };

    async check_inactivity(guild: Guild) {
        setInterval(async () => {
            console.log('uwu')
            const dbClient = container.get<DbClient>(TYPES.DbClient);
            const userRepo = new Repository<AnichirakuUser>(AnichirakuUser, dbClient.db, "users");
            const settingsRepo = new Repository<AnichirakuBotSettings>(AnichirakuBotSettings, dbClient.db, "settings");
            const inactivityRole = await settingsRepo.findById(`${guild.id}_inactivity_role`)
            if (inactivityRole == undefined) return;
            const inactiveRole = guild.roles.cache.find(role => role.id == inactivityRole.Settings["inactivityRoleId"]);
            const inactivitySettings = await settingsRepo.findById(`${guild.id}_inactivity_days`);

            if (inactivitySettings == undefined) return;

            const inactivityThreshold = inactivitySettings.Settings["inactivityTimer"];

            const currentDate = new Date();
            const inactivityCutoffDate = currentDate.setDate(currentDate.getDate() - inactivityThreshold);

            moment().isBefore();

            const userList: AnichirakuUser[] = await userRepo.find();
            userList.forEach(user => {
                if (moment(user.LastActivity).isBefore(inactivityCutoffDate)) {
                    console.log('owo')
                    let guildUser = guild.members.cache.find(member => member.id == user.DiscordId);
                    guildUser.roles.add(inactiveRole).catch((error) => {
                        this.serviceLogger.error(error.message);
                    });
                }
            });
        }, 30000);
    };
};