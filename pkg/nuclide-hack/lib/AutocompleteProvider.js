'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Point, Range} from 'atom';
import {trackTiming} from '../../nuclide-analytics';
import {getHackLanguageForUri} from './HackLanguage';
import invariant from 'assert';

const FIELD_ACCESSORS = ['->', '::'];
const PREFIX_LOOKBACK = Math.max.apply(null, FIELD_ACCESSORS.map(prefix => prefix.length));

export default class AutocompleteProvider {

  @trackTiming('hack.getAutocompleteSuggestions')
  async getAutocompleteSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    const {editor, bufferPosition} = request;
    const replacementPrefix = findHackPrefix(editor);

    if (!replacementPrefix
      && !hasPrefix(editor, bufferPosition, FIELD_ACCESSORS, PREFIX_LOOKBACK)) {
      return [];
    }

    const completions = await fetchCompletionsForEditor(editor, replacementPrefix);

    return completions.map(completion => {
      return {
        ...completion,
        replacementPrefix: (completion.replacementPrefix === '')
          ? replacementPrefix : completion.replacementPrefix,
      };
    });
  }
}

/**
 * Returns true if `bufferPosition` is prefixed with any of the passed `checkPrefixes`.
 */
function hasPrefix(
    editor: atom$TextEditor,
    bufferPosition: atom$Point,
    checkPrefixes: Array<string>,
    prefixLookback: number,
  ): boolean {
  const priorChars = editor.getTextInBufferRange(new Range(
    new Point(bufferPosition.row, bufferPosition.column - prefixLookback),
    bufferPosition
  ));
  return checkPrefixes.some(prefix => priorChars.endsWith(prefix));
}

function findHackPrefix(editor: atom$TextEditor): string {
  const cursor = editor.getLastCursor();
  // We use custom wordRegex to adopt php variables starting with $.
  const currentRange = cursor.getCurrentWordBufferRange({wordRegex: /(\$\w*)|\w+/});
  // Current word might go beyond the cursor, so we cut it.
  const range = new Range(
      currentRange.start,
      new Point(cursor.getBufferRow(), cursor.getBufferColumn()));
  const prefix = editor.getTextInBufferRange(range).trim();
  // Prefix could just be $ or ends with string literal.
  if (prefix === '$' || !/[\W]$/.test(prefix)) {
    return prefix;
  } else {
    return '';
  }
}

async function fetchCompletionsForEditor(
  editor: atom$TextEditor,
  prefix: string,
): Promise<Array<atom$AutocompleteSuggestion>> {
  const hackLanguage = await getHackLanguageForUri(editor.getPath());
  const filePath = editor.getPath();
  if (!hackLanguage || !filePath) {
    return [];
  }

  invariant(filePath);
  const contents = editor.getText();
  const cursor = editor.getLastCursor();
  const offset = editor.getBuffer().characterIndexForPosition(cursor.getBufferPosition());
  // The returned completions may have unrelated results, even though the offset is set on the end
  // of the prefix.
  const completions = await hackLanguage.getCompletions(filePath, contents, offset);
  // Filter out the completions that do not contain the prefix as a token in the match text case
  // insentively.
  const tokenLowerCase = prefix.toLowerCase();

  const hackCompletionsComparator = compareHackCompletions(prefix);
  return completions
    .filter(completion => {
      invariant(completion.text != null);
      return completion.text.toLowerCase().indexOf(tokenLowerCase) >= 0;
    })
    // Sort the auto-completions based on a scoring function considering:
    // case sensitivity, position in the completion, private functions and alphabetical order.
    .sort((completion1, completion2) =>
      hackCompletionsComparator(completion1, completion2));
}

const MATCH_PREFIX_CASE_SENSITIVE_SCORE = 6;
const MATCH_PREFIX_CASE_INSENSITIVE_SCORE = 4;
const MATCH_TOKEN_CASE_SENSITIVE_SCORE = 2;
const MATCH_TOKEN_CASE_INSENSITIVE_SCORE = 0;
const MATCH_PRIVATE_FUNCTION_PENALTY = -4;
const MATCH_APLHABETICAL_SCORE = 1;

export function compareHackCompletions(
  token: string,
): (completion1: atom$AutocompleteSuggestion, completion2: atom$AutocompleteSuggestion) => number {
  const tokenLowerCase = token.toLowerCase();

  return (completion1: atom$AutocompleteSuggestion, completion2: atom$AutocompleteSuggestion) => {
    // Prefer completions with larger prefixes.
    invariant(completion1.replacementPrefix != null);
    invariant(completion2.replacementPrefix != null);
    const prefixComparison =
      completion2.replacementPrefix.length - completion1.replacementPrefix.length;
    if (prefixComparison !== 0) {
      return prefixComparison;
    }

    invariant(completion1.text != null);
    invariant(completion2.text != null);
    const texts: Array<string> = [completion1.text, completion2.text];
    const scores = texts.map((text, i) => {
      if (text.startsWith(token)) {
        // Matches starting with the prefix gets the highest score.
        return MATCH_PREFIX_CASE_SENSITIVE_SCORE;
      } else if (text.toLowerCase().startsWith(tokenLowerCase)) {
        // Ignore case score matches gets a good score.
        return MATCH_PREFIX_CASE_INSENSITIVE_SCORE;
      }

      let score;
      if (text.indexOf(token) !== -1) {
        // Small score for a match that contains the token case-sensitive.
        score = MATCH_TOKEN_CASE_SENSITIVE_SCORE;
      } else {
        // Zero score for a match that contains the token without case-sensitive matching.
        score = MATCH_TOKEN_CASE_INSENSITIVE_SCORE;
      }

      // Private functions gets negative score.
      if (text.startsWith('_')) {
        score += MATCH_PRIVATE_FUNCTION_PENALTY;
      }
      return score;
    });
    // Finally, consider the alphabetical order, but not higher than any other score.
    if (texts[0] < texts[1]) {
      scores[0] += MATCH_APLHABETICAL_SCORE;
    } else {
      scores[1] += MATCH_APLHABETICAL_SCORE;
    }
    return scores[1] - scores[0];
  };
}
