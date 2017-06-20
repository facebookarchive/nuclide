/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import createPackage from 'nuclide-commons-atom/createPackage';
import {DatatipManager} from './DatatipManager';

// Borrowed from the LSP API.
export type MarkedString =
  | {
      type: 'markdown',
      value: string,
    }
  | {
      type: 'snippet',
      grammar: atom$Grammar,
      value: string,
    };

export type Datatip =
  | {|
      component: ReactClass<any>,
      range: atom$Range,
      pinnable?: boolean,
    |}
  | {|
      markedStrings: Array<MarkedString>,
      range: atom$Range,
      pinnable?: boolean,
    |};

export const ModifierKeys = Object.freeze({
  META: 'metaKey',
  SHIFT: 'shiftKey',
  ALT: 'altKey',
  CTRL: 'ctrlKey',
});

export type ModifierKey = 'metaKey' | 'shiftKey' | 'altKey' | 'ctrlKey';

export type PinnedDatatip = {
  dispose(): void,
};

export type DatatipProvider = {
  priority: number,
  grammarScopes?: Array<string>,
  // A unique name for the provider to be used for analytics.
  // It is recommended that it be the name of the provider's package.
  providerName: string,
  datatip(
    editor: atom$TextEditor,
    bufferPosition: atom$Point,
  ): Promise<?Datatip>,
};

export type ModifierDatatipProvider = {
  priority: number,
  grammarScopes?: Array<string>,
  providerName: string,
  modifierDatatip(
    editor: atom$TextEditor,
    bufferPosition: atom$Point,
    heldKeys: Set<ModifierKey>,
  ): Promise<?Datatip>,
};

export type AnyDatatipProvider = DatatipProvider | ModifierDatatipProvider;

export type DatatipService = {
  addProvider(provider: DatatipProvider): IDisposable,
  addModifierProvider(provider: ModifierDatatipProvider): IDisposable,
  createPinnedDataTip(datatip: Datatip, editor: TextEditor): PinnedDatatip,
};

class Activation {
  _datatipManager: DatatipManager;

  constructor() {
    this._datatipManager = new DatatipManager();
  }

  provideDatatipService(): DatatipService {
    return this._datatipManager;
  }

  dispose() {
    this._datatipManager.dispose();
  }
}

createPackage(module.exports, Activation);
