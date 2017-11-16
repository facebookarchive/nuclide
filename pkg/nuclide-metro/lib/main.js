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
import type {OutputService} from '../../nuclide-console/lib/types';

import invariant from 'assert';
import createPackage from 'nuclide-commons-atom/createPackage';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {BehaviorSubject, Observable} from 'rxjs';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {LogTailer} from '../../nuclide-console/lib/LogTailer';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  NO_METRO_PROJECT_ERROR,
  METRO_PORT_BUSY_ERROR,
} from '../../nuclide-metro-rpc/lib/types';
import {getMetroServiceByNuclideUri} from '../../nuclide-remote-connection';
import electron from 'electron';

// Manages starting Metro for the current working root and integrating it into Console.
// Use this service instead of starting Metro via nuclide-metro-rpc yourself.
export type MetroAtomService = {
  start(): Promise<void>,
};

class Activation {
  _logTailer: LogTailer;
  _projectRootPath: BehaviorSubject<?NuclideUri>;
  _disposables: UniversalDisposable;

  constructor(serializedState: ?Object) {
    this._projectRootPath = new BehaviorSubject(null);
    const metroEvents = Observable.defer(() => {
      const path = this._projectRootPath.getValue();
      if (path == null) {
        return Observable.empty();
      }
      const metroService = getMetroServiceByNuclideUri(path);
      return metroService
        .startMetro(path, this._getEditorArgs(path))
        .refCount();
    }).share();

    const messages = metroEvents
      .filter(event => event.type === 'message')
      .map(event => {
        invariant(event.type === 'message');
        return {...event.message};
      });
    const ready = metroEvents
      .filter(message => message.type === 'ready')
      .mapTo(undefined);

    this._logTailer = new LogTailer({
      name: 'Metro',
      messages,
      ready,
      handleError(error) {
        atom.notifications.addError(
          `Unexpected error while running Metro.\n\n${error.message}`,
          {
            dismissable: true,
          },
        );
      },
      trackingEvents: {
        start: 'metro:start',
        stop: 'metro:stop',
        restart: 'metro:restart',
      },
    });

    this._disposables = new UniversalDisposable(
      atom.commands.add('atom-workspace', {
        // Ideally based on CWD, the commands can be disabled and the UI would explain why.
        'nuclide-metro:start': () => this.start(),
        'nuclide-metro:stop': () => this.stop(),
        'nuclide-metro:restart': () => this.restart(),
        'nuclide-metro:reload-app': () => this.reloadApp(),
      }),
      () => this.stop(),
    );
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._logTailer.start({
        onRunning: error => {
          if (error != null) {
            // Handling these errors here because LogTailer never becomes "ready"
            if (error.code === NO_METRO_PROJECT_ERROR) {
              atom.notifications.addError('Could not find Metro project', {
                dismissable: true,
                description:
                  'Make sure that your current working root (or its ancestor) contains a' +
                  ' `node_modules` directory with react-native installed, or a .buckconfig file' +
                  ' with a `[react-native]` section that has a `server` key.',
              });
            } else if (error.code === METRO_PORT_BUSY_ERROR) {
              atom.notifications.addWarning(
                'Metro failed to start. This is expected if you are ' +
                  'intentionally running Metro in a separate terminal. If not, ' +
                  '`lsof -i tcp:8081` might help you find the process using the default port.',
                {
                  dismissable: true,
                },
              );
            }
            reject(error);
          } else {
            resolve();
          }
        },
      });
    });
  }

  stop(): void {
    this._logTailer.stop();
  }

  restart(): void {
    this._logTailer.restart();
  }

  reloadApp(): void {
    const path = this._projectRootPath.getValue();
    if (path == null) {
      return;
    }
    const metroService = getMetroServiceByNuclideUri(path);
    metroService.reloadApp();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideMetroAtomService(): MetroAtomService {
    return {
      start: () => this.start(),
    };
  }

  _getEditorArgs(projectRoot: NuclideUri): Array<string> {
    if (nuclideUri.isRemote(projectRoot)) {
      return ['atom'];
    } else {
      const remote = electron.remote;
      invariant(remote != null);
      const args = [remote.app.getPath('exe')];
      if (atom.devMode) {
        args.push('--dev');
      }
      return args;
    }
  }

  consumeCwdApi(api: CwdApi): void {
    this._disposables.add(
      this._projectRootPath.distinctUntilChanged().subscribe(path => {
        if (this._logTailer.getStatus() !== 'stopped') {
          this.stop();
          const notification = atom.notifications.addWarning(
            'Metro was stopped, because your Current Working Root has changed.',
            {
              dismissable: true,
              buttons: [
                {
                  text: 'Start at this new working root',
                  onDidClick: () => {
                    this.start();
                    notification.dismiss();
                  },
                },
              ],
            },
          );
        }
      }),
      api.observeCwd(dir => {
        this._projectRootPath.next(dir == null ? null : dir.getPath());
      }),
    );
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'Metro',
        messages: this._logTailer.getMessages(),
        observeStatus: cb => this._logTailer.observeStatus(cb),
        start: () => {
          this.start();
        },
        stop: () => {
          this.stop();
        },
      }),
    );
  }
}

createPackage(module.exports, Activation);
