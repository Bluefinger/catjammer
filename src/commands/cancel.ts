import type { Command } from "./type";
import type { StorableJob } from "../services/schedule";

export const cancel: Command = {
  name: "cancel",
  description: "Cancels a scheduled message",
  definition: "cancel :name",
  permission: 1,
  help: "use !cancel <name>\n <name> name of the scheduled message you want to cancel",
  async execute({ message, args, services }): Promise<void> {
    const { name } = args;

    if (!message.guild) {
      await message.reply("Must be used in a guild channel");
      return;
    }
    const guildName = message.guild.id;

    if (!services.scheduler.has(name, message.guild.id)) {
      await message.reply("Job does not exist");
      return;
    }

    services.scheduler.cancel(name, message.guild.id);

    const jobs = await services.store.get<StorableJob[]>(`jobs::${guildName}`);
    if (!jobs) {
      throw new Error("Failed to get jobs from store");
    }

    const filteredJobs = jobs.filter((job) => job.name !== name && job.message.guild !== guildName);
    if (filteredJobs.length === jobs.length) {
      throw new Error("Job was found in memory but does not exist in the store");
    } else {
      await services.store.set(`jobs::${guildName}`, filteredJobs);
      await message.reply("Job removed");
    }
  },
};
