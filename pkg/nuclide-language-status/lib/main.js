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

import type {LanguageStatusProvider} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {LanguageStatusManager} from './LanguageStatusManager';

class Activation {
  _languageStatusManager: LanguageStatusManager;

  constructor(state: any) {
    this._languageStatusManager = new LanguageStatusManager();
    this._languageStatusManager.deserialize(state);
  }

  dispose() {
    this._languageStatusManager.dispose();
  }

  serialize(): any {
    const serialized = this._languageStatusManager.serialize();
    return serialized;
  }

  consumeLanguageStatusProvider(provider: LanguageStatusProvider): IDisposable {
    return this._languageStatusManager.addProvider(provider);
  }

  // FOR TESTING
  triggerProviderChange(): void {
    this._languageStatusManager._providersChanged.next();
  }
}

createPackage(module.exports, Activation);
