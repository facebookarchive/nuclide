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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _Constants2;

function _Constants() {
  return _Constants2 = _interopRequireDefault(require('./Constants'));
}

var LocalsStore = (function () {
  function LocalsStore(dispatcher) {
    _classCallCheck(this, LocalsStore);

    var dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
      dispatcher.unregister(dispatcherToken);
    }));
    this._locals = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.BehaviorSubject([]);
  }

  _createClass(LocalsStore, [{
    key: '_handlePayload',
    value: function _handlePayload(payload) {
      switch (payload.actionType) {
        case (_Constants2 || _Constants()).default.Actions.UPDATE_LOCALS:
          this._handleUpdateLocals(payload.data.locals);
          break;
        default:
          return;
      }
    }
  }, {
    key: '_handleUpdateLocals',
    value: function _handleUpdateLocals(locals) {
      this._locals.next(locals);
    }
  }, {
    key: 'getLocals',
    value: function getLocals() {
      return this._locals.asObservable();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return LocalsStore;
})();

exports.default = LocalsStore;
module.exports = exports.default;

/**
 * Treat as immutable.
 */