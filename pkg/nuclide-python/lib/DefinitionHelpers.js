'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DefinitionQueryResult} from '../../nuclide-definition-service';

import invariant from 'assert';
import {Point} from 'atom';
import wordAtPosition from '../../commons-atom/word-at-position';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';
import {GRAMMAR_SET} from './constants';

export default class DefinitionHelpers {

  @trackTiming('python.get-definition')
  static async getDefinition(
    editor: TextEditor,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    invariant(GRAMMAR_SET.has(editor.getGrammar().scopeName));

    const src = editor.getPath();
    if (src == null) {
      return null;
    }

    const line = position.row;
    const column = position.column;
    const contents = editor.getText();

    const wordMatch = wordAtPosition(editor, position);
    if (wordMatch == null) {
      return null;
    }

    const {range} = wordMatch;

    const service = getServiceByNuclideUri('JediService', src);
    if (service == null) {
      return null;
    }

    const result = await service.getDefinitions(
      src,
      contents,
      line,
      column,
    );
    if (result == null) {
      return null;
    }

    if (result.definitions.length === 0) {
      return null;
    }

    const definitions = result.definitions.map(definition => ({
      path: definition.file,
      position: new Point(definition.line, definition.column),
      id: definition.text,
      name: definition.text,
    }));

    return {
      queryRange: range,
      definitions,
    };
  }

}
