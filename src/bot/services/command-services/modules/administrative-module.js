"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_typescript_1 = require("mongodb-typescript");
const anichirakubot_settings_1 = require("../../../entities/anichirakubot-settings");
const inversify_config_1 = require("../../../../util/inversify.config");
const types_1 = require("../../../../util/types");
class AdministratorModule {
    constructor() {
        this.ModuleCommandList = [
            {
                name: 'configure inactive days',
                description: 'Will configure the amount of time that can pass before a user is marked "inactive" (in days)',
                help_text: `r.configure inactive days 3 will set the inactivity timer to three days`,
                alias: 'set inactive days',
                required_permission: 'ADMINISTRATOR',
                execute(message, args) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const serviceLogger = inversify_config_1.default.get(types_1.TYPES.ServiceLogger);
                        var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                        if (!guildUser.hasPermission(this.required_permission))
                            throw new Error('User does not have required permissions'); // If they don't have the required permissions, just exit here
                        if (isNaN(+args))
                            throw new Error('Input is not a number, this should be configuring the number of days'); // If it's not a number then exit
                        serviceLogger.info(`Command recieved: ${message.content}`);
                        const dbClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
                        const dbRepo = new mongodb_typescript_1.Repository(anichirakubot_settings_1.AnichirakuBotSettings, dbClient.db, "settings");
                        const settingsId = `${message.guild.id}_inactivity_days`;
                        const newSettings = new anichirakubot_settings_1.AnichirakuBotSettings(settingsId, { "inactivityTimer": args });
                        serviceLogger.debug(`Settings Being Saved: ${JSON.stringify(newSettings, null, 2)}`);
                        yield dbRepo.findById(settingsId).then((result) => __awaiter(this, void 0, void 0, function* () {
                            if (result == null)
                                yield dbRepo.insert(newSettings);
                            else
                                yield dbRepo.update(newSettings);
                        }));
                        message.channel.send(`Inactivity timer successfully set to: ${args} days`);
                    });
                }
            },
            {
                name: 'configure inactive role',
                description: 'Will configure the role that will be used for inactivity',
                help_text: `r.configure inactive role Lurker will set the inactivity role to a role it finds named "Lurker"`,
                alias: 'set inactive role',
                required_permission: 'ADMINISTRATOR',
                execute(message, args) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const serviceLogger = inversify_config_1.default.get(types_1.TYPES.ServiceLogger);
                        var guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
                        if (!guildUser.hasPermission(this.required_permission))
                            throw new Error('User does not have required permissions'); // If they don't have the required permissions, just exit here
                        serviceLogger.info(`Command recieved: ${message.content}`);
                        const dbClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
                        const dbRepo = new mongodb_typescript_1.Repository(anichirakubot_settings_1.AnichirakuBotSettings, dbClient.db, "settings");
                        const settingsId = `${message.guild.id}_inactivity_role`;
                        const inactivityRole = message.guild.roles.cache.find(role => role.name.toLocaleLowerCase() == args.toLocaleLowerCase());
                        if (inactivityRole == undefined)
                            throw new Error('Role not found');
                        const newSettings = new anichirakubot_settings_1.AnichirakuBotSettings(settingsId, { "inactivityRoleId": inactivityRole.id });
                        serviceLogger.debug(`Settings Being Saved: ${JSON.stringify(newSettings, null, 2)}`);
                        yield dbRepo.findById(settingsId).then((result) => __awaiter(this, void 0, void 0, function* () {
                            if (result == null)
                                yield dbRepo.insert(newSettings);
                            else
                                yield dbRepo.update(newSettings);
                        }));
                        message.channel.send(`Inactivity role successfully set to: ${inactivityRole.name}`);
                    });
                }
            }
        ];
    }
}
exports.AdministratorModule = AdministratorModule;
;
//# sourceMappingURL=administrative-module.js.map