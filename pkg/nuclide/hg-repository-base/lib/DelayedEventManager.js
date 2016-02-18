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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlbGF5ZWRFdmVudE1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQWVNLG1CQUFtQjtBQU9aLFdBUFAsbUJBQW1CLENBUXJCLGNBQXFELEVBQ3JELGdCQUEyQyxFQUMzQzswQkFWRSxtQkFBbUI7OztBQVlyQixRQUFJLENBQUMsbUJBQW1CLEdBQUcsY0FBYyxDQUFDO0FBQzFDLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxnQkFBZ0IsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7R0FDdkI7O2VBakJHLG1CQUFtQjs7V0FtQmhCLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3hCOzs7Ozs7OztXQU1pQiw0QkFBQyxlQUF3QixFQUFRO0FBQ2pELFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7S0FDekM7Ozs7Ozs7O1dBTU8sa0JBQUMsUUFBb0IsRUFBRSxtQkFBMkIsRUFBUTtBQUNoRSxVQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQzFCLGVBQU8sSUFBSSxDQUFDO09BQ2I7O0FBRUQsVUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUM7QUFDcEQsVUFBTSxPQUFPLEdBQUcsa0JBQWtCLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDLENBQUM7QUFDbEUsVUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkIsYUFBTyxPQUFPLENBQUM7S0FDaEI7Ozs7Ozs7V0FLVSxxQkFBQyxVQUFlLEVBQVE7QUFDakMsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksVUFBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLFVBQUksS0FBSyxFQUFFOztBQUVULFlBQU0sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDO0FBQ3hELDRCQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO09BQ2xDO0tBQ0Y7Ozs7Ozs7V0FLYywyQkFBUzs7QUFFdEIsVUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUM7QUFDeEQsVUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUN4QyxVQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ25COzs7U0FsRUcsbUJBQW1COzs7QUFxRXpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRGVsYXllZEV2ZW50TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuLyoqXG4gKiBUaGlzIGNsYXNzIG1hbmFnZXMgY3JlYXRpbmcgYW5kIGNhbmNlbGluZyBkZWxheWVkIGV2ZW50cy5cbiAqL1xuY2xhc3MgRGVsYXllZEV2ZW50TWFuYWdlciB7XG5cbiAgX3NldFRpbWVvdXRGdW5jdGlvbjogKGNhbGxiYWNrOiBhbnksIGRlbGF5OiBudW1iZXIpID0+IGFueTtcbiAgX2NsZWFyVGltZW91dEZ1bmN0aW9uOiAoaWRlbnRpZmllcjogYW55KSA9PiB2b2lkO1xuICBfY2FuQWNjZXB0RXZlbnRzOiBib29sZWFuO1xuICBfaWRzOiBTZXQ8bnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzZXRUaW1lb3V0RnVuYzogKGNhbGxiYWNrOiBhbnksIGRlbGF5OiBudW1iZXIpID0+IGFueSxcbiAgICBjbGVhclRpbWVvdXRGdW5jOiAoaWRlbnRpZmllcjogYW55KSA9PiB2b2lkXG4gICkge1xuICAgIC8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgcGFzc2VkIGZyb20gYWJvdmUgdG8gZmFjaWxpdGF0ZSB0ZXN0aW5nLlxuICAgIHRoaXMuX3NldFRpbWVvdXRGdW5jdGlvbiA9IHNldFRpbWVvdXRGdW5jO1xuICAgIHRoaXMuX2NsZWFyVGltZW91dEZ1bmN0aW9uID0gY2xlYXJUaW1lb3V0RnVuYztcblxuICAgIHRoaXMuX2NhbkFjY2VwdEV2ZW50cyA9IHRydWU7XG4gICAgdGhpcy5faWRzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNhbmNlbEFsbEV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgd2hldGhlciB0aGUgRGVsYXllZEV2ZW50TWFuYWdlciBjYW4gY3VycmVudGx5IGFjY2VwdCBtb3JlIGV2ZW50cy5cbiAgICogSWYgc2V0IHRvIHRydWUsIGl0IGNhbi4gSWYgc2V0IHRvIGZhbHNlLCA6OmFkZEV2ZW50IGJlY29tZXMgYSBuby1vcC5cbiAgICovXG4gIHNldENhbkFjY2VwdEV2ZW50cyhjYW5BY2NlcHRFdmVudHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9jYW5BY2NlcHRFdmVudHMgPSBjYW5BY2NlcHRFdmVudHM7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBldmVudCBhbmQgcmV0dXJucyBhbiBpZGVudGlmaWVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gY2FuY2VsIGl0LFxuICAgKiBvciBudWxsIGlmIHRoZSBtYW5hZ2VyIGNhbm5vdCBhY2NlcHQgZXZlbnRzLlxuICAgKi9cbiAgYWRkRXZlbnQoY2FsbGJhY2s6ICgpID0+IHZvaWQsIGRlbGF5SW5NaWxsaXNlY29uZHM6IG51bWJlcik6ID9hbnkge1xuICAgIGlmICghdGhpcy5fY2FuQWNjZXB0RXZlbnRzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgLy8gUHJldmVudCAndGhpcycgZnJvbSBiZWluZyBib3VuZCB0byBEZWxheWVkRXZlbnRNYW5hZ2VyLlxuICAgIGNvbnN0IHNldFRpbWVvdXRGdW5jdGlvbiA9IHRoaXMuX3NldFRpbWVvdXRGdW5jdGlvbjtcbiAgICBjb25zdCBldmVudElkID0gc2V0VGltZW91dEZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheUluTWlsbGlzZWNvbmRzKTtcbiAgICB0aGlzLl9pZHMuYWRkKGV2ZW50SWQpO1xuICAgIHJldHVybiBldmVudElkO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbmNlbCB0aGUgZXZlbnQgd2l0aCB0aGUgZ2l2ZW4gaWRlbnRpZmllci5cbiAgICovXG4gIGNhbmNlbEV2ZW50KGlkZW50aWZpZXI6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IGhhZElkID0gdGhpcy5faWRzLmRlbGV0ZShpZGVudGlmaWVyKTtcbiAgICBpZiAoaGFkSWQpIHtcbiAgICAgIC8vIFByZXZlbnQgJ3RoaXMnIGZyb20gYmVpbmcgYm91bmQgdG8gRGVsYXllZEV2ZW50TWFuYWdlci5cbiAgICAgIGNvbnN0IGNsZWFyVGltZW91dEZ1bmN0aW9uID0gdGhpcy5fY2xlYXJUaW1lb3V0RnVuY3Rpb247XG4gICAgICBjbGVhclRpbWVvdXRGdW5jdGlvbihpZGVudGlmaWVyKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBwZW5kaW5nIGV2ZW50cy5cbiAgICovXG4gIGNhbmNlbEFsbEV2ZW50cygpOiB2b2lkIHtcbiAgICAvLyBQcmV2ZW50ICd0aGlzJyBmcm9tIGJlaW5nIGJvdW5kIHRvIERlbGF5ZWRFdmVudE1hbmFnZXIuXG4gICAgY29uc3QgY2xlYXJUaW1lb3V0RnVuY3Rpb24gPSB0aGlzLl9jbGVhclRpbWVvdXRGdW5jdGlvbjtcbiAgICB0aGlzLl9pZHMuZm9yRWFjaChjbGVhclRpbWVvdXRGdW5jdGlvbik7XG4gICAgdGhpcy5faWRzLmNsZWFyKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEZWxheWVkRXZlbnRNYW5hZ2VyO1xuIl19