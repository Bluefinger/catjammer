const stripMention = /<(?:#|@(?:&|!)?)(\d+)>/g;

const extractor = (_: unknown, id: string) => id;

export const extractId = (mention: string): string => {
  const extracted = mention.replace(stripMention, extractor);
  return extracted !== mention ? extracted : "";
};
