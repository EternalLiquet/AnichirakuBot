import { id } from 'mongodb-typescript';

export class AnichirakuBotSettings {
    @id SettingsType: string;
    Settings: {};

    constructor(settingsType: string, settings: {}) {
        this.SettingsType = settingsType;
        this.Settings = settings;
    }
}