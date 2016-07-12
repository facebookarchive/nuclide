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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _WorkingSetsStore2;

function _WorkingSetsStore() {
  return _WorkingSetsStore2 = require('./WorkingSetsStore');
}

var _WorkingSetsConfig2;

function _WorkingSetsConfig() {
  return _WorkingSetsConfig2 = require('./WorkingSetsConfig');
}

var _PathsObserver2;

function _PathsObserver() {
  return _PathsObserver2 = require('./PathsObserver');
}

// TODO(advinsky): Importing across Atom packages is an anti-pattern. Either
// factor this out so it can be shared with the file-tree or merge working sets
// into it.

var _WorkingSet = require('./WorkingSet');

Object.defineProperty(exports, 'WorkingSet', {
  enumerable: true,
  get: function get() {
    return _WorkingSet.WorkingSet;
  }
});

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this.workingSetsStore = new (_WorkingSetsStore2 || _WorkingSetsStore()).WorkingSetsStore();
    this._workingSetsConfig = new (_WorkingSetsConfig2 || _WorkingSetsConfig()).WorkingSetsConfig();
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();

    this._disposables.add(this.workingSetsStore.onSaveDefinitions(function (definitions) {
      _this._workingSetsConfig.setDefinitions(definitions);
    }));

    this._disposables.add(this._workingSetsConfig.observeDefinitions(function (definitions) {
      _this.workingSetsStore.updateDefinitions(definitions);
    }));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:toggle-last-selected', this.workingSetsStore.toggleLastSelected.bind(this.workingSetsStore)));

    this._disposables.add(new (_PathsObserver2 || _PathsObserver()).PathsObserver(this.workingSetsStore));
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
  (0, (_assert2 || _assert()).default)(activation, 'Was requested to provide service from a non-activated package');

  return activation.workingSetsStore;
}