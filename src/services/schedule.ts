import { Client, TextChannel } from "discord.js";
import { scheduleJob } from "node-schedule";
import { isTextChannel } from "../commands/helpers/scheduleValidators";

export interface JobParams {
  minute: string;
  hour: string;
  dayOfWeek: number;
}

export interface MessageInfo {
  guild?: string;
  channel?: string;
  content: string;
}

export class Scheduler {
  private client: Client;
  scheduleJob = scheduleJob;
  constructor(client: Client) {
    this.client = client;
  }

  schedule(params: JobParams, message: MessageInfo, target?: TextChannel): void {
    if (target) {
      this.scheduleJob(params, () => {
        void target.send(message);
      });
    } else {
      const guild = this.client.guilds.cache.find((guild) => guild.name === message.guild);
      if (!guild) {
        throw new Error("Guild not found");
      }
      const channel = guild.channels.cache.find((channel) => channel.name === message.channel);
      if (!channel) {
        throw new Error("Channel not found");
      }

      if (!isTextChannel(channel)) {
        throw new Error("Channel found is not a text channel");
      }
      this.scheduleJob(params, () => {
        void channel.send(message.content);
      });
    }
  }
}
