Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.isGkEnabled = isGkEnabled;
exports.onceGkInitialized = onceGkInitialized;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _once2;

function _once() {
  return _once2 = _interopRequireDefault(require('./once'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

/**
 * Get the actual Gatekeeper constructor or stub the relevant methods for OSS
 * friendliness.
 */
var getGatekeeper = (0, (_once2 || _once()).default)(function () {
  var Gatekeeper = undefined;
  try {
    // $FlowFB
    Gatekeeper = require('./fb-gatekeeper').Gatekeeper;
  } catch (e) {
    Gatekeeper = (function () {
      function _class() {
        _classCallCheck(this, _class);
      }

      _createClass(_class, [{
        key: 'isGkEnabled',
        value: function isGkEnabled() {
          return null;
        }
      }, {
        key: 'asyncIsGkEnabled',
        value: _asyncToGenerator(function* () {
          return null;
        })
      }, {
        key: 'onceGkInitialized',
        value: function onceGkInitialized(callback) {
          process.nextTick(function () {
            callback();
          });
          return new (_eventKit2 || _eventKit()).Disposable();
        }
      }]);

      return _class;
    })();
  }
  return new Gatekeeper();
});

/**
 * Check a GK. Silently return false on error.
 */
exports.default = _asyncToGenerator(function* (name, timeout) {
  try {
    return (yield getGatekeeper().asyncIsGkEnabled(name, timeout)) === true;
  } catch (e) {
    return false;
  }
});

/**
 * Synchronous GK check. There is no guarantee that GKs have loaded. This
 * should be used inside a `onceGkInitialized`.
 */

function isGkEnabled(name) {
  return getGatekeeper().isGkEnabled(name);
}

function onceGkInitialized(callback, timeout) {
  return getGatekeeper().onceGkInitialized(callback, timeout);
}