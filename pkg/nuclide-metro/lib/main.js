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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {OutputService} from 'atom-ide-ui';
import type {MetroAtomService} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {BehaviorSubject} from 'rxjs';
import {DefaultMetroAtomService} from './DefaultMetroAtomService';

class Activation {
  _projectRootPath: BehaviorSubject<?NuclideUri>;
  _disposables: UniversalDisposable;
  _metroAtomService: DefaultMetroAtomService;

  constructor(serializedState: ?Object) {
    this._projectRootPath = new BehaviorSubject(null);
    this._metroAtomService = new DefaultMetroAtomService(this._projectRootPath);

    this._disposables = new UniversalDisposable(
      this._metroAtomService,
      atom.commands.add('atom-workspace', {
        // Ideally based on CWD, the commands can be disabled and the UI would explain why.
        'nuclide-metro:start': () =>
          this._metroAtomService.start('ask_about_tunnel'),
        'nuclide-metro:stop': () => this._metroAtomService.stop(),
        'nuclide-metro:restart': () => this._metroAtomService.restart(),
        'nuclide-metro:reload-app': () => this._metroAtomService.reloadApp(),
      }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideMetroAtomService(): MetroAtomService {
    return this._metroAtomService;
  }

  consumeCwdApi(api: CwdApi): void {
    this._disposables.add(
      api.observeCwd(dir => {
        this._projectRootPath.next(dir == null ? null : dir.getPath());
      }),
    );
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'Metro',
        messages: this._metroAtomService._logTailer.getMessages(),
        observeStatus: cb => this._metroAtomService.observeStatus(cb),
        start: () => {
          this._metroAtomService.start('ask_about_tunnel');
        },
        stop: () => {
          this._metroAtomService.stop();
        },
      }),
    );
  }
}

createPackage(module.exports, Activation);
