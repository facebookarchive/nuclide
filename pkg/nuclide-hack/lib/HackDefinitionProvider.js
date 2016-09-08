'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Definition, DefinitionQueryResult} from '../../nuclide-definition-service';

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

    const definitions =
      await hackLanguage.getIdeDefinition(filePath, contents, line + 1, column + 1);
    if (definitions.length === 0) {
      return null;
    }
    const projectRoot = hackLanguage.getBasePath();
    invariant(projectRoot != null);
    function convertDefinition(definition) {
      return {
        path: definition.path,
        position: new Point(definition.line - 1, definition.column - 1),
        // TODO: range
        projectRoot,
        id: definition.name,
        name: definition.name,
        language: 'php',
      };
    }
    return {
      queryRange: definitions[0].queryRange,
      definitions: definitions.map(convertDefinition),
    };
  }

  @trackTiming('hack.get-definition-by-id')
  async getDefinitionById(filePath: NuclideUri, id: string): Promise<?Definition> {
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (hackLanguage == null) {
      return null;
    }

    const definition = await hackLanguage.getDefinitionById(filePath, id);
    if (definition == null) {
      return null;
    }

    const result = {
      path: definition.position.filename,
      position: new Point(definition.position.line - 1, definition.position.char_start - 1),
      name: definition.name,
      language: 'php',
      // TODO: range, project root
    };
    if (typeof definition.id === 'string') {
      return {
        ...result,
        id: definition.id,
      };
    } else {
      return result;
    }
  }
}
