/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Datatip, ModifierKey} from '../../nuclide-datatip/lib/types';
import type {DefinitionService} from '../../nuclide-definition-service';

import Immutable from 'immutable';
import dedent from 'dedent';
import {Disposable} from 'atom';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {countOccurrences} from '../../commons-node/string';
import {
  getFileSystemServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {track, trackTiming} from '../../nuclide-analytics';

const MAX_PREVIEW_LINES = 10;

const WHITESPACE_REGEX = /^\s*/;
function getIndentLevel(line: string) {
  return WHITESPACE_REGEX.exec(line)[0].length;
}

async function getDefinitionPreview(definition) {
  const fs = getFileSystemServiceByNuclideUri(definition.path);
  const contents = (await fs.readFile(definition.path)).toString();
  const lines = contents.split('\n');

  const start = definition.position.row;
  const initialIndentLevel = getIndentLevel(lines[start]);

  const buffer = [];
  for (
    let i = start, openParenCount = 0, closedParenCount = 0;
    i < start + MAX_PREVIEW_LINES && i < lines.length;
    i++
  ) {
    const line = lines[i];
    const indentLevel = getIndentLevel(line);
    openParenCount += countOccurrences(line, '(');
    closedParenCount += countOccurrences(line, ')');

    buffer.push(line);

    // heuristic for the end of a function signature.
    // we've returned back to the original indentation level
    // and we have balanced pairs of parens
    if (
      indentLevel <= initialIndentLevel &&
      openParenCount === closedParenCount
    ) {
      break;
    }
  }

  return dedent(buffer.join('\n'));
}

function getPlatformKeys(platform) {
  if (platform === 'darwin') {
    return 'nuclide.hyperclick.darwinTriggerKeys';
  } else if (platform === 'win32') {
    return 'nuclide.hyperclick.win32TriggerKeys';
  }
  return 'nuclide.hyperclick.linuxTriggerKeys';
}

export default class HyperclickPreviewManager {
  _definitionService: ?DefinitionService;
  _disposables: UniversalDisposable = new UniversalDisposable();
  _triggerKeys: Set<ModifierKey> = new Set();

  constructor() {
    this._disposables.add(
      atom.config.observe(
        getPlatformKeys(process.platform),
        (newValue: string) => {
          this._triggerKeys = (new Set(newValue.split(',')): Set<any>);
        },
      ),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  async modifierDatatip(
    editor: TextEditor,
    position: atom$Point,
    heldKeys: Immutable.Set<ModifierKey>,
  ): Promise<?Datatip> {
    if (
      !this._triggerKeys ||
      // are the required keys held down?
      heldKeys.intersect(this._triggerKeys).size !== this._triggerKeys.size
    ) {
      return;
    }

    const grammar = editor.getGrammar();
    if (this._definitionService == null) {
      return null;
    }
    const result = await this._definitionService.getDefinition(
      editor,
      position,
    );
    if (result == null) {
      return null;
    }

    const {queryRange, definitions} = result;
    track('hyperclick-preview-popup', {
      grammar: grammar.name,
      definitionCount: definitions.length,
    });

    if (definitions.length === 1) {
      const definitionPreview = await trackTiming(
        'hyperclickPreview.getDefinitionPreview',
        () => getDefinitionPreview(definitions[0]),
      );
      return {
        markedStrings: [
          {
            type: 'snippet',
            value: definitionPreview,
            grammar,
          },
        ],
        range: queryRange[0],
      };
    }

    return {
      markedStrings: [
        {
          type: 'markdown',
          value: `${definitions.length} definitions found. Click to jump.`,
          grammar,
        },
      ],
      range: queryRange[0],
    };
  }

  setDefinitionService(service: DefinitionService): IDisposable {
    this._definitionService = service;

    return new Disposable(() => {
      this._definitionService = null;
    });
  }
}
