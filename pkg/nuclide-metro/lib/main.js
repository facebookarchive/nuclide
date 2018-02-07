'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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
  return _LogTailer = require('../../nuclide-console-base/lib/LogTailer');
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

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _electron = _interopRequireDefault(require('electron'));

var _openTunnel;

function _load_openTunnel() {
  return _openTunnel = require('./openTunnel');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const GLOBAL_RELOAD_HOTKEY = 'CmdOrCtrl+Alt+R';
const logger = (0, (_log4js || _load_log4js()).getLogger)('Metro');

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
      'nuclide-metro:start': () => this.start('ask_about_tunnel'),
      'nuclide-metro:stop': () => this.stop(),
      'nuclide-metro:restart': () => this.restart(),
      'nuclide-metro:reload-app': () => this.reloadApp()
    }), () => this.stop());
  }

  start(tunnelBehavior) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield new Promise(function (resolve, reject) {
        _this._logTailer.start({
          onRunning: function (error) {
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
      // now that the logTailer has started, start the global reload hotkey
      const remote = _electron.default.remote;

      if (!(remote != null)) {
        throw new Error('Invariant violation: "remote != null"');
      }

      logger.trace('adding global reload hotkey (' + GLOBAL_RELOAD_HOTKEY + ')');
      const success = remote.globalShortcut.register(GLOBAL_RELOAD_HOTKEY, function () {
        logger.trace('reloading the app via the global reload hotkey');
        _this.reloadApp();
      });
      logger.trace('hotkey register success: ' + String(success));
      const projectRoot = _this._projectRootPath.getValue();

      if (!(projectRoot != null)) {
        throw new Error('Invariant violation: "projectRoot != null"');
      }

      _this._currentTunnelDisposable = yield (0, (_openTunnel || _load_openTunnel()).openTunnel)(projectRoot, tunnelBehavior);
    })();
  }

  stop() {
    const remote = _electron.default.remote;

    if (!(remote != null)) {
      throw new Error('Invariant violation: "remote != null"');
    }

    logger.trace('unregistering global reload hotkey');
    remote.globalShortcut.unregister(GLOBAL_RELOAD_HOTKEY);
    if (this._currentTunnelDisposable != null) {
      this._currentTunnelDisposable.dispose();
      this._currentTunnelDisposable = null;
    }
    this._logTailer.stop();
  }

  restart() {
    this._logTailer.restart();
  }

  reloadApp() {
    logger.trace('reloadApp called');
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
      start: tunnelBehavior => this.start(tunnelBehavior),
      stop: () => this.stop(),
      observeStatus: callback => this._logTailer.observeStatus(callback)
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
              this.start('ask_about_tunnel');
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
        this.start('ask_about_tunnel');
      },
      stop: () => {
        this.stop();
      }
    }));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);