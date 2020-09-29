import { commandsList } from "./commandsList";
import { schedule } from "./schedule";
import { ping } from "./ping";
import { Command } from "./type";

export const commands: Command[] = [schedule, ping, commandsList];
