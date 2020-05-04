require('dotenv').config();
import container from "./util/inversify.config";
import { TYPES } from "./util/types";
import { Bot } from "./bot/bot";
import { Logger } from "typescript-logging";
import { DbClient } from "./util/dbclient";

const bot = container.get<Bot>(TYPES.Bot);
const mongoDbClient = container.get<DbClient>(TYPES.DbClient);
const GatewayConnectionLogger = container.get<Logger>(TYPES.GatewayConnectionLogger);

bot.listen().then(() => {
  GatewayConnectionLogger.info(() => 'Bot Connected')
}).catch((error) => {
  GatewayConnectionLogger.info(() => 'Bot cannot connect, reason: ', error)
});
