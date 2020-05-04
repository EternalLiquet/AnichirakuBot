import { Client, Message, GuildMember, TextChannel, Collection, Emoji, MessageReaction, User } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../util/types";
import { factory } from "../util/log.config";
import { LoggerFactory, Logger } from "typescript-logging";
import { DbClient } from "../util/dbclient";
import { Repository, objectId } from "mongodb-typescript";
import container from "../util/inversify.config";
import { CommandHandler } from "./services/command-services/command-handler";
import { InactivityHandler } from './services/inactivity-handler';

@injectable()
export class Bot {
    private client: Client;
    private readonly token: string;
    private GatewayMessageLogger: Logger;
    private DatabaseConnectionLogger: Logger;
    private commandHandler: CommandHandler;
    private commandList: Collection<string, any>;
    private inactivityHandler: InactivityHandler;

    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.Token) token: string,
        @inject(TYPES.GatewayMessageLogger) GatewayMessageLogger: Logger,
        @inject(TYPES.DatabaseConnectionLogger) DatabaseConnectionLogger: Logger,
        @inject(TYPES.InactivityHandler) inactivityHandler: InactivityHandler
    ) {
        this.client = client;
        this.token = token;
        this.GatewayMessageLogger = GatewayMessageLogger;
        this.DatabaseConnectionLogger = DatabaseConnectionLogger;
        this.inactivityHandler = inactivityHandler;
    }

    public listen(): Promise<string> {
        this.client.once('ready', async () => {
            const mongoClient = container.get<DbClient>(TYPES.DbClient);
            await mongoClient.connect();
            this.commandHandler = container.get<CommandHandler>(TYPES.CommandHandler);
            this.commandList = this.commandHandler.instantiateCommands();
            this.client.user.setActivity("Bot is under development, please check back later.", { url: "Insert URL here", type: "PLAYING" });
        });

        this.client.on('message', (message: Message) => {
            if (message.author.bot) return;

            this.GatewayMessageLogger.debug(`User: ${message.author.username}\tServer: ${message.guild != null ? message.guild.name : "In DM Channel"}\tMessageRecieved: ${message.content}\tTimestamp: ${message.createdTimestamp}`);

            this.inactivityHandler.handle(message);

            var command = this.commandList.find(command => message.content.includes(`r.${command.name}`));
            if (command) {
                command.execute(message, message.content.substring((`p.${command.name}`).length, message.content.length).trim()).catch((error) => {
                    message.reply(error.message);
                })
            }
        });
        return this.client.login(this.token);
    }
}
