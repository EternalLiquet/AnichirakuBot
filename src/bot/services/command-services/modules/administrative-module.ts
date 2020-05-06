import { Message, User, Guild, GuildMember, Collection, Emoji, Role, MessageEmbed } from 'discord.js';
import { Repository } from 'mongodb-typescript'
import { Logger } from 'typescript-logging';
import { AnichirakuBotSettings } from '../../../entities/anichirakubot-settings';
import container from '../../../../util/inversify.config';
import { TYPES } from '../../../../util/types';
import { DbClient } from '../../../../util/dbclient';
import { inject } from 'inversify';

export class AdministratorModule {
    public ModuleCommandList = [
        {
            name: 'configure inactive days',
            description: 'Will configure the amount of time that can pass before a user is marked "inactive" (in days)',
            help_text: `r.configure inactive days 3 will set the inactivity timer to three days`,
            alias: 'set inactive days',
            required_permission: 'ADMINISTRATOR',
            async execute(message: Message, args: string) {
                const serviceLogger = container.get<Logger>(TYPES.ServiceLogger);
                var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                if (!guildUser.hasPermission(this.required_permission)) throw new Error('User does not have required permissions'); // If they don't have the required permissions, just exit here
                if (isNaN(+args)) throw new Error('Input is not a number, this should be configuring the number of days'); // If it's not a number then exit
                serviceLogger.info(`Command recieved: ${message.content}`);

                const dbClient = container.get<DbClient>(TYPES.DbClient);
                const dbRepo = new Repository<AnichirakuBotSettings>(AnichirakuBotSettings, dbClient.db, "settings");
                const settingsId = `${message.guild.id}_inactivity_days`;
                const newSettings = new AnichirakuBotSettings(settingsId, { "inactivityTimer": args });
                serviceLogger.debug(`Settings Being Saved: ${JSON.stringify(newSettings, null, 2)}`);

                await dbRepo.findById(settingsId).then(async (result) => {
                    if (result == null) await dbRepo.insert(newSettings);
                    else await dbRepo.update(newSettings);
                });

                message.channel.send(`Inactivity timer successfully set to: ${args} days`);
            }
        },
        {
            name: 'configure inactive role',
            description: 'Will configure the role that will be used for inactivity',
            help_text: `r.configure inactive role Lurker will set the inactivity role to a role it finds named "Lurker"`,
            alias: 'set inactive role',
            required_permission: 'ADMINISTRATOR',
            async execute(message: Message, args: string) {
                const serviceLogger = container.get<Logger>(TYPES.ServiceLogger);
                var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                if (!guildUser.hasPermission(this.required_permission)) throw new Error('User does not have required permissions'); // If they don't have the required permissions, just exit here
                serviceLogger.info(`Command recieved: ${message.content}`);

                const dbClient = container.get<DbClient>(TYPES.DbClient);
                const dbRepo = new Repository<AnichirakuBotSettings>(AnichirakuBotSettings, dbClient.db, "settings");
                const settingsId = `${message.guild.id}_inactivity_role`;

                const inactivityRole = message.guild.roles.cache.find(role => role.name.toLocaleLowerCase() == args.toLocaleLowerCase());
                if (inactivityRole == undefined) throw new Error('Role not found');

                const newSettings = new AnichirakuBotSettings(settingsId, { "inactivityRoleId": inactivityRole.id });
                serviceLogger.debug(`Settings Being Saved: ${JSON.stringify(newSettings, null, 2)}`);

                await dbRepo.findById(settingsId).then(async (result) => {
                    if (result == null) await dbRepo.insert(newSettings);
                    else await dbRepo.update(newSettings);
                });

                message.channel.send(`Inactivity role successfully set to: ${inactivityRole.name}`);
            }
        }
    ];
};
