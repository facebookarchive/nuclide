Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideRegisterNuxService = provideRegisterNuxService;
exports.provideTriggerNuxService = provideTriggerNuxService;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _NuxManager2;

function _NuxManager() {
  return _NuxManager2 = require('./NuxManager');
}

var _NuxStore2;

function _NuxStore() {
  return _NuxStore2 = require('./NuxStore');
}

var Activation = (function () {
  function Activation() {
    _classCallCheck(this, Activation);

    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._nuxStore = new (_NuxStore2 || _NuxStore()).NuxStore();
    this._nuxManager = new (_NuxManager2 || _NuxManager()).NuxManager(this._nuxStore);

    this._disposables.add(this._nuxStore);
    this._disposables.add(this._nuxManager);
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._serializeAndPersist();
      this._disposables.dispose();
    }
  }, {
    key: '_serializeAndPersist',
    value: function _serializeAndPersist() {
      this._nuxStore.serialize();
    }
  }, {
    key: 'addNewNux',
    value: function addNewNux(nux) {
      return this._nuxManager.addNewNux(nux);
    }
  }, {
    key: 'tryTriggerNux',
    value: function tryTriggerNux(id) {
      this._nuxManager.tryTriggerNux(id);
    }
  }]);

  return Activation;
})();

var activation = null;

function activate() {
  if (activation == null) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function provideRegisterNuxService() {
  return function (nux) {
    if (activation == null) {
      throw new Error('An error occurred when instantiating the NUX package.');
    }
    if (nux == null) {
      throw new Error('Cannot register a "null" NuxTour.');
    }
    return activation.addNewNux(nux);
  };
}

function provideTriggerNuxService() {
  return function (id) {
    if (activation == null) {
      throw new Error('An error occurred when instantiating the NUX package.');
    }
    activation.tryTriggerNux(id);
  };
}