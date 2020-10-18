import type { Command } from "./type";
import type { StorableJob } from "../services/schedule";

export const jobs: Command = {
  name: "jobs",
  permission: 1,
  description: "Lists the jobs that are stored",
  definition: "jobs",
  help: "use !jobs",
  async execute({ message, services }): Promise<void> {
    if (!message.guild) {
      await message.reply("must be used in a guild");
      return;
    }
    const jobs = await services.store.get<StorableJob[]>("jobs");
    if (!jobs) throw new Error("StorableJob array missing from store service");
    const filteredJobs = jobs.filter((job) => job.message.guild === message.guild?.id);
    const str = filteredJobs.reduce((acc, job) => acc + "\n" + job.name, "");
    if (str.length === 0) {
      await message.reply("no current jobs");
    } else {
      await message.reply(str);
    }
  },
};
