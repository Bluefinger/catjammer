import { commandsList } from "./commandsList";
import { schedule } from "./schedule";
import { ping } from "./ping";
import { help } from "./help";
import { Command } from "./type";
import { color } from "./color";
import { cancel } from "./cancel";

export const commands: Command[] = [schedule, ping, commandsList, color, help, cancel];
