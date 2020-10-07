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
  jobStore = new Map<string, Map<string, Job>>();
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
    if (!this.jobStore.has(guildName)) {
      this.jobStore.set(guildName, new Map<string, Job>());
    }
    this.jobStore.get(guildName)?.set(name, job);
  }

  has(name: string, guild: string): boolean {
    const guildMap = this.jobStore.get(guild);
    if (!guildMap) {
      return false;
    } else {
      return guildMap.has(name);
    }
  }

  cancel(name: string, guild: string): boolean {
    if (this.has(name, guild)) {
      const job = this.jobStore.get(guild)?.get(name);
      job?.cancel();
      return true;
    } else {
      return false;
    }
  }
}
