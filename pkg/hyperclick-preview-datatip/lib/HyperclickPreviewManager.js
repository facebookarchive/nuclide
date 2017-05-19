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
import {Disposable} from 'atom';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  getDefinitionPreviewServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {track, trackTiming} from '../../nuclide-analytics';

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
      const definition = definitions.pop();
      // Some providers (e.g. Flow) return negative positions.
      if (definition.position.row < 0) {
        return null;
      }

      const {getDefinitionPreview} = getDefinitionPreviewServiceByNuclideUri(
        definition.path,
      );

      const definitionPreview = await trackTiming(
        'hyperclickPreview.getDefinitionPreview',
        () => getDefinitionPreview(definition),
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
