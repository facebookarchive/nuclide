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

import type {OutputProviderStatus} from 'atom-ide-ui';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {BehaviorSubject, Subscription} from 'rxjs';
import type {TunnelBehavior} from './types';

import invariant from 'assert';
import {getLogger} from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
import {getMetroServiceByNuclideUri} from '../../nuclide-remote-connection';
import {openTunnel} from './Tunnel';
import {MetroAtomService} from './types';
import {
  NO_METRO_PROJECT_ERROR,
  METRO_PORT_BUSY_ERROR,
} from '../../nuclide-metro-rpc/lib/types';
import {LogTailer} from '../../nuclide-console-base/lib/LogTailer';
import electron from 'electron';

const logger = getLogger('Metro');
const GLOBAL_RELOAD_HOTKEY = 'CmdOrCtrl+Alt+R';
const remote = electron.remote;
invariant(remote);

export class DefaultMetroAtomService implements MetroAtomService {
  _logTailer: LogTailer;
  _projectRootPath: BehaviorSubject<?NuclideUri>;
  _disposables: UniversalDisposable;
  _currentTunnelSubscription: ?Subscription;

  constructor(projectRootPath: BehaviorSubject<?NuclideUri>) {
    this._projectRootPath = projectRootPath;
    this._disposables = new UniversalDisposable();
    this._logTailer = this._createLogTailer(projectRootPath);

    this._disposables.add(
      () => this.stop(),
      this._registerShutdownOnWorkingRootChange(),
    );
  }

  dispose = () => {
    this._disposables.dispose();
  };

  start = async (tunnelBehavior: TunnelBehavior): Promise<void> => {
    await new Promise((resolve, reject) => {
      this._logTailer.start({
        onRunning: error => {
          if (error != null) {
            // Handling these errors here because LogTailer never becomes "ready"
            // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
            if (error.code === NO_METRO_PROJECT_ERROR) {
              atom.notifications.addError('Could not find Metro project', {
                dismissable: true,
                description:
                  'Make sure that your current working root (or its ancestor) contains a' +
                  ' `node_modules` directory with react-native installed, or a .buckconfig file' +
                  ' with a `[react-native]` section that has a `server` key.',
              });
              // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
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
    logger.trace('adding global reload hotkey (' + GLOBAL_RELOAD_HOTKEY + ')');
    const success = remote.globalShortcut.register(GLOBAL_RELOAD_HOTKEY, () => {
      logger.trace('reloading the app via the global reload hotkey');
      this.reloadApp();
    });
    logger.trace('hotkey register success: ' + String(success));
    const projectRoot = this._projectRootPath.getValue();
    invariant(projectRoot != null);
    const tunnelEvents = openTunnel(projectRoot, tunnelBehavior).catch(e => {
      this._closeTunnel();
      throw e;
    });
    this._currentTunnelSubscription = tunnelEvents.subscribe();
    await tunnelEvents.take(1).toPromise();
  };

  stop = () => {
    if (remote.globalShortcut.isRegistered(GLOBAL_RELOAD_HOTKEY)) {
      logger.trace('unregistering global reload hotkey');
      remote.globalShortcut.unregister(GLOBAL_RELOAD_HOTKEY);
    }
    this._closeTunnel();
    this._logTailer.stop();
  };

  restart = () => {
    this._logTailer.restart();
  };

  reloadApp = () => {
    const path = this._projectRootPath.getValue();
    if (path == null) {
      return;
    }
    const metroService = getMetroServiceByNuclideUri(path);
    metroService.reloadApp();
  };

  observeStatus = (callback: OutputProviderStatus => void): IDisposable => {
    return this._logTailer.observeStatus(callback);
  };

  _closeTunnel = () => {
    if (this._currentTunnelSubscription != null) {
      this._currentTunnelSubscription.unsubscribe();
      this._currentTunnelSubscription = null;
    }
  };

  _registerShutdownOnWorkingRootChange = (): Subscription => {
    return this._projectRootPath.distinctUntilChanged().subscribe(path => {
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
    });
  };

  _createLogTailer(projectRootPath: BehaviorSubject<?NuclideUri>) {
    const self = this;

    const metroEvents = Observable.defer(() => {
      const path = projectRootPath.getValue();
      if (path == null) {
        return Observable.empty();
      }
      const metroService = getMetroServiceByNuclideUri(path);
      return metroService.startMetro(path, getEditorArgs(path)).refCount();
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

    return new LogTailer({
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

        logger.warn('stopping metro due to an error');
        self.stop();
      },
      trackingEvents: {
        start: 'metro:start',
        stop: 'metro:stop',
        restart: 'metro:restart',
      },
    });
  }
}

function getEditorArgs(projectRoot: NuclideUri): Array<string> {
  if (nuclideUri.isRemote(projectRoot)) {
    return ['atom'];
  } else {
    const args = [remote.app.getPath('exe')];
    if (atom.devMode) {
      args.push('--dev');
    }
    return args;
  }
}
