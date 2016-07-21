'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Level, OutputService} from '../../nuclide-console/lib/types';

import {CompositeDisposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
import {getNuclideConsoleMessages} from '../../nuclide-logging/lib/nuclideConsoleAppender';

class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  consumeOutputService(api: OutputService): void {
    const messages = getNuclideConsoleMessages()
      .map(loggingEvent => ({
        text: loggingEvent.data,
        level: getLevel(loggingEvent.level),
      }));
    this._disposables.add(api.registerOutputProvider({id: 'Nuclide', messages}));
  }

  dispose() {
    this._disposables.dispose();
  }
}

function getLevel(atomNotificationType: string): Level {
  switch (atomNotificationType) {
    case 'debug':
    case 'error':
    case 'info':
      return atomNotificationType;
    case 'warn':
      return 'warning';
    default:
      return 'log';
  }
}

export default createPackage(Activation);
