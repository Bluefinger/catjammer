import { Client, TextChannel } from "discord.js";
import { Job, scheduleJob } from "node-schedule";
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
  jobStore = new Map<string, Job>();
  scheduleJob = scheduleJob;

  constructor(private client: Client) {}

  schedule(name: string, params: JobParams, message: MessageInfo, target?: TextChannel): void {
    let job;
    let guildName;
    if (target) {
      job = this.scheduleJob(params, () => {
        void target.send(message);
      });
      guildName = target.guild.name;
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
      job = this.scheduleJob(params, () => {
        void channel.send(message.content);
      });
      guildName = guild.name;
    }

    this.jobStore.set(guildName + name, job);
  }

  has(name: string, guild: string): boolean {
    return this.jobStore.has(guild + name);
  }

  cancel(name: string, guild: string): boolean {
    const job = this.jobStore.get(guild + name);
    if (job) {
      job.cancel();
      return true;
    } else {
      return false;
    }
  }
}
