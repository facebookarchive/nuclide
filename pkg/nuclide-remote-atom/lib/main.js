Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _commonsAtomGoToLocation;

function _load_commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation = require('../../commons-atom/go-to-location');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsAtomTextEditor;

function _load_commonsAtomTextEditor() {
  return _commonsAtomTextEditor = require('../../commons-atom/text-editor');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideRemoteConnection2;

function _load_nuclideRemoteConnection2() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

// Use dummy 0 port for local connections.
var DUMMY_LOCAL_PORT = 0;
var REMOTE_COMMAND_SERVICE = 'RemoteCommandService';

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._commands = {
      openFile: function openFile(uri, line, column, isWaiting) {
        return _openFile(uri, line, column, isWaiting);
      },
      openRemoteFile: function openRemoteFile(uri, line, column, isWaiting) {
        if ((_nuclideRemoteConnection2 || _load_nuclideRemoteConnection2()).ServerConnection.getForUri(uri) == null) {
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.throw(new Error('Atom is not connected to host for ' + uri)).publish();
        }
        return _openFile(uri, line, column, isWaiting);
      },
      addProject: function addProject(projectPath) {
        atom.project.addPath(projectPath);
        return Promise.resolve();
      },
      dispose: function dispose() {}
    };

    this._disposables = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(_asyncToGenerator(function* (connection) {
      var service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByConnection)(REMOTE_COMMAND_SERVICE, connection);
      var port = connection == null ? DUMMY_LOCAL_PORT : connection.getPort();
      return yield service.RemoteCommandService.registerAtomCommands(port, _this._commands);
    }));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

function _openFile(uri, line, column, isWaiting) {
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_commonsAtomGoToLocation || _load_commonsAtomGoToLocation()).goToLocation)(uri, line, column).then(function (editor) {
    atom.applicationDelegate.focusWindow();

    if (isWaiting && (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-remote-atom.shouldNotifyWhenCommandLineIsWaitingOnFile')) {
      (function () {
        var notification = atom.notifications.addInfo('The command line has opened `' + (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(uri) + '`' + ' and is waiting for it to be closed.', {
          dismissable: true,
          buttons: [{
            onDidClick: function onDidClick() {
              (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.set('nuclide-remote-atom.shouldNotifyWhenCommandLineIsWaitingOnFile', false);
              notification.dismiss();
            },
            text: 'Don\'t show again'
          }, {
            onDidClick: function onDidClick() {
              editor.destroy();
            },
            text: 'Close file'
          }]
        });
        editor.onDidDestroy(function () {
          notification.dismiss();
        });
      })();
    }

    return editor;
  })).switchMap(function (editor) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of('open'), (0, (_commonsAtomTextEditor || _load_commonsAtomTextEditor()).observeEditorDestroy)(editor).map(function (value) {
      return 'close';
    }));
  }).publish();
}

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;