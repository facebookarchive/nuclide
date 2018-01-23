'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _querystring = _interopRequireDefault(require('querystring'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('nuclide-commons-atom/text-editor');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const REMOTE_COMMAND_SERVICE = 'RemoteCommandService'; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */

const ATOM_URI_ADD_PATH = 'add-path';

class Activation {

  constructor() {
    var _this = this;

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._commands = {
      openFile(uri, line, column, isWaiting) {
        return openFile(uri, line, column, isWaiting);
      },
      openRemoteFile(uri, line, column, isWaiting) {
        if ((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.getForUri(uri) == null) {
          return _rxjsBundlesRxMinJs.Observable.throw(new Error(`Atom is not connected to host for ${uri}`)).publish();
        }
        return openFile(uri, line, column, isWaiting);
      },
      addProject(projectPath, newWindow) {
        return (0, _asyncToGenerator.default)(function* () {
          if ((_nuclideUri || _load_nuclideUri()).default.isLocal(projectPath)) {
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
              queryParams = Object.assign({}, queryParams, { target: '_blank' });
            }
            const url = `atom://nuclide/${ATOM_URI_ADD_PATH}?` + _querystring.default.stringify(queryParams);
            _electron.shell.openExternal(url);
          }
        })();
      },
      dispose() {}
    };

    this._disposables.add(new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (connection) {
        // If connection is null, this indicates a local connection. Because usage
        // of the local command server is low and it introduces the cost of
        // starting an extra process when Atom starts up, only enable it if the
        // user has explicitly opted-in.
        if (connection == null && !(_featureConfig || _load_featureConfig()).default.get('nuclide-remote-atom.enableLocalCommandService')) {
          return { dispose: function () {} };
        }

        const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(REMOTE_COMMAND_SERVICE, connection);
        const fileNotifier = yield (0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection);
        return service.RemoteCommandService.registerAtomCommands(fileNotifier, _this._commands);
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })()));
  }

  consumeRemoteProjectsService(service) {
    this._remoteProjectsService = service;
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._remoteProjectsService = null;
    });
    this._disposables.add(disposable);
    return disposable;
  }

  consumeDeepLinkService(service) {
    var _this2 = this;

    const disposable = service.subscribeToPath(ATOM_URI_ADD_PATH, (() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (params) {
        const { path: projectPath } = params;

        if (!(typeof projectPath === 'string')) {
          throw new Error('Invariant violation: "typeof projectPath === \'string\'"');
        }

        if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(projectPath)) {
          (0, (_log4js || _load_log4js()).getLogger)(`Expected remote Nuclide URI but got ${projectPath}.`);
          return;
        }

        const remoteProjectsService = _this2._remoteProjectsService;
        if (remoteProjectsService == null) {
          (0, (_log4js || _load_log4js()).getLogger)('No provider for nuclide-remote-projects was found.');
          return;
        }

        (0, (_log4js || _load_log4js()).getLogger)().info(`Attempting to addProject(${projectPath}).`);
        const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(projectPath);
        const cwd = (_nuclideUri || _load_nuclideUri()).default.getPath(projectPath);
        yield remoteProjectsService.createRemoteConnection({
          host: hostname,
          cwd,
          displayTitle: hostname
        });
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })());
    this._disposables.add(disposable);
    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }
}

function openFile(uri, line, column, isWaiting) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, { line, column }).then(editor => {
    atom.applicationDelegate.focusWindow();

    if (isWaiting && (_featureConfig || _load_featureConfig()).default.get('nuclide-remote-atom.shouldNotifyWhenCommandLineIsWaitingOnFile')) {
      const notification = atom.notifications.addInfo(`The command line has opened \`${(_nuclideUri || _load_nuclideUri()).default.getPath(uri)}\`` + ' and is waiting for it to be closed.', {
        dismissable: true,
        buttons: [{
          onDidClick: () => {
            (_featureConfig || _load_featureConfig()).default.set('nuclide-remote-atom.shouldNotifyWhenCommandLineIsWaitingOnFile', false);
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
  })).switchMap(editor => _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.of('open'), (0, (_textEditor || _load_textEditor()).observeEditorDestroy)(editor).map(value => 'close'))).publish();
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);