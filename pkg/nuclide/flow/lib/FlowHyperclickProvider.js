'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {getServiceByNuclideUri} from 'nuclide-client';
import {goToLocation} from 'nuclide-atom-helpers';

import {JS_GRAMMARS} from './constants.js';
const JS_GRAMMARS_SET = new Set(JS_GRAMMARS);

class FlowHyperclickProvider {
  async getSuggestionForWord(textEditor: TextEditor, text: string, range: atom$Range):
      Promise<?HyperclickSuggestion> {
    if (!JS_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    const file = textEditor.getPath();
    const {start: position} = range;
    const flowService = getServiceByNuclideUri('FlowService', file);
    invariant(flowService);
    const location = await flowService
        .flowFindDefinition(file, textEditor.getText(), position.row + 1, position.column + 1);
    if (location) {
      return {
        range,
        callback() {
          goToLocation(location.file, location.line, location.column);
        },
      };
    } else {
      return null;
    }
  }
}

module.exports = FlowHyperclickProvider;
