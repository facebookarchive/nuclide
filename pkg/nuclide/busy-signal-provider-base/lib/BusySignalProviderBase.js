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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _rx = require('rx');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _commons = require('../../commons');

var isPromise = _commons.promises.isPromise;

var BusySignalProviderBase = (function () {
  function BusySignalProviderBase() {
    _classCallCheck(this, BusySignalProviderBase);

    this._nextId = 0;
    this._messages = new _rx.Subject();
    this.messages = this._messages;
  }

  /**
   * Displays the message until the returned disposable is disposed
   */

  _createClass(BusySignalProviderBase, [{
    key: 'displayMessage',
    value: function displayMessage(message, optionsArg) {
      var _this = this;

      // Reassign as const so the type refinement holds in the closure below
      var options = optionsArg;
      if (options == null || options.onlyForFile == null) {
        return this._displayMessage(message);
      }

      var displayedDisposable = null;
      var disposeDisplayed = function disposeDisplayed() {
        if (displayedDisposable != null) {
          displayedDisposable.dispose();
          displayedDisposable = null;
        }
      };
      return new _atom.CompositeDisposable(atom.workspace.observeActivePaneItem(function (item) {
        if (item != null && typeof item.getPath === 'function' && item.getPath() === options.onlyForFile) {
          if (displayedDisposable == null) {
            displayedDisposable = _this._displayMessage(message);
          }
        } else {
          disposeDisplayed();
        }
      }),
      // We can't add displayedDisposable directly because its value may change.
      new _atom.Disposable(disposeDisplayed));
    }
  }, {
    key: '_displayMessage',
    value: function _displayMessage(message) {
      var _this2 = this;

      var _nextMessagePair2 = this._nextMessagePair(message);

      var busy = _nextMessagePair2.busy;
      var done = _nextMessagePair2.done;

      this._messages.onNext(busy);
      return new _atom.Disposable(function () {
        _this2._messages.onNext(done);
      });
    }
  }, {
    key: '_nextMessagePair',
    value: function _nextMessagePair(message) {
      var busy = {
        status: 'busy',
        id: this._nextId,
        message: message
      };
      var done = {
        status: 'done',
        id: this._nextId
      };
      this._nextId++;
      return { busy: busy, done: done };
    }

    /**
     * Publishes a 'busy' message with the given string. Marks it as done when the
     * promise returned by the given function is resolved or rejected.
     *
     * Used to indicate that some work is ongoing while the given asynchronous
     * function executes.
     */
  }, {
    key: 'reportBusy',
    value: function reportBusy(message, f, options) {
      var messageRemover = this.displayMessage(message, options);
      var removeMessage = messageRemover.dispose.bind(messageRemover);
      try {
        var returnValue = f();
        (0, _assert2['default'])(isPromise(returnValue));
        returnValue.then(removeMessage, removeMessage);
        return returnValue;
      } catch (e) {
        removeMessage();
        throw e;
      }
    }
  }]);

  return BusySignalProviderBase;
})();

exports.BusySignalProviderBase = BusySignalProviderBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1c3lTaWduYWxQcm92aWRlckJhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWU4QyxNQUFNOztrQkFFOUIsSUFBSTs7c0JBQ0osUUFBUTs7Ozt1QkFFUCxlQUFlOztJQUMvQixTQUFTLHFCQUFULFNBQVM7O0lBTUgsc0JBQXNCO0FBS3RCLFdBTEEsc0JBQXNCLEdBS25COzBCQUxILHNCQUFzQjs7QUFNL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBYSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztHQUNoQzs7Ozs7O2VBVFUsc0JBQXNCOztXQWNuQix3QkFBQyxPQUFlLEVBQUUsVUFBa0MsRUFBZTs7OztBQUUvRSxVQUFNLE9BQU8sR0FBRyxVQUFVLENBQUM7QUFDM0IsVUFBSSxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFO0FBQ2xELGVBQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUN0Qzs7QUFFRCxVQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQztBQUMvQixVQUFNLGdCQUFnQixHQUFHLFNBQW5CLGdCQUFnQixHQUFTO0FBQzdCLFlBQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQy9CLDZCQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLDZCQUFtQixHQUFHLElBQUksQ0FBQztTQUM1QjtPQUNGLENBQUM7QUFDRixhQUFPLDhCQUNMLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsVUFBQSxJQUFJLEVBQUk7QUFDM0MsWUFBSSxJQUFJLElBQUksSUFBSSxJQUNaLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxVQUFVLElBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxPQUFPLENBQUMsV0FBVyxFQUFFO0FBQzFDLGNBQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQy9CLCtCQUFtQixHQUFHLE1BQUssZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1dBQ3JEO1NBQ0YsTUFBTTtBQUNMLDBCQUFnQixFQUFFLENBQUM7U0FDcEI7T0FDRixDQUFDOztBQUVGLDJCQUFlLGdCQUFnQixDQUFDLENBQ2pDLENBQUM7S0FDSDs7O1dBRWMseUJBQUMsT0FBZSxFQUFlOzs7OEJBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7O1VBQTVDLElBQUkscUJBQUosSUFBSTtVQUFFLElBQUkscUJBQUosSUFBSTs7QUFDakIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGVBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM3QixDQUFDLENBQUM7S0FDSjs7O1dBRWUsMEJBQUMsT0FBZSxFQUFzRDtBQUNwRixVQUFNLElBQUksR0FBRztBQUNYLGNBQU0sRUFBRSxNQUFNO0FBQ2QsVUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ2hCLGVBQU8sRUFBUCxPQUFPO09BQ1IsQ0FBQztBQUNGLFVBQU0sSUFBSSxHQUFHO0FBQ1gsY0FBTSxFQUFFLE1BQU07QUFDZCxVQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU87T0FDakIsQ0FBQztBQUNGLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLGFBQU8sRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUMsQ0FBQztLQUNyQjs7Ozs7Ozs7Ozs7V0FTWSxvQkFBQyxPQUFlLEVBQUUsQ0FBbUIsRUFBRSxPQUErQixFQUFjO0FBQy9GLFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdELFVBQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2xFLFVBQUk7QUFDRixZQUFNLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUN4QixpQ0FBVSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUNsQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDL0MsZUFBTyxXQUFXLENBQUM7T0FDcEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLHFCQUFhLEVBQUUsQ0FBQztBQUNoQixjQUFNLENBQUMsQ0FBQztPQUNUO0tBQ0Y7OztTQXRGVSxzQkFBc0IiLCJmaWxlIjoiQnVzeVNpZ25hbFByb3ZpZGVyQmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsTWVzc2FnZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5jb25zdCB7aXNQcm9taXNlfSA9IHByb21pc2VzO1xuXG5leHBvcnQgdHlwZSBNZXNzYWdlRGlzcGxheU9wdGlvbnMgPSB7XG4gIG9ubHlGb3JGaWxlOiBOdWNsaWRlVXJpLFxufTtcblxuZXhwb3J0IGNsYXNzIEJ1c3lTaWduYWxQcm92aWRlckJhc2Uge1xuICBfbmV4dElkOiBudW1iZXI7XG4gIF9tZXNzYWdlczogU3ViamVjdDxCdXN5U2lnbmFsTWVzc2FnZT47XG4gIG1lc3NhZ2VzOiBPYnNlcnZhYmxlPEJ1c3lTaWduYWxNZXNzYWdlPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9uZXh0SWQgPSAwO1xuICAgIHRoaXMuX21lc3NhZ2VzID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgdGhlIG1lc3NhZ2UgdW50aWwgdGhlIHJldHVybmVkIGRpc3Bvc2FibGUgaXMgZGlzcG9zZWRcbiAgICovXG4gIGRpc3BsYXlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9uc0FyZz86IE1lc3NhZ2VEaXNwbGF5T3B0aW9ucyk6IElEaXNwb3NhYmxlIHtcbiAgICAvLyBSZWFzc2lnbiBhcyBjb25zdCBzbyB0aGUgdHlwZSByZWZpbmVtZW50IGhvbGRzIGluIHRoZSBjbG9zdXJlIGJlbG93XG4gICAgY29uc3Qgb3B0aW9ucyA9IG9wdGlvbnNBcmc7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCB8fCBvcHRpb25zLm9ubHlGb3JGaWxlID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBsZXQgZGlzcGxheWVkRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgY29uc3QgZGlzcG9zZURpc3BsYXllZCA9ICgpID0+IHtcbiAgICAgIGlmIChkaXNwbGF5ZWREaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgICAgZGlzcGxheWVkRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgIGRpc3BsYXllZERpc3Bvc2FibGUgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoaXRlbSAhPSBudWxsICYmXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5nZXRQYXRoID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICBpdGVtLmdldFBhdGgoKSA9PT0gb3B0aW9ucy5vbmx5Rm9yRmlsZSkge1xuICAgICAgICAgIGlmIChkaXNwbGF5ZWREaXNwb3NhYmxlID09IG51bGwpIHtcbiAgICAgICAgICAgIGRpc3BsYXllZERpc3Bvc2FibGUgPSB0aGlzLl9kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlzcG9zZURpc3BsYXllZCgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIC8vIFdlIGNhbid0IGFkZCBkaXNwbGF5ZWREaXNwb3NhYmxlIGRpcmVjdGx5IGJlY2F1c2UgaXRzIHZhbHVlIG1heSBjaGFuZ2UuXG4gICAgICBuZXcgRGlzcG9zYWJsZShkaXNwb3NlRGlzcGxheWVkKVxuICAgICk7XG4gIH1cblxuICBfZGlzcGxheU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IHtidXN5LCBkb25lfSA9IHRoaXMuX25leHRNZXNzYWdlUGFpcihtZXNzYWdlKTtcbiAgICB0aGlzLl9tZXNzYWdlcy5vbk5leHQoYnVzeSk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX21lc3NhZ2VzLm9uTmV4dChkb25lKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9uZXh0TWVzc2FnZVBhaXIobWVzc2FnZTogc3RyaW5nKToge2J1c3k6IEJ1c3lTaWduYWxNZXNzYWdlLCBkb25lOiBCdXN5U2lnbmFsTWVzc2FnZX0ge1xuICAgIGNvbnN0IGJ1c3kgPSB7XG4gICAgICBzdGF0dXM6ICdidXN5JyxcbiAgICAgIGlkOiB0aGlzLl9uZXh0SWQsXG4gICAgICBtZXNzYWdlLFxuICAgIH07XG4gICAgY29uc3QgZG9uZSA9IHtcbiAgICAgIHN0YXR1czogJ2RvbmUnLFxuICAgICAgaWQ6IHRoaXMuX25leHRJZCxcbiAgICB9O1xuICAgIHRoaXMuX25leHRJZCsrO1xuICAgIHJldHVybiB7YnVzeSwgZG9uZX07XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGVzIGEgJ2J1c3knIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gc3RyaW5nLiBNYXJrcyBpdCBhcyBkb25lIHdoZW4gdGhlXG4gICAqIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGdpdmVuIGZ1bmN0aW9uIGlzIHJlc29sdmVkIG9yIHJlamVjdGVkLlxuICAgKlxuICAgKiBVc2VkIHRvIGluZGljYXRlIHRoYXQgc29tZSB3b3JrIGlzIG9uZ29pbmcgd2hpbGUgdGhlIGdpdmVuIGFzeW5jaHJvbm91c1xuICAgKiBmdW5jdGlvbiBleGVjdXRlcy5cbiAgICovXG4gIHJlcG9ydEJ1c3k8VD4obWVzc2FnZTogc3RyaW5nLCBmOiAoKSA9PiBQcm9taXNlPFQ+LCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgbWVzc2FnZVJlbW92ZXIgPSB0aGlzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHJlbW92ZU1lc3NhZ2UgPSBtZXNzYWdlUmVtb3Zlci5kaXNwb3NlLmJpbmQobWVzc2FnZVJlbW92ZXIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IGYoKTtcbiAgICAgIGludmFyaWFudChpc1Byb21pc2UocmV0dXJuVmFsdWUpKTtcbiAgICAgIHJldHVyblZhbHVlLnRoZW4ocmVtb3ZlTWVzc2FnZSwgcmVtb3ZlTWVzc2FnZSk7XG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVtb3ZlTWVzc2FnZSgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==