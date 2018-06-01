/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {WelcomePage} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export type {WelcomePage};

const DISPLAY_COMMAND_NAME = 'nuclide-welcome-page:show-welcome-page';

class Activation {
  _disposables: UniversalDisposable;
  _activeWelcomePages: Map<string, WelcomePage>;

  constructor() {
    this._activeWelcomePages = new Map();
    this._disposables = new UniversalDisposable(
      () => this._activeWelcomePages.clear(),
      this._addDisplayCommand(),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWelcomePage(welcomePage: WelcomePage): IDisposable {
    const topic = welcomePage.topic;
    this._activeWelcomePages.set(topic, welcomePage);
    return new UniversalDisposable(() => {
      this._activeWelcomePages.delete(topic);
    });
  }

  _addDisplayCommand(): IDisposable {
    return atom.commands.add('atom-workspace', DISPLAY_COMMAND_NAME, () =>
      this._displayActiveWelcomePages(),
    );
  }

  _displayActiveWelcomePages(): void {
    const activeWelcomePages = Array.from(this._activeWelcomePages.keys());
    if (activeWelcomePages.length === 0) {
      atom.notifications.addInfo('No Active Welcome Pages!');
    } else {
      atom.notifications.addInfo(
        `Active Welcome Pages: ${activeWelcomePages.join()}`,
      );
    }
  }
}

createPackage(module.exports, Activation);
