'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _LogTailer;

function _load_LogTailer() {
  return _LogTailer = require('../../nuclide-console/lib/LogTailer');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _types;

function _load_types() {
  return _types = require('../../nuclide-metro-rpc/lib/types');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Manages starting Metro for the current working root and integrating it into Console.
// Use this service instead of starting Metro via nuclide-metro-rpc yourself.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor(serializedState) {
    this._projectRootPath = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    const metroEvents = _rxjsBundlesRxMinJs.Observable.defer(() => {
      const path = this._projectRootPath.getValue();
      if (path == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const metroService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getMetroServiceByNuclideUri)(path);
      return metroService.startMetro(path, this._getEditorArgs(path)).refCount();
    }).share();

    const messages = metroEvents.filter(event => event.type === 'message').map(event => {
      if (!(event.type === 'message')) {
        throw new Error('Invariant violation: "event.type === \'message\'"');
      }

      return Object.assign({}, event.message);
    });
    const ready = metroEvents.filter(message => message.type === 'ready').mapTo(undefined);

    this._logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'Metro',
      messages,
      ready,
      handleError(error) {
        atom.notifications.addError(`Unexpected error while running Metro.\n\n${error.message}`, {
          dismissable: true
        });
      },
      trackingEvents: {
        start: 'metro:start',
        stop: 'metro:stop',
        restart: 'metro:restart'
      }
    });

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.commands.add('atom-workspace', {
      // Ideally based on CWD, the commands can be disabled and the UI would explain why.
      'nuclide-metro:start': () => this.start(),
      'nuclide-metro:stop': () => this.stop(),
      'nuclide-metro:restart': () => this.restart(),
      'nuclide-metro:reload-app': () => this.reloadApp()
    }), () => this.stop());
  }

  start() {
    return new Promise((resolve, reject) => {
      this._logTailer.start({
        onRunning: error => {
          if (error != null) {
            // Handling these errors here because LogTailer never becomes "ready"
            if (error.code === (_types || _load_types()).NO_METRO_PROJECT_ERROR) {
              atom.notifications.addError('Could not find Metro project', {
                dismissable: true,
                description: 'Make sure that your current working root (or its ancestor) contains a' + ' `node_modules` directory with react-native installed, or a .buckconfig file' + ' with a `[react-native]` section that has a `server` key.'
              });
            } else if (error.code === (_types || _load_types()).METRO_PORT_BUSY_ERROR) {
              atom.notifications.addWarning('Metro failed to start. This is expected if you are ' + 'intentionally running Metro in a separate terminal. If not, ' + '`lsof -i tcp:8081` might help you find the process using the default port.', {
                dismissable: true
              });
            }
            reject(error);
          } else {
            resolve();
          }
        }
      });
    });
  }

  stop() {
    this._logTailer.stop();
  }

  restart() {
    this._logTailer.restart();
  }

  reloadApp() {
    const path = this._projectRootPath.getValue();
    if (path == null) {
      return;
    }
    const metroService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getMetroServiceByNuclideUri)(path);
    metroService.reloadApp();
  }

  dispose() {
    this._disposables.dispose();
  }

  provideMetroAtomService() {
    return {
      start: () => this.start()
    };
  }

  _getEditorArgs(projectRoot) {
    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(projectRoot)) {
      return ['atom'];
    } else {
      const remote = _electron.default.remote;

      if (!(remote != null)) {
        throw new Error('Invariant violation: "remote != null"');
      }

      const args = [remote.app.getPath('exe')];
      if (atom.devMode) {
        args.push('--dev');
      }
      return args;
    }
  }

  consumeCwdApi(api) {
    this._disposables.add(this._projectRootPath.distinctUntilChanged().subscribe(path => {
      if (this._logTailer.getStatus() !== 'stopped') {
        this.stop();
        const notification = atom.notifications.addWarning('Metro was stopped, because your Current Working Root has changed.', {
          dismissable: true,
          buttons: [{
            text: 'Start at this new working root',
            onDidClick: () => {
              this.start();
              notification.dismiss();
            }
          }]
        });
      }
    }), api.observeCwd(dir => {
      this._projectRootPath.next(dir == null ? null : dir.getPath());
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'Metro',
      messages: this._logTailer.getMessages(),
      observeStatus: cb => this._logTailer.observeStatus(cb),
      start: () => {
        this.start();
      },
      stop: () => {
        this.stop();
      }
    }));
  }
}
// eslint-disable-next-line rulesdir/no-cross-atom-imports


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);