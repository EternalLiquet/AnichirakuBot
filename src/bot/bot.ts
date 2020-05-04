import { Client, Message, GuildMember, TextChannel, Collection, Emoji, MessageReaction, User } from "discord.js";
import { inject, injectable } from "inversify";
import { TYPES } from "../util/types";
import { factory } from "../util/log.config";
import { LoggerFactory, Logger } from "typescript-logging";
import { DbClient } from "../util/dbclient";
import { Repository } from "mongodb-typescript";
import container from "../util/inversify.config";
import { CommandHandler } from "./services/command-services/command-handler";

@injectable()
export class Bot {
    private client: Client;
    private readonly token: string;
    private GatewayMessageLogger: Logger;
    private DatabaseConnectionLogger: Logger;
    private commandHandler: CommandHandler;
    private commandList: Collection<string, any>;

    constructor(
        @inject(TYPES.Client) client: Client,
        @inject(TYPES.Token) token: string,
        @inject(TYPES.GatewayMessageLogger) GatewayMessageLogger: Logger,
        @inject(TYPES.DatabaseConnectionLogger) DatabaseConnectionLogger: Logger,
    ) {
        this.client = client;
        this.token = token;
        this.GatewayMessageLogger = GatewayMessageLogger;
        this.DatabaseConnectionLogger = DatabaseConnectionLogger;
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

            var command = this.commandList.find(command => message.content.includes(`p.${command.name}`));
            if (command) {
                command.execute(message, message.content.substring((`p.${command.name}`).length, message.content.length).trim())
            }
        });
        return this.client.login(this.token);
    }
}
