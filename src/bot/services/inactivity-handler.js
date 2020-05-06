"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
require('dotenv').config();
const inversify_config_1 = require("../../util/inversify.config");
const inversify_1 = require("inversify");
const types_1 = require("../../util/types");
const mongodb_typescript_1 = require("mongodb-typescript");
const anchirakubot_user_1 = require("../entities/anchirakubot-user");
const anichirakubot_settings_1 = require("../entities/anichirakubot-settings");
const moment = require("moment");
let InactivityHandler = class InactivityHandler {
    constructor() {
        this.serviceLogger = inversify_config_1.default.get(types_1.TYPES.ServiceLogger);
    }
    record_last_activity(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const dbClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
            const dbRepo = new mongodb_typescript_1.Repository(anchirakubot_user_1.AnichirakuUser, dbClient.db, "users");
            const settingsRepo = new mongodb_typescript_1.Repository(anichirakubot_settings_1.AnichirakuBotSettings, dbClient.db, "settings");
            const anichirakuUser = new anchirakubot_user_1.AnichirakuUser();
            anichirakuUser.fill_user_properties_from_message(message);
            const guildUser = message.guild.members.cache.find(member => member.id == message.author.id);
            this.serviceLogger.debug(`Inactivity Handler entered for user: ${anichirakuUser.UserName} with Anichiraku User ID: ${anichirakuUser.AnichirakuUserId}`);
            yield dbRepo.findById(anichirakuUser.AnichirakuUserId).then((result) => __awaiter(this, void 0, void 0, function* () {
                if (result == null)
                    yield dbRepo.insert(anichirakuUser);
                else
                    yield dbRepo.update(anichirakuUser);
            }));
            const inactivityRole = yield settingsRepo.findById(`${message.guild.id}_inactivity_role`);
            this.serviceLogger.debug(inactivityRole.Settings["inactivityRoleId"]);
            if (inactivityRole == undefined)
                return;
            const inactiveRole = message.guild.roles.cache.find(role => role.id == inactivityRole.Settings["inactivityRoleId"]);
            this.serviceLogger.debug(inactiveRole.id);
            if (inactiveRole == undefined)
                return;
            else
                guildUser.roles.remove(inactiveRole);
            this.serviceLogger.debug('Inactivity Logger complete');
        });
    }
    ;
    check_inactivity(guild) {
        return __awaiter(this, void 0, void 0, function* () {
            setInterval(() => __awaiter(this, void 0, void 0, function* () {
                console.log('uwu');
                const dbClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
                const userRepo = new mongodb_typescript_1.Repository(anchirakubot_user_1.AnichirakuUser, dbClient.db, "users");
                const settingsRepo = new mongodb_typescript_1.Repository(anichirakubot_settings_1.AnichirakuBotSettings, dbClient.db, "settings");
                const inactivityRole = yield settingsRepo.findById(`${guild.id}_inactivity_role`);
                if (inactivityRole == undefined)
                    return;
                const inactiveRole = guild.roles.cache.find(role => role.id == inactivityRole.Settings["inactivityRoleId"]);
                const inactivitySettings = yield settingsRepo.findById(`${guild.id}_inactivity_days`);
                if (inactivitySettings == undefined)
                    return;
                const inactivityThreshold = inactivitySettings.Settings["inactivityTimer"];
                const currentDate = new Date();
                const inactivityCutoffDate = currentDate.setDate(currentDate.getDate() - inactivityThreshold);
                moment().isBefore();
                const userList = yield userRepo.find();
                userList.forEach(user => {
                    if (moment(user.LastActivity).isBefore(inactivityCutoffDate)) {
                        console.log('owo');
                        let guildUser = guild.members.cache.find(member => member.id == user.DiscordId);
                        guildUser.roles.add(inactiveRole).catch((error) => {
                            this.serviceLogger.error(error.message);
                        });
                    }
                });
            }), 30000);
        });
    }
    ;
};
InactivityHandler = __decorate([
    inversify_1.injectable()
], InactivityHandler);
exports.InactivityHandler = InactivityHandler;
;
//# sourceMappingURL=inactivity-handler.js.map