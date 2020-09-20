import * as Discord from 'discord.js';
import { TextChannel } from 'discord.js';

export class DiscordClient {
    private client: Discord.Client;
    private readonly token: string;

    constructor(token: string) {
        this.client = new Discord.Client();
        this.token = token;
    }

    async login(): Promise<void> {
        await this.client.login(this.token);
    }

    async logout(): Promise<void> {
        await this.client.destroy();
    }

    async findChannel(name: string): Promise<TextChannel> {
        return this.client.channels.cache.find(
            (channel) => (channel as TextChannel).name === name,
        ) as TextChannel;
    }
}
