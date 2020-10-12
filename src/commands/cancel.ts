import type { Command } from "./type";
import type { StorableJob } from "../services/schedule";

export const cancel: Command = {
  name: "cancel",
  description: "Cancels a scheduled message",
  definition: "cancel :name",
  help: "use !cancel <name>\n <name> name of the scheduled message you want to cancel",
  async execute({ message, args, services }): Promise<void> {
    const { name } = args;

    if (!message.guild) {
      await message.reply("Must be used in a guild channel");
      return;
    }
    const guildName = message.guild.name;

    if (!services.scheduler.has(name, message.guild.name)) {
      await message.reply("Job does not exist");
      return;
    }

    services.scheduler.cancel(name, message.guild.name);
    //remove persistance once implemented
    const jobs = await services.store.get<StorableJob[]>("jobs");
    if (!jobs) {
      throw new Error("Failed to get jobs from store");
    }

    const index = jobs.findIndex((job) => job.name === name && job.message.guild === guildName);

    if (index === -1) {
      throw new Error("Job not found in store array");
    }
    jobs.splice(index, 1);
    await services.store.set("jobs", jobs);
    await message.reply("Job removed");
  },
};
