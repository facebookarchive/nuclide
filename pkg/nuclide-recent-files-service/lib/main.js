Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.provideRecentFilesService = provideRecentFilesService;
exports.serialize = serialize;
exports.deactivate = deactivate;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    var RecentFilesService = require('./RecentFilesService');
    this._service = new RecentFilesService(state);
    this._subscriptions.add(new (_atom2 || _atom()).Disposable(function () {
      _this._service.dispose();
    }));
  }

  _createClass(Activation, [{
    key: 'getService',
    value: function getService() {
      return this._service;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function provideRecentFilesService() {
  (0, (_assert2 || _assert()).default)(activation);
  return activation.getService();
}

function serialize() {
  (0, (_assert2 || _assert()).default)(activation);
  return {
    filelist: activation.getService().getRecentFiles()
  };
}

function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
}