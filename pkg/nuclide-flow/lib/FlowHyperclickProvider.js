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

import invariant from 'assert';

import {getFlowServiceByNuclideUri} from './FlowServiceFactory';
import {goToLocation} from '../../commons-atom/go-to-location';

import {JS_GRAMMARS} from './constants';
const JS_GRAMMARS_SET = new Set(JS_GRAMMARS);

class FlowHyperclickProvider {
  async getSuggestionForWord(
    textEditor: TextEditor,
    text: string,
    range: atom$Range,
  ): Promise<?HyperclickSuggestion> {
    if (!JS_GRAMMARS_SET.has(textEditor.getGrammar().scopeName)) {
      return null;
    }

    const filePath = textEditor.getPath();
    if (filePath == null) {
      return null;
    }
    const {start: position} = range;
    const flowService = getFlowServiceByNuclideUri(filePath);
    invariant(flowService);
    const location = await flowService
        .flowFindDefinition(filePath, textEditor.getText(), position.row + 1, position.column + 1);
    if (location) {
      return {
        range,
        callback() {
          goToLocation(location.file, location.point.line, location.point.column);
        },
      };
    } else {
      return null;
    }
  }
}

module.exports = FlowHyperclickProvider;
