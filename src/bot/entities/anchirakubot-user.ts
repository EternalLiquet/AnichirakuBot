import { id } from 'mongodb-typescript';
import { Message } from 'discord.js';

export class AnichirakuUser {
    @id AnichirakuUserId: string;
    UserName: string;
    ServerName: string;
    DiscordId: string;
    ServerId: string;
    LastActivity: Date;

    fill_user_properties_from_message(message: Message) {
        this.AnichirakuUserId = message.author.id + message.guild.id;
        this.UserName = message.author.username;
        this.ServerName = message.guild.name;
        this.DiscordId = message.author.id;
        this.ServerId = message.guild.id;
        this.LastActivity = message.createdAt;
    }

    reset_last_activity(newActivity: Date) {
        this.LastActivity = newActivity;
    }
}
