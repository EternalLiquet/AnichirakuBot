import { Collection } from 'discord.js';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../util/types';

const moduleList = [

];

@injectable()
export class CommandHandler {
    public commandCollection: Collection<string, any>;

    instantiateCommands(): Collection<string, any> {
        this.commandCollection = new Collection<string, any>();
        moduleList.forEach((commandModule) => {
            let command = new commandModule();
            command.ModuleCommandList.forEach((command) => {
                this.commandCollection.set(command.name, command);
            });
        });
        return this.commandCollection;
    }
}