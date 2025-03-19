import { CHUNK_TEMPLATE_REGEX, SENTENCES_REGEX } from './constants';

type ChunkCoordinates = {
  id: number;
  sentence: number;
  distance: number;
  position: 'word' | 'single'; // 'word' if the chunk is part of a word, 'single' if it stands alone
};
/**
 * Attempts to rearrange chunks in the translated text to match their positions in the original text when ChatGPT
 * fails to preserve chunk positions. The rearrangement is based on the distance (in percentage) of each chunk
 * from the beginning of the sentence in the original text.
 *
 * @param translatedText
 * @param originalText
 * @returns
 */
export const rearrangeChunkedText = (translatedText: string, originalText: string) => {
  const translatedSentences = translatedText.match(SENTENCES_REGEX) || [translatedText];

  const chunkPositions: ChunkCoordinates[] = extractChunkPositions(originalText);

  // Reconstruct the translated text with chunks in their original positions
  const newSentences = translatedSentences.map((sentence, sentenceIndex) => {
    const cleanSentence = sentence.replace(CHUNK_TEMPLATE_REGEX, '');
    const words = cleanSentence.split(' ');

    chunkPositions
      .filter((chunk) => chunk.sentence === sentenceIndex)
      .forEach((chunk) => {
        const insertIndex = Math.floor(chunk.distance * words.length);

        if (chunk.position === 'word') {
          words[insertIndex] = words[insertIndex] + '{{' + chunk.id + '}}';
        } else {
          words.splice(insertIndex, 0, '{{' + chunk.id + '}}');
        }
      });

    return words.join(' ');
  });

  return newSentences.join('');
};

const extractChunkPositions = (text: string) => {
  const chunkPositions: ChunkCoordinates[] = [];
  const sentences = text.match(SENTENCES_REGEX) || [text];

  // Record the positions of chunks in the original text
  sentences.forEach((sentence, sentenceIndex) => {
    const words = sentence.split(' ');

    words.forEach((word, wordIndex) => {
      const match = CHUNK_TEMPLATE_REGEX.exec(word);
      if (match) {
        const [matchedText, group] = match;
        chunkPositions.push({
          id: +group,
          sentence: sentenceIndex,
          distance: wordIndex / words.length,
          position: matchedText === word ? 'single' : 'word',
        });
      }
    });
  });

  return chunkPositions;
};
