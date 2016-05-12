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

import {getHackLanguageForUri} from './HackLanguage';
import {HACK_GRAMMARS_SET, HACK_GRAMMARS} from '../../nuclide-hack-common';
import invariant from 'assert';
import {Point} from 'atom';
import {trackTiming} from '../../nuclide-analytics';

export class HackDefinitionProvider {
  name: string;
  priority: number;
  grammarScopes: Array<string>;

  constructor() {
    this.name = 'HackDefinitionProvider';
    this.priority = 20;
    this.grammarScopes = HACK_GRAMMARS;
  }

  @trackTiming('hack.get-definition')
  async getDefinition(editor: TextEditor, position: atom$Point): Promise<?DefinitionQueryResult> {
    invariant(HACK_GRAMMARS_SET.has(editor.getGrammar().scopeName));

    const filePath = editor.getPath();
    if (filePath == null) {
      return null;
    }

    const hackLanguage = await getHackLanguageForUri(filePath);
    if (hackLanguage == null) {
      return null;
    }

    const line = position.row;
    const column = position.column;
    const contents = editor.getText();

    const definition =
      await hackLanguage.getIdeDefinition(filePath, contents, line + 1, column + 1);
    if (definition == null) {
      return null;
    }
    return {
      queryRange: definition.queryRange,
      definition: {
        path: definition.path,
        position: new Point(definition.line - 1, definition.column - 1),
        range: null, // TODO
        definition: definition.name,
      },
    };
  }
}
