'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HyperclickSuggestion} from '../../hyperclick/lib/types';

import nuclideUri from '../../commons-node/nuclideUri';
import invariant from 'assert';
import {GRAMMARS} from './constants';
import {goToLocation} from '../../commons-atom/go-to-location';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

const EXTENSIONS = new Set([
  'ml',
  'mli',
]);

module.exports = {
  priority: 20,
  providerName: 'nuclide-ocaml',
  async getSuggestionForWord(
    textEditor: atom$TextEditor,
    text: string,
    range: atom$Range,
  ): Promise<?HyperclickSuggestion> {

    if (!GRAMMARS.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    const file = textEditor.getPath();

    if (file == null) {
      return null;
    }

    let kind = 'ml';
    const extension = nuclideUri.extname(file);
    if (EXTENSIONS.has(extension)) {
      kind = extension;
    }

    const instance = await getServiceByNuclideUri('MerlinService', file);
    invariant(instance);
    const start = range.start;

    return {
      range,
      async callback() {
        try {
          await instance.pushNewBuffer(file, textEditor.getText());
          const location = await instance.locate(
            file,
            start.row,
            start.column,
            kind);
          if (!location) {
            return;
          }

          goToLocation(location.file, location.pos.line - 1, location.pos.col);
        } catch (e) {
          atom.notifications.addError(e.message, {dismissable: true});
        }
      },
    };
  },
};
