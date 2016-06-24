var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var WebInspector = window.WebInspector;

/**
 * Wrapper around `WebInspector.Object` to act like `atom.Emitter`.
 */

var Emitter = (function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    this._underlying = new WebInspector.Object();
  }

  _createClass(Emitter, [{
    key: 'on',
    value: function on(eventType, callback) {
      var _this = this;

      var listener = function listener(event) {
        return callback(event.data);
      };
      this._underlying.addEventListener(eventType, listener);
      return {
        dispose: function dispose() {
          _this._underlying.removeEventListener(eventType, listener);
        }
      };
    }
  }, {
    key: 'emit',
    value: function emit(eventType, value) {
      this._underlying.dispatchEventToListeners(eventType, value);
    }
  }]);

  return Emitter;
})();

module.exports = Emitter;