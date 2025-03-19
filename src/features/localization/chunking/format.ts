import { ExtendedError } from '@/errors';
import { CHUNK_TEMPLATE_REGEX } from './constants';

export const arrayToChunkedText = (strings: string[]) => {
  return strings.map((text, index) => `{{${index}}}${text}`).join('');
};

export const chunkedTextToArray = (text: string) => {
  const regex = CHUNK_TEMPLATE_REGEX;

  let match: RegExpExecArray | null;
  let previousChunk: null | { begin: number } = null;
  const values: string[] = [];

  let nextIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    const [matchedText, group] = match;

    const currentChunk = { begin: match.index };
    const chunkIndex = +group;
    if (chunkIndex !== nextIndex) {
      throw new ExtendedError(`Chunks order has been changed`, null, {
        expected: nextIndex,
        actual: chunkIndex,
      });
    }

    if (previousChunk) {
      values.push(text.slice(previousChunk.begin, currentChunk.begin));
    }

    previousChunk = { ...currentChunk, begin: match.index + matchedText.length };
    nextIndex++;
  }

  previousChunk && values.push(text.slice(previousChunk.begin));
  return values;
};
