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

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _commonsAtomGoToLocation2;

function _commonsAtomGoToLocation() {
  return _commonsAtomGoToLocation2 = require('../../commons-atom/go-to-location');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

// Use dummy 0 port for local connections.
var DUMMY_LOCAL_PORT = 0;
var REMOTE_COMMAND_SERVICE = 'RemoteCommandService';

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._commands = {
      openFile: function openFile(filePath, line, column) {
        return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromPromise((0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(filePath, line, column).then(function (editor) {
          atom.applicationDelegate.focusWindow();
          return editor;
        })).switchMap(function (editor) {
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of('open'), (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).observeEditorDestroy)(editor).map(function (value) {
            return 'close';
          }));
        }).publish();
      },
      addProject: function addProject(projectPath) {
        atom.project.addPath(projectPath);
        return Promise.resolve();
      },
      dispose: function dispose() {}
    };

    this._disposables = new (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ConnectionCache(_asyncToGenerator(function* (connection) {
      var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByConnection)(REMOTE_COMMAND_SERVICE, connection);
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

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;