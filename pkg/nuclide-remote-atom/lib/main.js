"use strict";

var _querystring = _interopRequireDefault(require("querystring"));

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
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

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _textEditor() {
  const data = require("../../../modules/nuclide-commons-atom/text-editor");

  _textEditor = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFiles() {
  const data = require("../../nuclide-open-files");

  _nuclideOpenFiles = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const REMOTE_COMMAND_SERVICE = 'RemoteCommandService';
const ATOM_URI_ADD_PATH = 'add-path';

class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
    this._commands = {
      openFile(uri, line, column, isWaiting) {
        return openFile(uri, line, column, isWaiting);
      },

      openRemoteFile(uri, line, column, isWaiting) {
        if (_nuclideRemoteConnection().ServerConnection.getForUri(uri) == null) {
          return _RxMin.Observable.throw(new Error(`Atom is not connected to host for ${uri}`)).publish();
        }

        return openFile(uri, line, column, isWaiting);
      },

      async addProject(projectPath, newWindow) {
        if (_nuclideUri().default.isLocal(projectPath)) {
          atom.applicationDelegate.open({
            pathsToOpen: [projectPath],
            newWindow,
            devMode: atom.devMode,
            safeMode: atom.inSafeMode()
          });
        } else {
          let queryParams = {
            path: projectPath
          };

          if (newWindow) {
            queryParams = Object.assign({}, queryParams, {
              target: '_blank'
            });
          }

          const url = `atom://nuclide/${ATOM_URI_ADD_PATH}?` + _querystring.default.stringify(queryParams);

          _electron.shell.openExternal(url);
        }
      },

      async getProjectState() {
        return {
          rootFolders: atom.project.getPaths()
        };
      },

      addNotification(notification) {
        const {
          type,
          message
        } = notification;
        const {
          description,
          detail,
          icon,
          dismissable
        } = notification;
        const options = {
          description,
          detail,
          icon,
          dismissable
        };
        atom.notifications.add(type, message, options);
        return Promise.resolve();
      },

      dispose() {}

    };

    this._disposables.add(new (_nuclideRemoteConnection().ConnectionCache)(async connection => {
      // If connection is null, this indicates a local connection. Because usage
      // of the local command server is low and it introduces the cost of
      // starting an extra process when Atom starts up, only enable it if the
      // user has explicitly opted-in.
      if (connection == null && !_featureConfig().default.get('nuclide-remote-atom.enableLocalCommandService')) {
        return {
          dispose: () => {}
        };
      }

      const service = (0, _nuclideRemoteConnection().getServiceByConnection)(REMOTE_COMMAND_SERVICE, connection);
      const fileNotifier = await (0, _nuclideOpenFiles().getNotifierByConnection)(connection);
      return service.registerAtomCommands(fileNotifier, this._commands);
    }));
  }

  consumeRemoteProjectsService(service) {
    this._remoteProjectsService = service;
    const disposable = new (_UniversalDisposable().default)(() => {
      this._remoteProjectsService = null;
    });

    this._disposables.add(disposable);

    return disposable;
  }

  consumeDeepLinkService(service) {
    const disposable = service.subscribeToPath(ATOM_URI_ADD_PATH, async params => {
      const {
        path: projectPath
      } = params;

      if (!(typeof projectPath === 'string')) {
        throw new Error("Invariant violation: \"typeof projectPath === 'string'\"");
      }

      if (!_nuclideUri().default.isRemote(projectPath)) {
        (0, _log4js().getLogger)(`Expected remote Nuclide URI but got ${projectPath}.`);
        return;
      }

      const remoteProjectsService = this._remoteProjectsService;

      if (remoteProjectsService == null) {
        (0, _log4js().getLogger)('No provider for nuclide-remote-projects was found.');
        return;
      }

      (0, _log4js().getLogger)().info(`Attempting to addProject(${projectPath}).`);

      const hostname = _nuclideUri().default.getHostname(projectPath);

      await remoteProjectsService.createRemoteConnection({
        host: hostname,
        path: _nuclideUri().default.getPath(projectPath),
        displayTitle: hostname
      });
    });

    this._disposables.add(disposable);

    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }

}

function openFile(uri, line, column, isWaiting) {
  return _RxMin.Observable.fromPromise((0, _goToLocation().goToLocation)(uri, {
    line,
    column
  }).then(editor => {
    atom.applicationDelegate.focusWindow();

    if (isWaiting && _featureConfig().default.get('nuclide-remote-atom.shouldNotifyWhenCommandLineIsWaitingOnFile')) {
      const notification = atom.notifications.addInfo(`The command line has opened \`${_nuclideUri().default.getPath(uri)}\`` + ' and is waiting for it to be closed.', {
        dismissable: true,
        buttons: [{
          onDidClick: () => {
            _featureConfig().default.set('nuclide-remote-atom.shouldNotifyWhenCommandLineIsWaitingOnFile', false);

            notification.dismiss();
          },
          text: "Don't show again"
        }, {
          onDidClick: () => {
            editor.destroy();
          },
          text: 'Close file'
        }]
      });
      editor.onDidDestroy(() => {
        notification.dismiss();
      });
    }

    return editor;
  })).switchMap(editor => _RxMin.Observable.merge(_RxMin.Observable.of('open'), (0, _textEditor().observeEditorDestroy)(editor).map(value => 'close'))).publish();
}

(0, _createPackage().default)(module.exports, Activation);