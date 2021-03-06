import { GuildMember, Message, MessageReaction, TextChannel } from "discord.js";

export const emojis: string[] = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export interface PollMessage {
  name: string;
  mutExcl: boolean;
  message: Message;
  choices: Map<string, string>;
}

export class PollManager {
  private cachedPolls = new Map<string, PollMessage>();

  async createPoll(
    channel: TextChannel,
    name: string,
    pollOptions: string[],
    mutExcl: boolean,
    duration: number
  ): Promise<void> {
    const choices = new Map<string, string>();
    pollOptions.forEach((option, i) => choices.set(emojis[i], option));
    const message = await channel.send(this.buildMessageString(name, pollOptions));
    //react
    for (const emoji of choices.keys()) {
      await message.react(emoji);
    }
    this.cachedPolls.set(message.id, { name, mutExcl, message, choices });
    this.scheduleFinish(() => {
      void this.finishPoll(message.id);
    }, duration);
  }

  buildMessageString(title: string, pollOptions: string[]): string {
    return pollOptions.reduce(
      (message, option, i) => `${message}\n${emojis[i]} = ${option}`,
      title
    );
  }

  buildResultString(reactions: MessageReaction[], poll: PollMessage): string {
    const { name, choices } = poll;
    let resultString = `Result for ${name}`;
    for (const { emoji, count } of reactions) {
      const choice = choices.get(emoji.toString());
      if (!count) {
        throw new Error("Reaction has a null count");
      }
      const votes = (count - 1).toString();
      if (!choice) {
        throw new Error("Poll choice does not exist in cache");
      }
      resultString += `\n${choice} votes = ${votes}`;
    }
    return resultString;
  }

  scheduleFinish(callback: () => void, duration: number): void {
    setTimeout(callback, duration * 1000);
  }

  async finishPoll(id: string): Promise<void> {
    const poll = this.cachedPolls.get(id);
    if (!poll) {
      throw new Error("Message does not exist in cache");
    }
    const reactions = poll.message.reactions.cache.array();
    if (!reactions) {
      throw new Error("Reactions array is null");
    }
    const resultString = this.buildResultString(reactions, poll);
    await poll.message.channel.send(resultString);
    await poll.message.delete();
  }

  has(id: string): boolean {
    return this.cachedPolls.has(id);
  }

  remove(id: string): void {
    this.cachedPolls.delete(id);
  }

  add(id: string, poll: PollMessage): void {
    this.cachedPolls.set(id, poll);
  }

  async reactionHandler(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const cachedMessage = this.cachedPolls.get(reaction.message.id);
    if (!cachedMessage) {
      throw new Error("Message ID does not exist in poll cache");
    }

    const choiceEmojis = [...cachedMessage.choices.keys()];

    if (!choiceEmojis.includes(reaction.emoji.toString())) {
      await reaction.remove();
    } else {
      if (cachedMessage.mutExcl) {
        await this.removePreviousReaction(reaction, member);
      }
    }
  }

  async removePreviousReaction(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const cachedReactions = reaction.message.reactions.cache.array();
    for (const cachedReaction of cachedReactions) {
      if (cachedReaction.emoji.toString() !== reaction.emoji.toString()) {
        await cachedReaction.users.remove(member);
      }
    }
  }
}
