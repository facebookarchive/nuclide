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
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';

import {getHackLanguageForUri} from './HackLanguage';
import {HACK_GRAMMARS_SET, HACK_GRAMMARS} from '../../nuclide-hack-common';
import invariant from 'assert';
import {Point} from 'atom';
import {trackTiming} from '../../nuclide-analytics';
import {getFileVersionOfEditor} from '../../nuclide-open-files';

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
    const fileVersion = await getFileVersionOfEditor(editor);
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (hackLanguage == null || fileVersion == null) {
      return null;
    }
    return await hackLanguage.getDefinition(fileVersion, position);
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
