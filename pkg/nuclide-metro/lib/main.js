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
import type {MetroAtomService, TunnelBehavior} from './types';

import invariant from 'assert';
import createPackage from 'nuclide-commons-atom/createPackage';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {BehaviorSubject, Observable} from 'rxjs';
import {LogTailer} from '../../nuclide-console-base/lib/LogTailer';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {
  NO_METRO_PROJECT_ERROR,
  METRO_PORT_BUSY_ERROR,
} from '../../nuclide-metro-rpc/lib/types';
import {getMetroServiceByNuclideUri} from '../../nuclide-remote-connection';
import {getLogger} from 'log4js';
import electron from 'electron';
import {openTunnel} from './openTunnel';

const GLOBAL_RELOAD_HOTKEY = 'CmdOrCtrl+Alt+R';
const logger = getLogger('Metro');

class Activation {
  _logTailer: LogTailer;
  _projectRootPath: BehaviorSubject<?NuclideUri>;
  _disposables: UniversalDisposable;
  _currentTunnelDisposable: ?UniversalDisposable;

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
        'nuclide-metro:start': () => this.start('ask_about_tunnel'),
        'nuclide-metro:stop': () => this.stop(),
        'nuclide-metro:restart': () => this.restart(),
        'nuclide-metro:reload-app': () => this.reloadApp(),
      }),
      () => this.stop(),
    );
  }

  async start(tunnelBehavior: TunnelBehavior): Promise<void> {
    await new Promise((resolve, reject) => {
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
    // now that the logTailer has started, start the global reload hotkey
    const remote = electron.remote;
    invariant(remote != null);
    logger.trace('adding global reload hotkey (' + GLOBAL_RELOAD_HOTKEY + ')');
    const success = remote.globalShortcut.register(GLOBAL_RELOAD_HOTKEY, () => {
      logger.trace('reloading the app via the global reload hotkey');
      this.reloadApp();
    });
    logger.trace('hotkey register success: ' + String(success));
    const projectRoot = this._projectRootPath.getValue();
    invariant(projectRoot != null);
    this._currentTunnelDisposable = await openTunnel(
      projectRoot,
      tunnelBehavior,
    );
  }

  stop(): void {
    const remote = electron.remote;
    invariant(remote != null);
    logger.trace('unregistering global reload hotkey');
    remote.globalShortcut.unregister(GLOBAL_RELOAD_HOTKEY);
    if (this._currentTunnelDisposable != null) {
      this._currentTunnelDisposable.dispose();
      this._currentTunnelDisposable = null;
    }
    this._logTailer.stop();
  }

  restart(): void {
    this._logTailer.restart();
  }

  reloadApp(): void {
    logger.trace('reloadApp called');
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
      start: tunnelBehavior => this.start(tunnelBehavior),
      stop: () => this.stop(),
      observeStatus: callback => this._logTailer.observeStatus(callback),
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
                    this.start('ask_about_tunnel');
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
          this.start('ask_about_tunnel');
        },
        stop: () => {
          this.stop();
        },
      }),
    );
  }
}

createPackage(module.exports, Activation);
