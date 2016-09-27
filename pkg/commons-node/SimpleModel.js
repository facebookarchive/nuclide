Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _symbolObservable2;

function _symbolObservable() {
  return _symbolObservable2 = _interopRequireDefault(require('symbol-observable'));
}

/**
 * Exposes a simple, React-like OO API for a stateful model. Implements `Symbol.observable` so you
 * can easily convert to an observable stream.
 */

var SimpleModel = (function () {
  function SimpleModel() {
    var _this = this;

    _classCallCheck(this, SimpleModel);

    this._states = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
    this._states.subscribe(function (state) {
      _this.state = state;
    });

    // Create an observable that contains the current, and all future, states. Since the initial
    // state is set directly (assigned to `this.state`), we can't just use a ReplaySubject
    // TODO: Use a computed property key when that's supported.
    this[(_symbolObservable2 || _symbolObservable()).default] = function () {
      return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(_this.state).concat(_this._states);
    };
  }

  _createClass(SimpleModel, [{
    key: 'setState',
    value: function setState(newState) {
      var nextState = _extends({}, this.state, newState);
      this._states.next(nextState);
    }
  }]);

  return SimpleModel;
})();

exports.SimpleModel = SimpleModel;