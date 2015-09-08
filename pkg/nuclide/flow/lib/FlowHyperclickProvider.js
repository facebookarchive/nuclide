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

import {trackTiming} from 'nuclide-analytics';
import {getServiceByNuclideUri} from 'nuclide-client';
import {goToLocation} from 'nuclide-atom-helpers';

import {JS_GRAMMARS} from './constants.js';
var JS_GRAMMARS_SET = new Set(JS_GRAMMARS);

class FlowHyperclickProvider {
  @trackTiming('flow.find-definition')
  async getSuggestionForWord(textEditor: TextEditor, text: string, range: atom$Range):
      Promise<?HyperclickSuggestion> {
    if (!JS_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    var file = textEditor.getPath();
    var {start: position} = range;
    var flowService = getServiceByNuclideUri('FlowService', file);
    invariant(flowService);
    var location = await flowService
        .findDefinition(file, textEditor.getText(), position.row + 1, position.column + 1);
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
