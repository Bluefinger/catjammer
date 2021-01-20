import { GuildMember, Message, MessageReaction, TextChannel } from "discord.js";

const emojis: string[] = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

interface PollMessage {
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
    let messageString = "";
    const choices = new Map<string, string>();
    for (let i = 0; i < pollOptions.length; i++) {
      const emoji = emojis[i];
      const option = pollOptions[i];
      messageString += `${emoji} = ${option}\n`;
      choices.set(emoji, option);
    }
    const message = await channel.send(messageString);
    for (const emoji of this.cachedPolls.keys()) {
      await message.react(emoji);
    }
    this.cachedPolls.set(message.id, { name, mutExcl, message, choices });
    setTimeout(async () => {
      await this.finishPoll(message.id);
    }, duration * 1000);
  }

  async finishPoll(id: string): Promise<void> {
    const message = this.cachedPolls.get(id);
    if (!message) {
      throw new Error("Message does not exist in cache");
    }
    const reactions = message.message.reactions.cache.array();
    if (!reactions) {
      throw new Error("Reactions array is null");
    }
    let resultString = `Result for ${message.name}`;
    for (const { emoji, count } of reactions) {
      const choice = message.choices.get(emoji.toString());
      if (!count) {
        throw new Error("Reaction has a null count");
      }
      const votes = (count - 1).toString();
      if (!votes) {
        throw new Error("Reaction count returned null");
      }
      if (!choice) {
        throw new Error("Poll choice does not exist in cache");
      }
      resultString += `${choice} vote = ${votes}`;
    }
    await message.message.channel.send(resultString);
    await message.message.delete();
  }

  has(id: string): boolean {
    return this.cachedPolls.has(id);
  }

  remove(id: string): void {
    this.cachedPolls.delete(id);
  }

  async reactionHandler(reaction: MessageReaction, member: GuildMember): Promise<void> {
    const cachedMessage = this.cachedPolls.get(reaction.message.id);
    if (!cachedMessage) {
      throw new Error("Message ID does not exist in poll cache");
    }

    const choiceEmojis = [...cachedMessage.choices.keys()];

    if (!choiceEmojis.includes(reaction.emoji.toString())) {
      await reaction.remove();
    }

    if (cachedMessage.mutExcl) {
      await this.removePreviousReaction(reaction, member);
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
