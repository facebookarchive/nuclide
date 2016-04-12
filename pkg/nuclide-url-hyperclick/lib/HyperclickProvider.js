'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickSuggestion} from '../../hyperclick-interfaces';

import {Range} from 'atom';
import shell from 'shell';

// "urlregexp" uses the "g" flag. Since we only care about the first result,
// we make a copy of it w/o the "g" flag so we don't have to reset `lastIndex`
// after every use.
const urlregexp = RegExp(require('urlregexp').source);

export class HyperclickProvider {
  priority: number;
  providerName: string;
  wordRegExp: RegExp;

  constructor() {
    this.wordRegExp = /[^\s]+/g;
    // Allow all language-specific providers to take priority.
    this.priority = 5;
    this.providerName = 'url-hyperclick';
  }

  async getSuggestionForWord(
    textEditor: atom$TextEditor,
    text: string,
    range: atom$Range
  ): Promise<?HyperclickSuggestion> {
    // The match is an array that also has an index property, something that Flow does not appear to
    // understand.
    const match: any = text.match(urlregexp);
    if (match == null) {
      return null;
    }

    const [url] = match;
    const index = match.index;
    const matchLength = url.length;

    // Update the range to include only what was matched
    const urlRange = new Range(
      [range.start.row, range.start.column + index],
      [range.end.row,   range.start.column + index + matchLength],
    );

    return {
      range: urlRange,
      callback: () => {
        let validUrl;
        if (url.startsWith('http://') || url.startsWith('https://')) {
          validUrl = url;
        } else {
          // Now that we match urls like 'facebook.com', we have to prepend http:// to them for them to
          // open properly.
          validUrl = 'http://' + url;
        }
        shell.openExternal(validUrl);
      },
    };
  }
}
