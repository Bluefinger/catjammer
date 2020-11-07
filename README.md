# catjammer

A Discord bot for the EU Draenor WoW Guild: catJAM.

## Info

Currently a big WIP, features will be outlined. Soon™.

## Installation

Use `pnpm` and install with `pnpm install` for the best experience.

## Production Setup & Usage

When installing in production env, `git clone` the repo specifically for the main branch. Run `pnpm install -P` to install only the needed production dependencies required to compile the bot via `pnpm run build`.

To run the bot in prod, use `pm2`:

- `pm2 start config/ecosystem.config.js` will start the bot.
- `pm2 reload config/ecosystem.config.js` will restart it.
- `pm2 stop config/ecosystem.config.js` will stop the bot.

To access logs, use `pm2 logs catjammer`, with `--lines <number>` allowing for getting more of the logs (default is 15 lines), and then `--err` for fetching the error logs, or `--out` for the info logs.

`pm2 flush` for clearing logs.
