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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1c3lTaWduYWxQcm92aWRlckJhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWU4QyxNQUFNOztrQkFFOUIsSUFBSTs7c0JBQ0osUUFBUTs7Ozt1QkFFUCxlQUFlOztJQUMvQixTQUFTLHFCQUFULFNBQVM7O0lBTUgsc0JBQXNCO0FBS3RCLFdBTEEsc0JBQXNCLEdBS25COzBCQUxILHNCQUFzQjs7QUFNL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsUUFBSSxDQUFDLFNBQVMsR0FBRyxpQkFBYSxDQUFDO0FBQy9CLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztHQUNoQzs7Ozs7O2VBVFUsc0JBQXNCOztXQWNuQix3QkFBQyxPQUFlLEVBQUUsT0FBK0IsRUFBZTs7O0FBQzVFLFVBQUksT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksRUFBRTtBQUNsRCxlQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDdEM7O0FBRUQsVUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDL0IsVUFBTSxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsR0FBUztBQUM3QixZQUFJLG1CQUFtQixJQUFJLElBQUksRUFBRTtBQUMvQiw2QkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5Qiw2QkFBbUIsR0FBRyxJQUFJLENBQUM7U0FDNUI7T0FDRixDQUFDO0FBQ0YsYUFBTyw4QkFDTCxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLFVBQUEsSUFBSSxFQUFJO0FBQzNDLFlBQUksSUFBSSxJQUFJLElBQUksSUFDWixPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssVUFBVSxJQUNsQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssT0FBTyxDQUFDLFdBQVcsRUFBRTtBQUMxQyxjQUFJLG1CQUFtQixJQUFJLElBQUksRUFBRTtBQUMvQiwrQkFBbUIsR0FBRyxNQUFLLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztXQUNyRDtTQUNGLE1BQU07QUFDTCwwQkFBZ0IsRUFBRSxDQUFDO1NBQ3BCO09BQ0YsQ0FBQzs7QUFFRiwyQkFBZSxnQkFBZ0IsQ0FBQyxDQUNqQyxDQUFDO0tBQ0g7OztXQUVjLHlCQUFDLE9BQWUsRUFBZTs7OzhCQUN2QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDOztVQUE1QyxJQUFJLHFCQUFKLElBQUk7VUFBRSxJQUFJLHFCQUFKLElBQUk7O0FBQ2pCLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLGFBQU8scUJBQWUsWUFBTTtBQUMxQixlQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDN0IsQ0FBQyxDQUFDO0tBQ0o7OztXQUVlLDBCQUFDLE9BQWUsRUFBc0Q7QUFDcEYsVUFBTSxJQUFJLEdBQUc7QUFDWCxjQUFNLEVBQUUsTUFBTTtBQUNkLFVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTztBQUNoQixlQUFPLEVBQVAsT0FBTztPQUNSLENBQUM7QUFDRixVQUFNLElBQUksR0FBRztBQUNYLGNBQU0sRUFBRSxNQUFNO0FBQ2QsVUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPO09BQ2pCLENBQUM7QUFDRixVQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDZixhQUFPLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBRSxJQUFJLEVBQUosSUFBSSxFQUFDLENBQUM7S0FDckI7Ozs7Ozs7Ozs7O1dBU1ksb0JBQUMsT0FBZSxFQUFFLENBQW1CLEVBQUUsT0FBK0IsRUFBYztBQUMvRixVQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUM3RCxVQUFNLGFBQWEsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsRSxVQUFJO0FBQ0YsWUFBTSxXQUFXLEdBQUcsQ0FBQyxFQUFFLENBQUM7QUFDeEIsaUNBQVUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7QUFDbEMsbUJBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0FBQy9DLGVBQU8sV0FBVyxDQUFDO09BQ3BCLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixxQkFBYSxFQUFFLENBQUM7QUFDaEIsY0FBTSxDQUFDLENBQUM7T0FDVDtLQUNGOzs7U0FwRlUsc0JBQXNCIiwiZmlsZSI6IkJ1c3lTaWduYWxQcm92aWRlckJhc2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbE1lc3NhZ2V9IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge09ic2VydmFibGV9IGZyb20gJ3J4JztcblxuaW1wb3J0IHtEaXNwb3NhYmxlLCBDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7cHJvbWlzZXN9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuY29uc3Qge2lzUHJvbWlzZX0gPSBwcm9taXNlcztcblxuZXhwb3J0IHR5cGUgTWVzc2FnZURpc3BsYXlPcHRpb25zID0ge1xuICBvbmx5Rm9yRmlsZTogTnVjbGlkZVVyaSxcbn07XG5cbmV4cG9ydCBjbGFzcyBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlIHtcbiAgX25leHRJZDogbnVtYmVyO1xuICBfbWVzc2FnZXM6IFN1YmplY3Q8QnVzeVNpZ25hbE1lc3NhZ2U+O1xuICBtZXNzYWdlczogT2JzZXJ2YWJsZTxCdXN5U2lnbmFsTWVzc2FnZT47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fbmV4dElkID0gMDtcbiAgICB0aGlzLl9tZXNzYWdlcyA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5tZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VzO1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIHRoZSBtZXNzYWdlIHVudGlsIHRoZSByZXR1cm5lZCBkaXNwb3NhYmxlIGlzIGRpc3Bvc2VkXG4gICAqL1xuICBkaXNwbGF5TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcsIG9wdGlvbnM/OiBNZXNzYWdlRGlzcGxheU9wdGlvbnMpOiBJRGlzcG9zYWJsZSB7XG4gICAgaWYgKG9wdGlvbnMgPT0gbnVsbCB8fCBvcHRpb25zLm9ubHlGb3JGaWxlID09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9XG5cbiAgICBsZXQgZGlzcGxheWVkRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgY29uc3QgZGlzcG9zZURpc3BsYXllZCA9ICgpID0+IHtcbiAgICAgIGlmIChkaXNwbGF5ZWREaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgICAgZGlzcGxheWVkRGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICAgIGRpc3BsYXllZERpc3Bvc2FibGUgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVBhbmVJdGVtKGl0ZW0gPT4ge1xuICAgICAgICBpZiAoaXRlbSAhPSBudWxsICYmXG4gICAgICAgICAgICB0eXBlb2YgaXRlbS5nZXRQYXRoID09PSAnZnVuY3Rpb24nICYmXG4gICAgICAgICAgICBpdGVtLmdldFBhdGgoKSA9PT0gb3B0aW9ucy5vbmx5Rm9yRmlsZSkge1xuICAgICAgICAgIGlmIChkaXNwbGF5ZWREaXNwb3NhYmxlID09IG51bGwpIHtcbiAgICAgICAgICAgIGRpc3BsYXllZERpc3Bvc2FibGUgPSB0aGlzLl9kaXNwbGF5TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGlzcG9zZURpc3BsYXllZCgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIC8vIFdlIGNhbid0IGFkZCBkaXNwbGF5ZWREaXNwb3NhYmxlIGRpcmVjdGx5IGJlY2F1c2UgaXRzIHZhbHVlIG1heSBjaGFuZ2UuXG4gICAgICBuZXcgRGlzcG9zYWJsZShkaXNwb3NlRGlzcGxheWVkKVxuICAgICk7XG4gIH1cblxuICBfZGlzcGxheU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogSURpc3Bvc2FibGUge1xuICAgIGNvbnN0IHtidXN5LCBkb25lfSA9IHRoaXMuX25leHRNZXNzYWdlUGFpcihtZXNzYWdlKTtcbiAgICB0aGlzLl9tZXNzYWdlcy5vbk5leHQoYnVzeSk7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX21lc3NhZ2VzLm9uTmV4dChkb25lKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9uZXh0TWVzc2FnZVBhaXIobWVzc2FnZTogc3RyaW5nKToge2J1c3k6IEJ1c3lTaWduYWxNZXNzYWdlLCBkb25lOiBCdXN5U2lnbmFsTWVzc2FnZX0ge1xuICAgIGNvbnN0IGJ1c3kgPSB7XG4gICAgICBzdGF0dXM6ICdidXN5JyxcbiAgICAgIGlkOiB0aGlzLl9uZXh0SWQsXG4gICAgICBtZXNzYWdlLFxuICAgIH07XG4gICAgY29uc3QgZG9uZSA9IHtcbiAgICAgIHN0YXR1czogJ2RvbmUnLFxuICAgICAgaWQ6IHRoaXMuX25leHRJZCxcbiAgICB9O1xuICAgIHRoaXMuX25leHRJZCsrO1xuICAgIHJldHVybiB7YnVzeSwgZG9uZX07XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGVzIGEgJ2J1c3knIG1lc3NhZ2Ugd2l0aCB0aGUgZ2l2ZW4gc3RyaW5nLiBNYXJrcyBpdCBhcyBkb25lIHdoZW4gdGhlXG4gICAqIHByb21pc2UgcmV0dXJuZWQgYnkgdGhlIGdpdmVuIGZ1bmN0aW9uIGlzIHJlc29sdmVkIG9yIHJlamVjdGVkLlxuICAgKlxuICAgKiBVc2VkIHRvIGluZGljYXRlIHRoYXQgc29tZSB3b3JrIGlzIG9uZ29pbmcgd2hpbGUgdGhlIGdpdmVuIGFzeW5jaHJvbm91c1xuICAgKiBmdW5jdGlvbiBleGVjdXRlcy5cbiAgICovXG4gIHJlcG9ydEJ1c3k8VD4obWVzc2FnZTogc3RyaW5nLCBmOiAoKSA9PiBQcm9taXNlPFQ+LCBvcHRpb25zPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgbWVzc2FnZVJlbW92ZXIgPSB0aGlzLmRpc3BsYXlNZXNzYWdlKG1lc3NhZ2UsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHJlbW92ZU1lc3NhZ2UgPSBtZXNzYWdlUmVtb3Zlci5kaXNwb3NlLmJpbmQobWVzc2FnZVJlbW92ZXIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXR1cm5WYWx1ZSA9IGYoKTtcbiAgICAgIGludmFyaWFudChpc1Byb21pc2UocmV0dXJuVmFsdWUpKTtcbiAgICAgIHJldHVyblZhbHVlLnRoZW4ocmVtb3ZlTWVzc2FnZSwgcmVtb3ZlTWVzc2FnZSk7XG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVtb3ZlTWVzc2FnZSgpO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==