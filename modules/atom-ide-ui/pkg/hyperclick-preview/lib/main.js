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

import type {
  ModifierKey,
  DatatipService,
  ModifierDatatipProvider,
} from '../../atom-ide-datatip';

import type {DefinitionProvider} from '../../atom-ide-definitions';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import createPackage from 'nuclide-commons-atom/createPackage';
import HyperclickPreviewManager from './HyperclickPreviewManager';

const PACKAGE_NAME = 'hyperclick-preview-datatip';

class Activation {
  _disposables: UniversalDisposable = new UniversalDisposable();
  hyperclickPreviewManager: HyperclickPreviewManager = new HyperclickPreviewManager();

  constructor() {
    this._disposables.add(this.hyperclickPreviewManager);
  }

  consumeDefinitionProvider(provider: DefinitionProvider): IDisposable {
    return this.hyperclickPreviewManager.consumeDefinitionProvider(provider);
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    const datatipProvider: ModifierDatatipProvider = {
      providerName: PACKAGE_NAME,
      priority: 1,
      modifierDatatip: (
        editor: atom$TextEditor,
        bufferPosition: atom$Point,
        heldKeys: Set<ModifierKey>,
      ) =>
        this.hyperclickPreviewManager.modifierDatatip(
          editor,
          bufferPosition,
          heldKeys,
        ),
    };

    const disposable = service.addModifierProvider(datatipProvider);
    this._disposables.add(disposable);
    return disposable;
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

createPackage(module.exports, Activation);
