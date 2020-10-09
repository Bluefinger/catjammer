import type { Command } from "./type";
import { commandsList } from "./commandsList";
import { schedule } from "./schedule";
import { ping } from "./ping";
import { help } from "./help";
import { color } from "./color";
import { cancel } from "./cancel";
import { permission } from "./permission";

export const commands: Command[] = [schedule, ping, commandsList, color, help, cancel, permission];
