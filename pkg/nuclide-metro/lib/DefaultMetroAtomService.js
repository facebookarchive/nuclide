'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DefaultMetroAtomService = undefined;

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = require('./Tunnel');
}

var _types;

function _load_types() {
  return _types = require('./types');
}

var _types2;

function _load_types2() {
  return _types2 = require('../../nuclide-metro-rpc/lib/types');
}

var _LogTailer;

function _load_LogTailer() {
  return _LogTailer = require('../../nuclide-console-base/lib/LogTailer');
}

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('Metro'); /**
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
const remote = _electron.default.remote;

if (!remote) {
  throw new Error('Invariant violation: "remote"');
}

class DefaultMetroAtomService {

  constructor(projectRootPath) {
    _initialiseProps.call(this);

    this._projectRootPath = projectRootPath;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._port = new _rxjsBundlesRxMinJs.BehaviorSubject(8081);
    this._extraArgs = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
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
            if (error.code === (_types2 || _load_types2()).NO_METRO_PROJECT_ERROR) {
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
    });
    // now that the logTailer has started, start the global reload hotkey
    logger.trace('adding global reload hotkey (' + GLOBAL_RELOAD_HOTKEY + ')');
    const success = remote.globalShortcut.register(GLOBAL_RELOAD_HOTKEY, () => {
      logger.trace('reloading the app via the global reload hotkey');
      this.reloadApp();
    });
    logger.trace('hotkey register success: ' + String(success));
    const projectRoot = this._projectRootPath.getValue();

    if (!(projectRoot != null)) {
      throw new Error('Invariant violation: "projectRoot != null"');
    }

    const tunnelEvents = (0, (_Tunnel || _load_Tunnel()).openTunnel)(projectRoot, tunnelBehavior, port).catch(e => {
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
    const metroService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getMetroServiceByNuclideUri)(path);
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

    const metroEvents = _rxjsBundlesRxMinJs.Observable.defer(() => {
      const path = projectRootPath.getValue();
      if (path == null) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      const metroService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getMetroServiceByNuclideUri)(path);
      return metroService.startMetro(path, getEditorArgs(path), port.getValue(), extraArgs.getValue()).refCount();
    }).share();

    const messages = metroEvents.filter(event => event.type === 'message').map(event => {
      if (!(event.type === 'message')) {
        throw new Error('Invariant violation: "event.type === \'message\'"');
      }

      return Object.assign({}, event.message);
    });
    const ready = metroEvents.filter(message => message.type === 'ready').mapTo(undefined);

    return new (_LogTailer || _load_LogTailer()).LogTailer({
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
  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(projectRoot)) {
    return ['atom'];
  } else {
    const args = [remote.app.getPath('exe')];
    if (atom.devMode) {
      args.push('--dev');
    }
    return args;
  }
}