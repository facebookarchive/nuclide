var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This class manages creating and canceling delayed events.
 */

var DelayedEventManager = (function () {
  function DelayedEventManager(setTimeoutFunc, clearTimeoutFunc) {
    _classCallCheck(this, DelayedEventManager);

    // These functions are passed from above to facilitate testing.
    this._setTimeoutFunction = setTimeoutFunc;
    this._clearTimeoutFunction = clearTimeoutFunc;

    this._canAcceptEvents = true;
    this._ids = new Set();
  }

  _createClass(DelayedEventManager, [{
    key: 'dispose',
    value: function dispose() {
      this.cancelAllEvents();
    }

    /**
     * Sets whether the DelayedEventManager can currently accept more events.
     * If set to true, it can. If set to false, ::addEvent becomes a no-op.
     */
  }, {
    key: 'setCanAcceptEvents',
    value: function setCanAcceptEvents(canAcceptEvents) {
      this._canAcceptEvents = canAcceptEvents;
    }

    /**
     * Creates an event and returns an identifier that can be used to cancel it,
     * or null if the manager cannot accept events.
     */
  }, {
    key: 'addEvent',
    value: function addEvent(callback, delayInMilliseconds) {
      if (!this._canAcceptEvents) {
        return null;
      }
      // Prevent 'this' from being bound to DelayedEventManager.
      var setTimeoutFunction = this._setTimeoutFunction;
      var eventId = setTimeoutFunction(callback, delayInMilliseconds);
      this._ids.add(eventId);
      return eventId;
    }

    /**
     * Cancel the event with the given identifier.
     */
  }, {
    key: 'cancelEvent',
    value: function cancelEvent(identifier) {
      var hadId = this._ids['delete'](identifier);
      if (hadId) {
        // Prevent 'this' from being bound to DelayedEventManager.
        var clearTimeoutFunction = this._clearTimeoutFunction;
        clearTimeoutFunction(identifier);
      }
    }

    /**
     * Clears all pending events.
     */
  }, {
    key: 'cancelAllEvents',
    value: function cancelAllEvents() {
      // Prevent 'this' from being bound to DelayedEventManager.
      var clearTimeoutFunction = this._clearTimeoutFunction;
      this._ids.forEach(clearTimeoutFunction);
      this._ids.clear();
    }
  }]);

  return DelayedEventManager;
})();

module.exports = DelayedEventManager;