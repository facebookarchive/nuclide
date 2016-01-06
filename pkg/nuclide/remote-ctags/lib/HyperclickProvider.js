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
import type {CtagsResult, CtagsService} from '../../remote-ctags-base';

import {goToLocation} from '../../atom-helpers';
import {getLogger} from '../../logging';
import {getServiceByNuclideUri} from '../../remote-connection';
import {dirname, getPath, relative} from '../../remote-uri';

const LIMIT = 100;

// Taken from http://ctags.sourceforge.net/FORMAT
const CTAGS_KIND_NAMES = {
  c: 'class',
  d: 'define',
  e: 'enum',
  f: 'function',
  F: 'file',
  g: 'enum',
  m: 'member',
  p: 'function',
  s: 'struct',
  t: 'typedef',
  u: 'union',
  v: 'var',
};

/**
 * If a line number is specified by the tag, jump to that line.
 * Otherwise, we'll have to look up the pattern in the file.
 */
function createCallback(tag: CtagsResult) {
  return async () => {
    let {lineNumber, pattern} = tag;
    if (lineNumber) {
      lineNumber--; // ctags line numbers start at 1
    } else if (pattern != null) {
      // ctags regexps are just string matches
      if (pattern.startsWith('/^') && pattern.endsWith('$/')) {
        pattern = pattern.substr(2, pattern.length - 4);
      }
      try {
        // Search for the pattern in the file.
        const contents = await getServiceByNuclideUri('FileSystemService', tag.file)
          .readFile(getPath(tag.file));
        const lines = contents.toString('utf8').split('\n');
        lineNumber = lines.indexOf(pattern);
        if (lineNumber === -1) {
          lineNumber = 0;
        }
      } catch (e) {
        getLogger().warn(`nuclide-remote-ctags: Could not locate pattern in ${tag.file}`, e);
      }
    }
    goToLocation(tag.file, lineNumber, 0);
  };
}

function commonPrefixLength(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) {
    i++;
  }
  return i;
}

export class HyperclickProvider {

  async getSuggestionForWord(
    textEditor: atom$TextEditor,
    text: string,
    range: atom$Range,
  ): Promise<?HyperclickSuggestion> {
    const path = textEditor.getPath();
    if (path == null) {
      return null;
    }

    const service = (await getServiceByNuclideUri('CtagsService', path)
      .getCtagsService(path): ?CtagsService);
    if (service == null) {
      return null;
    }

    const tags = await service.findTags(text, {limit: LIMIT});
    if (!tags.length) {
      return null;
    }

    if (tags.length === 1) {
      return {range, callback: createCallback(tags[0])};
    }

    // Favor tags in the nearest directory by sorting by common prefix length.
    tags.sort(({file: a}, {file: b}) => {
      const len = commonPrefixLength(path, b) - commonPrefixLength(path, a);
      if (len === 0) {
        return a.localeCompare(b);
      }
      return len;
    });

    const tagsDir = dirname(await service.getTagsPath());
    return {
      range,
      callback: tags.map(tag => {
        const relpath = relative(tagsDir, tag.file);
        let title = `${tag.name} (${relpath})`;
        if (tag.kind != null && CTAGS_KIND_NAMES[tag.kind] != null) {
          title = CTAGS_KIND_NAMES[tag.kind] + ' ' + title;
        }
        return {
          title,
          callback: createCallback(tag),
        };
      }),
    };
  }

}
