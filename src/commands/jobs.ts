import type { Command } from "./type";
import type { StorableJob } from "../services/schedule";

export const jobs: Command = {
  name: "jobs",
  permission: 1,
  description: "Lists the jobs that are stored",
  definition: "jobs",
  help: "use !jobs",
  async execute({ message, services }): Promise<void> {
    const { guild } = message;
    if (!guild) {
      await message.reply("must be used in a guild");
      return;
    }
    const jobs = await services.store.get<StorableJob[]>(`jobs::${guild.id}`);
    if (!jobs) throw new Error("StorableJob array missing from store service");
    if (jobs.length > 0) {
      const str = jobs.reduce((acc, job) => acc + "\n" + job.name, "");
      await message.reply(str);
    } else {
      await message.reply("no current jobs");
    }
  },
};
