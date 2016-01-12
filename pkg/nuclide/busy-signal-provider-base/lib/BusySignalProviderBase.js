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
    value: function displayMessage(message, options) {
      var _this = this;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1c3lTaWduYWxQcm92aWRlckJhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWU4QyxNQUFNOztrQkFFOUIsSUFBSTs7c0JBQ0osUUFBUTs7Ozt1QkFFUCxlQUFlOztJQUMvQixTQUFTLHFCQUFULFNBQVM7O0lBTUgsc0JBQXNCO0FBS3RCLFdBTEEsc0JBQXNCLEdBS25COzBCQUxILHNCQUFzQjs7QUFNL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBYSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztHQUNoQzs7Ozs7O2VBVFUsc0JBQXNCOztXQWNuQix3QkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBb0I7OztBQUNqRixVQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDbEQsZUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3RDOztBQUVELFVBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFVBQU0sZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLEdBQVM7QUFDN0IsWUFBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsNkJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsNkJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQzVCO09BQ0YsQ0FBQztBQUNGLGFBQU8sOEJBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMzQyxZQUFJLElBQUksSUFBSSxJQUFJLElBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsSUFDbEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDMUMsY0FBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsK0JBQW1CLEdBQUcsTUFBSyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDckQ7U0FDRixNQUFNO0FBQ0wsMEJBQWdCLEVBQUUsQ0FBQztTQUNwQjtPQUNGLENBQUM7O0FBRUYsMkJBQWUsZ0JBQWdCLENBQUMsQ0FDakMsQ0FBQztLQUNIOzs7V0FFYyx5QkFBQyxPQUFlLEVBQW1COzs7OEJBQzNCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7O1VBQTVDLElBQUkscUJBQUosSUFBSTtVQUFFLElBQUkscUJBQUosSUFBSTs7QUFDakIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUIsYUFBTyxxQkFBZSxZQUFNO0FBQzFCLGVBQUssU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM3QixDQUFDLENBQUM7S0FDSjs7O1dBRWUsMEJBQUMsT0FBZSxFQUFzRDtBQUNwRixVQUFNLElBQUksR0FBRztBQUNYLGNBQU0sRUFBRSxNQUFNO0FBQ2QsVUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPO0FBQ2hCLGVBQU8sRUFBUCxPQUFPO09BQ1IsQ0FBQztBQUNGLFVBQU0sSUFBSSxHQUFHO0FBQ1gsY0FBTSxFQUFFLE1BQU07QUFDZCxVQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU87T0FDakIsQ0FBQztBQUNGLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLGFBQU8sRUFBQyxJQUFJLEVBQUosSUFBSSxFQUFFLElBQUksRUFBSixJQUFJLEVBQUMsQ0FBQztLQUNyQjs7Ozs7Ozs7Ozs7V0FTWSxvQkFBQyxPQUFlLEVBQUUsQ0FBbUIsRUFBRSxPQUErQixFQUFjO0FBQy9GLFVBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzdELFVBQU0sYUFBYSxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ2xFLFVBQUk7QUFDRixZQUFNLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQztBQUN4QixpQ0FBVSxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUNsQyxtQkFBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDL0MsZUFBTyxXQUFXLENBQUM7T0FDcEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLHFCQUFhLEVBQUUsQ0FBQztBQUNoQixjQUFNLENBQUMsQ0FBQztPQUNUO0tBQ0Y7OztTQXBGVSxzQkFBc0IiLCJmaWxlIjoiQnVzeVNpZ25hbFByb3ZpZGVyQmFzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsTWVzc2FnZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtaW50ZXJmYWNlcyc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5jb25zdCB7aXNQcm9taXNlfSA9IHByb21pc2VzO1xuXG5leHBvcnQgdHlwZSBNZXNzYWdlRGlzcGxheU9wdGlvbnMgPSB7XG4gIG9ubHlGb3JGaWxlOiBOdWNsaWRlVXJpLFxufTtcblxuZXhwb3J0IGNsYXNzIEJ1c3lTaWduYWxQcm92aWRlckJhc2Uge1xuICBfbmV4dElkOiBudW1iZXI7XG4gIF9tZXNzYWdlczogU3ViamVjdDxCdXN5U2lnbmFsTWVzc2FnZT47XG4gIG1lc3NhZ2VzOiBPYnNlcnZhYmxlPEJ1c3lTaWduYWxNZXNzYWdlPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9uZXh0SWQgPSAwO1xuICAgIHRoaXMuX21lc3NhZ2VzID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZXM7XG4gIH1cblxuICAvKipcbiAgICogRGlzcGxheXMgdGhlIG1lc3NhZ2UgdW50aWwgdGhlIHJldHVybmVkIGRpc3Bvc2FibGUgaXMgZGlzcG9zZWRcbiAgICovXG4gIGRpc3BsYXlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZywgb3B0aW9ucz86IE1lc3NhZ2VEaXNwbGF5T3B0aW9ucyk6IGF0b20kSURpc3Bvc2FibGUge1xuICAgIGlmIChvcHRpb25zID09IG51bGwgfHwgb3B0aW9ucy5vbmx5Rm9yRmlsZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfVxuXG4gICAgbGV0IGRpc3BsYXllZERpc3Bvc2FibGUgPSBudWxsO1xuICAgIGNvbnN0IGRpc3Bvc2VEaXNwbGF5ZWQgPSAoKSA9PiB7XG4gICAgICBpZiAoZGlzcGxheWVkRGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICAgIGRpc3BsYXllZERpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgICBkaXNwbGF5ZWREaXNwb3NhYmxlID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVBY3RpdmVQYW5lSXRlbShpdGVtID0+IHtcbiAgICAgICAgaWYgKGl0ZW0gIT0gbnVsbCAmJlxuICAgICAgICAgICAgdHlwZW9mIGl0ZW0uZ2V0UGF0aCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgICAgICAgaXRlbS5nZXRQYXRoKCkgPT09IG9wdGlvbnMub25seUZvckZpbGUpIHtcbiAgICAgICAgICBpZiAoZGlzcGxheWVkRGlzcG9zYWJsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBkaXNwbGF5ZWREaXNwb3NhYmxlID0gdGhpcy5fZGlzcGxheU1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRpc3Bvc2VEaXNwbGF5ZWQoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICAvLyBXZSBjYW4ndCBhZGQgZGlzcGxheWVkRGlzcG9zYWJsZSBkaXJlY3RseSBiZWNhdXNlIGl0cyB2YWx1ZSBtYXkgY2hhbmdlLlxuICAgICAgbmV3IERpc3Bvc2FibGUoZGlzcG9zZURpc3BsYXllZClcbiAgICApO1xuICB9XG5cbiAgX2Rpc3BsYXlNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgY29uc3Qge2J1c3ksIGRvbmV9ID0gdGhpcy5fbmV4dE1lc3NhZ2VQYWlyKG1lc3NhZ2UpO1xuICAgIHRoaXMuX21lc3NhZ2VzLm9uTmV4dChidXN5KTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fbWVzc2FnZXMub25OZXh0KGRvbmUpO1xuICAgIH0pO1xuICB9XG5cbiAgX25leHRNZXNzYWdlUGFpcihtZXNzYWdlOiBzdHJpbmcpOiB7YnVzeTogQnVzeVNpZ25hbE1lc3NhZ2UsIGRvbmU6IEJ1c3lTaWduYWxNZXNzYWdlfSB7XG4gICAgY29uc3QgYnVzeSA9IHtcbiAgICAgIHN0YXR1czogJ2J1c3knLFxuICAgICAgaWQ6IHRoaXMuX25leHRJZCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfTtcbiAgICBjb25zdCBkb25lID0ge1xuICAgICAgc3RhdHVzOiAnZG9uZScsXG4gICAgICBpZDogdGhpcy5fbmV4dElkLFxuICAgIH07XG4gICAgdGhpcy5fbmV4dElkKys7XG4gICAgcmV0dXJuIHtidXN5LCBkb25lfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoZXMgYSAnYnVzeScgbWVzc2FnZSB3aXRoIHRoZSBnaXZlbiBzdHJpbmcuIE1hcmtzIGl0IGFzIGRvbmUgd2hlbiB0aGVcbiAgICogcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZ2l2ZW4gZnVuY3Rpb24gaXMgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG4gICAqXG4gICAqIFVzZWQgdG8gaW5kaWNhdGUgdGhhdCBzb21lIHdvcmsgaXMgb25nb2luZyB3aGlsZSB0aGUgZ2l2ZW4gYXN5bmNocm9ub3VzXG4gICAqIGZ1bmN0aW9uIGV4ZWN1dGVzLlxuICAgKi9cbiAgcmVwb3J0QnVzeTxUPihtZXNzYWdlOiBzdHJpbmcsIGY6ICgpID0+IFByb21pc2U8VD4sIG9wdGlvbnM/OiBNZXNzYWdlRGlzcGxheU9wdGlvbnMpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBtZXNzYWdlUmVtb3ZlciA9IHRoaXMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgY29uc3QgcmVtb3ZlTWVzc2FnZSA9IG1lc3NhZ2VSZW1vdmVyLmRpc3Bvc2UuYmluZChtZXNzYWdlUmVtb3Zlcik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gZigpO1xuICAgICAgaW52YXJpYW50KGlzUHJvbWlzZShyZXR1cm5WYWx1ZSkpO1xuICAgICAgcmV0dXJuVmFsdWUudGhlbihyZW1vdmVNZXNzYWdlLCByZW1vdmVNZXNzYWdlKTtcbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZW1vdmVNZXNzYWdlKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxufVxuIl19