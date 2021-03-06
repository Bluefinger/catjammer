import type { Command } from "./type";
import { commandsList } from "./commandsList";
import { schedule } from "./schedule";
import { ping } from "./ping";
import { help } from "./help";
import { color } from "./color";
import { cancel } from "./cancel";
import { permission } from "./permission";
import { jobs } from "./jobs";
import { greeting } from "./greeting";
import { gif } from "./gif";
import { postGif } from "./postGif";
import { reactor } from "./reactor";
import { poll } from "./poll";

export const commands: Command[] = [
  schedule,
  ping,
  commandsList,
  color,
  help,
  cancel,
  permission,
  jobs,
  greeting,
  gif,
  postGif,
  reactor,
  poll,
];
