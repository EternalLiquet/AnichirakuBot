"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const inversify_config_1 = require("./util/inversify.config");
const types_1 = require("./util/types");
const bot = inversify_config_1.default.get(types_1.TYPES.Bot);
const mongoDbClient = inversify_config_1.default.get(types_1.TYPES.DbClient);
const GatewayConnectionLogger = inversify_config_1.default.get(types_1.TYPES.GatewayConnectionLogger);
bot.listen().then(() => {
    GatewayConnectionLogger.info(() => 'Bot Connected');
}).catch((error) => {
    GatewayConnectionLogger.info(() => 'Bot cannot connect, reason: ', error);
});
//# sourceMappingURL=index.js.map