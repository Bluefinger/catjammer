import { Client, TextChannel } from "discord.js";
import { Job, scheduleJob } from "node-schedule";
import { isTextChannel } from "../commands/helpers/scheduleValidators";

export interface JobParams {
  minute: string;
  hour: string;
  dayOfWeek: number;
}

export interface MessageInfo {
  guild: string;
  channel: string;
  content: string;
}

export interface StorableJob {
  name: string;
  params: JobParams;
  message: MessageInfo;
}

export class Scheduler {
  jobStore = new Map<string, Job>();
  scheduleJob = scheduleJob;

  schedule(name: string, params: JobParams, message: string, target: TextChannel): void {
    const job = this.scheduleJob(params, () => {
      void target.send(message);
    });
    this.jobStore.set(target.guild.id + name, job);
  }

  scheduleFromStore(storeJob: StorableJob, client: Client): void {
    const guild = client.guilds.cache.find((guild) => guild.id === storeJob.message.guild);
    if (!guild) {
      throw new Error("Guild not found");
    }
    const channel = guild.channels.cache.find((channel) => channel.id === storeJob.message.channel);
    if (!channel) {
      throw new Error("Channel not found");
    }

    if (!isTextChannel(channel)) {
      throw new Error("Channel found is not a text channel");
    }
    const job = this.scheduleJob(storeJob.params, () => {
      void channel.send(storeJob.message.content);
    });
    this.jobStore.set(storeJob.message.guild + storeJob.name, job);
  }

  has(name: string, guild: string): boolean {
    return this.jobStore.has(guild + name);
  }

  cancel(name: string, guild: string): boolean {
    const job = this.jobStore.get(guild + name);
    if (job) {
      job.cancel();
      this.jobStore.delete(guild + name);
      return true;
    } else {
      return false;
    }
  }
}
