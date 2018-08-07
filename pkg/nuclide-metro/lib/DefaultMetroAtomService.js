"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultMetroAtomService = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _Tunnel() {
  const data = require("./Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("./types");

  _types = function () {
    return data;
  };

  return data;
}

function _types2() {
  const data = require("../../nuclide-metro-rpc/lib/types");

  _types2 = function () {
    return data;
  };

  return data;
}

function _LogTailer() {
  const data = require("../../nuclide-console-base/lib/LogTailer");

  _LogTailer = function () {
    return data;
  };

  return data;
}

var _electron = _interopRequireDefault(require("electron"));

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
const logger = (0, _log4js().getLogger)('Metro');
const GLOBAL_RELOAD_HOTKEY = 'CmdOrCtrl+Alt+R';
const remote = _electron.default.remote;

if (!remote) {
  throw new Error("Invariant violation: \"remote\"");
}

class DefaultMetroAtomService {
  constructor(projectRootPath) {
    _initialiseProps.call(this);

    this._projectRootPath = projectRootPath;
    this._disposables = new (_UniversalDisposable().default)();
    this._port = new _RxMin.BehaviorSubject(8081);
    this._extraArgs = new _RxMin.BehaviorSubject([]);
    this._logTailer = this._createLogTailer(projectRootPath, this._port, this._extraArgs);

    this._disposables.add(() => this.stop(), this._registerShutdownOnWorkingRootChange());
  }

}

exports.DefaultMetroAtomService = DefaultMetroAtomService;

var _initialiseProps = function () {
  this.dispose = () => {
    this._disposables.dispose();
  };

  this.start = async (tunnelBehavior, port = 8081, extraArgs = []) => {
    this._port.next(port);

    this._extraArgs.next(extraArgs);

    await new Promise((resolve, reject) => {
      this._logTailer.start({
        onRunning: error => {
          if (error != null) {
            // Handling these errors here because LogTailer never becomes "ready"
            // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
            if (error.code === _types2().NO_METRO_PROJECT_ERROR) {
              atom.notifications.addError('Could not find Metro project', {
                dismissable: true,
                description: 'Make sure that your current working root (or its ancestor) contains a' + ' `node_modules` directory with react-native installed, or a .buckconfig file' + ' with a `[react-native]` section that has a `server` key.'
              });
            }

            reject(error);
          } else {
            resolve();
          }
        }
      });
    }); // now that the logTailer has started, start the global reload hotkey

    logger.trace('adding global reload hotkey (' + GLOBAL_RELOAD_HOTKEY + ')');
    const success = remote.globalShortcut.register(GLOBAL_RELOAD_HOTKEY, () => {
      logger.trace('reloading the app via the global reload hotkey');
      this.reloadApp();
    });
    logger.trace('hotkey register success: ' + String(success));

    const projectRoot = this._projectRootPath.getValue();

    if (!(projectRoot != null)) {
      throw new Error("Invariant violation: \"projectRoot != null\"");
    }

    const tunnelEvents = (0, _Tunnel().openTunnel)(projectRoot, tunnelBehavior, port).catch(e => {
      this._closeTunnel();

      throw e;
    });
    this._currentTunnelSubscription = tunnelEvents.subscribe();
    await tunnelEvents.take(1).toPromise();
  };

  this.stop = () => {
    if (remote.globalShortcut.isRegistered(GLOBAL_RELOAD_HOTKEY)) {
      logger.trace('unregistering global reload hotkey');
      remote.globalShortcut.unregister(GLOBAL_RELOAD_HOTKEY);
    }

    this._closeTunnel();

    this._logTailer.stop();
  };

  this.restart = () => {
    this._logTailer.restart();
  };

  this.reloadApp = () => {
    const path = this._projectRootPath.getValue();

    if (path == null) {
      return;
    }

    const metroService = (0, _nuclideRemoteConnection().getMetroServiceByNuclideUri)(path);
    metroService.reloadApp(this._port.getValue());
  };

  this.observeStatus = callback => {
    return this._logTailer.observeStatus(callback);
  };

  this._closeTunnel = () => {
    if (this._currentTunnelSubscription != null) {
      this._currentTunnelSubscription.unsubscribe();

      this._currentTunnelSubscription = null;
    }
  };

  this._registerShutdownOnWorkingRootChange = () => {
    return this._projectRootPath.distinctUntilChanged().subscribe(path => {
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
    });
  };

  this._createLogTailer = (projectRootPath, port, extraArgs) => {
    const self = this;

    const metroEvents = _RxMin.Observable.defer(() => {
      const path = projectRootPath.getValue();

      if (path == null) {
        return _RxMin.Observable.empty();
      }

      const metroService = (0, _nuclideRemoteConnection().getMetroServiceByNuclideUri)(path);
      return metroService.startMetro(path, getEditorArgs(path), port.getValue(), extraArgs.getValue()).refCount();
    }).share();

    const messages = metroEvents.filter(event => event.type === 'message').map(event => {
      if (!(event.type === 'message')) {
        throw new Error("Invariant violation: \"event.type === 'message'\"");
      }

      return Object.assign({}, event.message);
    });
    const ready = metroEvents.first(message => message.type === 'ready').mapTo(undefined);
    return new (_LogTailer().LogTailer)({
      name: 'Metro',
      messages,
      ready,

      handleError(error) {
        if (error.message != null && error.message.includes('EADDRINUSE')) {
          atom.notifications.addInfo(`Port ${port.getValue()} is busy. Most likely it's another metro instance and you don't need to do anything`);
          return;
        }

        atom.notifications.addError(`Unexpected error while running Metro.\n\n${error.message}`, {
          dismissable: true
        });
        logger.warn('stopping metro due to an error');
        self.stop();
      },

      trackingEvents: {
        start: 'metro:start',
        stop: 'metro:stop',
        restart: 'metro:restart'
      }
    });
  };
};

function getEditorArgs(projectRoot) {
  if (_nuclideUri().default.isRemote(projectRoot)) {
    return ['atom'];
  } else {
    const args = [remote.app.getPath('exe')];

    if (atom.devMode) {
      args.push('--dev');
    }

    return args;
  }
}