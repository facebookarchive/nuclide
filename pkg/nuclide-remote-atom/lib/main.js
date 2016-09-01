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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideRemoteConnection4;

function _nuclideRemoteConnection3() {
  return _nuclideRemoteConnection4 = require('../../nuclide-remote-connection');
}

var _commonsAtomTextEditor2;

function _commonsAtomTextEditor() {
  return _commonsAtomTextEditor2 = require('../../commons-atom/text-editor');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);

    this._commands = {
      openFile: function openFile(filePath, line, column) {
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise((0, (_commonsAtomGoToLocation2 || _commonsAtomGoToLocation()).goToLocation)(filePath, line, column)).switchMap(function (editor) {
          return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of('open'), (0, (_commonsAtomTextEditor2 || _commonsAtomTextEditor()).observeEditorDestroy)(editor).map(function (value) {
            return 'close';
          }));
        }).publish();
      },
      dispose: function dispose() {}
    };

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._initialize();
  }

  _createClass(Activation, [{
    key: '_initialize',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var addConnection = _asyncToGenerator(function* (connection) {
        var service = connection.getService('RemoteCommandService');
        var remoteCommands = yield service.RemoteCommandService.registerAtomCommands(connection.getPort(), _this._commands);
        _this._disposables.add(remoteCommands);
        var onClose = function onClose(closingConnection) {
          if (closingConnection === connection) {
            closeSubscription.dispose();
            _this._disposables.remove(closeSubscription);
          }
        };

        var closeSubscription = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.onDidCloseServerConnection(onClose);
        _this._disposables.add(closeSubscription);
      });

      // Add local service
      var service = (0, (_nuclideRemoteConnection4 || _nuclideRemoteConnection3()).getlocalService)('RemoteCommandService');
      var remoteCommands = yield service.RemoteCommandService.registerAtomCommands(0, this._commands);
      this._disposables.add(remoteCommands);

      this._disposables.add((_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ServerConnection.observeConnections(addConnection));
    })
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;