import { ExtendedError } from '@/errors';
import { translate as _translate } from '@focus-reactive/content-ai-sdk';
import { arrayToChunkedText, chunkedTextToArray } from './chunking/format';
import { rearrangeChunkedText } from './chunking/rearrange';

export default async function translate({
  language,
  values,
}: {
  language: string;
  values: string[];
}) {
  const chunkedText = arrayToChunkedText(values);

  const translatedText = await _translate({
    targetLanguage: language,
    content: chunkedText,
    promptModifier:
      'Never translate, remove, move or modify any content inside double curly braces (e.g. {{example}}). You must strictly preserve the exact positions of double curly braces in the translated text.',
  });
  if (!translatedText) {
    throw new ExtendedError('OpenAI returned to response', null, { chunkedText, language });
  }

  let translatedValues = chunkedTextToArray(translatedText);

  if (translatedValues.length !== values.length) {
    // attempt to rearrange based on the original text
    const rearrangedChunkedText = rearrangeChunkedText(translatedText, chunkedText);
    translatedValues = chunkedTextToArray(rearrangedChunkedText);
    if (translatedValues.length !== values.length) {
      throw new ExtendedError(`Arrays lengths mismatch`, null, {
        original: values,
        translated: translatedValues,
      });
    }
  }

  return translatedValues;
}
