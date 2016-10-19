Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideWorkingSetsStore = provideWorkingSetsStore;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _WorkingSetsStore;

function _load_WorkingSetsStore() {
  return _WorkingSetsStore = require('./WorkingSetsStore');
}

var _WorkingSetsConfig;

function _load_WorkingSetsConfig() {
  return _WorkingSetsConfig = require('./WorkingSetsConfig');
}

var _PathsObserver;

function _load_PathsObserver() {
  return _PathsObserver = require('./PathsObserver');
}

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this.workingSetsStore = new (_WorkingSetsStore || _load_WorkingSetsStore()).WorkingSetsStore();
    this._workingSetsConfig = new (_WorkingSetsConfig || _load_WorkingSetsConfig()).WorkingSetsConfig();
    this._disposables = new (_atom || _load_atom()).CompositeDisposable();

    this._disposables.add(this.workingSetsStore.onSaveDefinitions(function (definitions) {
      _this._workingSetsConfig.setDefinitions(definitions);
    }));

    this._disposables.add(this._workingSetsConfig.observeDefinitions(function (definitions) {
      _this.workingSetsStore.updateDefinitions(definitions);
    }));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:toggle-last-selected', this.workingSetsStore.toggleLastSelected.bind(this.workingSetsStore)));

    this._disposables.add(new (_PathsObserver || _load_PathsObserver()).PathsObserver(this.workingSetsStore));
  }

  _createClass(Activation, [{
    key: 'deactivate',
    value: function deactivate() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate() {
  if (activation != null) {
    return;
  }

  activation = new Activation();
}

function deactivate() {
  if (activation == null) {
    return;
  }

  activation.deactivate();
  activation = null;
}

function provideWorkingSetsStore() {
  (0, (_assert || _load_assert()).default)(activation, 'Was requested to provide service from a non-activated package');

  return activation.workingSetsStore;
}