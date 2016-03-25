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

var _nuclideCommons = require('../../nuclide-commons');

var isPromise = _nuclideCommons.promises.isPromise;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJ1c3lTaWduYWxQcm92aWRlckJhc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWU4QyxNQUFNOztrQkFFOUIsSUFBSTs7c0JBQ0osUUFBUTs7Ozs4QkFFUCx1QkFBdUI7O0lBQ3ZDLFNBQVMsNEJBQVQsU0FBUzs7SUFNSCxzQkFBc0I7QUFLdEIsV0FMQSxzQkFBc0IsR0FLbkI7MEJBTEgsc0JBQXNCOztBQU0vQixRQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixRQUFJLENBQUMsU0FBUyxHQUFHLGlCQUFhLENBQUM7QUFDL0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0dBQ2hDOzs7Ozs7ZUFUVSxzQkFBc0I7O1dBY25CLHdCQUFDLE9BQWUsRUFBRSxVQUFrQyxFQUFlOzs7O0FBRS9FLFVBQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQztBQUMzQixVQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDbEQsZUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3RDOztBQUVELFVBQUksbUJBQW1CLEdBQUcsSUFBSSxDQUFDO0FBQy9CLFVBQU0sZ0JBQWdCLEdBQUcsU0FBbkIsZ0JBQWdCLEdBQVM7QUFDN0IsWUFBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsNkJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsNkJBQW1CLEdBQUcsSUFBSSxDQUFDO1NBQzVCO09BQ0YsQ0FBQztBQUNGLGFBQU8sOEJBQ0wsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMzQyxZQUFJLElBQUksSUFBSSxJQUFJLElBQ1osT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFVBQVUsSUFDbEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDMUMsY0FBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsK0JBQW1CLEdBQUcsTUFBSyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDckQ7U0FDRixNQUFNO0FBQ0wsMEJBQWdCLEVBQUUsQ0FBQztTQUNwQjtPQUNGLENBQUM7O0FBRUYsMkJBQWUsZ0JBQWdCLENBQUMsQ0FDakMsQ0FBQztLQUNIOzs7V0FFYyx5QkFBQyxPQUFlLEVBQWU7Ozs4QkFDdkIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQzs7VUFBNUMsSUFBSSxxQkFBSixJQUFJO1VBQUUsSUFBSSxxQkFBSixJQUFJOztBQUNqQixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixhQUFPLHFCQUFlLFlBQU07QUFDMUIsZUFBSyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzdCLENBQUMsQ0FBQztLQUNKOzs7V0FFZSwwQkFBQyxPQUFlLEVBQXNEO0FBQ3BGLFVBQU0sSUFBSSxHQUFHO0FBQ1gsY0FBTSxFQUFFLE1BQU07QUFDZCxVQUFFLEVBQUUsSUFBSSxDQUFDLE9BQU87QUFDaEIsZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDO0FBQ0YsVUFBTSxJQUFJLEdBQUc7QUFDWCxjQUFNLEVBQUUsTUFBTTtBQUNkLFVBQUUsRUFBRSxJQUFJLENBQUMsT0FBTztPQUNqQixDQUFDO0FBQ0YsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2YsYUFBTyxFQUFDLElBQUksRUFBSixJQUFJLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDO0tBQ3JCOzs7Ozs7Ozs7OztXQVNZLG9CQUFDLE9BQWUsRUFBRSxDQUFtQixFQUFFLE9BQStCLEVBQWM7QUFDL0YsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDN0QsVUFBTSxhQUFhLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDbEUsVUFBSTtBQUNGLFlBQU0sV0FBVyxHQUFHLENBQUMsRUFBRSxDQUFDO0FBQ3hCLGlDQUFVLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLG1CQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMvQyxlQUFPLFdBQVcsQ0FBQztPQUNwQixDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ1YscUJBQWEsRUFBRSxDQUFDO0FBQ2hCLGNBQU0sQ0FBQyxDQUFDO09BQ1Q7S0FDRjs7O1NBdEZVLHNCQUFzQiIsImZpbGUiOiJCdXN5U2lnbmFsUHJvdmlkZXJCYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxNZXNzYWdlfSBmcm9tICcuLi8uLi9udWNsaWRlLWJ1c3ktc2lnbmFsLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7T2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtwcm9taXNlc30gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmNvbnN0IHtpc1Byb21pc2V9ID0gcHJvbWlzZXM7XG5cbmV4cG9ydCB0eXBlIE1lc3NhZ2VEaXNwbGF5T3B0aW9ucyA9IHtcbiAgb25seUZvckZpbGU6IE51Y2xpZGVVcmk7XG59O1xuXG5leHBvcnQgY2xhc3MgQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSB7XG4gIF9uZXh0SWQ6IG51bWJlcjtcbiAgX21lc3NhZ2VzOiBTdWJqZWN0PEJ1c3lTaWduYWxNZXNzYWdlPjtcbiAgbWVzc2FnZXM6IE9ic2VydmFibGU8QnVzeVNpZ25hbE1lc3NhZ2U+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX25leHRJZCA9IDA7XG4gICAgdGhpcy5fbWVzc2FnZXMgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMubWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwbGF5cyB0aGUgbWVzc2FnZSB1bnRpbCB0aGUgcmV0dXJuZWQgZGlzcG9zYWJsZSBpcyBkaXNwb3NlZFxuICAgKi9cbiAgZGlzcGxheU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nLCBvcHRpb25zQXJnPzogTWVzc2FnZURpc3BsYXlPcHRpb25zKTogSURpc3Bvc2FibGUge1xuICAgIC8vIFJlYXNzaWduIGFzIGNvbnN0IHNvIHRoZSB0eXBlIHJlZmluZW1lbnQgaG9sZHMgaW4gdGhlIGNsb3N1cmUgYmVsb3dcbiAgICBjb25zdCBvcHRpb25zID0gb3B0aW9uc0FyZztcbiAgICBpZiAob3B0aW9ucyA9PSBudWxsIHx8IG9wdGlvbnMub25seUZvckZpbGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2Rpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH1cblxuICAgIGxldCBkaXNwbGF5ZWREaXNwb3NhYmxlID0gbnVsbDtcbiAgICBjb25zdCBkaXNwb3NlRGlzcGxheWVkID0gKCkgPT4ge1xuICAgICAgaWYgKGRpc3BsYXllZERpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgICBkaXNwbGF5ZWREaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgZGlzcGxheWVkRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0oaXRlbSA9PiB7XG4gICAgICAgIGlmIChpdGVtICE9IG51bGwgJiZcbiAgICAgICAgICAgIHR5cGVvZiBpdGVtLmdldFBhdGggPT09ICdmdW5jdGlvbicgJiZcbiAgICAgICAgICAgIGl0ZW0uZ2V0UGF0aCgpID09PSBvcHRpb25zLm9ubHlGb3JGaWxlKSB7XG4gICAgICAgICAgaWYgKGRpc3BsYXllZERpc3Bvc2FibGUgPT0gbnVsbCkge1xuICAgICAgICAgICAgZGlzcGxheWVkRGlzcG9zYWJsZSA9IHRoaXMuX2Rpc3BsYXlNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkaXNwb3NlRGlzcGxheWVkKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgLy8gV2UgY2FuJ3QgYWRkIGRpc3BsYXllZERpc3Bvc2FibGUgZGlyZWN0bHkgYmVjYXVzZSBpdHMgdmFsdWUgbWF5IGNoYW5nZS5cbiAgICAgIG5ldyBEaXNwb3NhYmxlKGRpc3Bvc2VEaXNwbGF5ZWQpXG4gICAgKTtcbiAgfVxuXG4gIF9kaXNwbGF5TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiBJRGlzcG9zYWJsZSB7XG4gICAgY29uc3Qge2J1c3ksIGRvbmV9ID0gdGhpcy5fbmV4dE1lc3NhZ2VQYWlyKG1lc3NhZ2UpO1xuICAgIHRoaXMuX21lc3NhZ2VzLm9uTmV4dChidXN5KTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fbWVzc2FnZXMub25OZXh0KGRvbmUpO1xuICAgIH0pO1xuICB9XG5cbiAgX25leHRNZXNzYWdlUGFpcihtZXNzYWdlOiBzdHJpbmcpOiB7YnVzeTogQnVzeVNpZ25hbE1lc3NhZ2U7IGRvbmU6IEJ1c3lTaWduYWxNZXNzYWdlfSB7XG4gICAgY29uc3QgYnVzeSA9IHtcbiAgICAgIHN0YXR1czogJ2J1c3knLFxuICAgICAgaWQ6IHRoaXMuX25leHRJZCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgfTtcbiAgICBjb25zdCBkb25lID0ge1xuICAgICAgc3RhdHVzOiAnZG9uZScsXG4gICAgICBpZDogdGhpcy5fbmV4dElkLFxuICAgIH07XG4gICAgdGhpcy5fbmV4dElkKys7XG4gICAgcmV0dXJuIHtidXN5LCBkb25lfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoZXMgYSAnYnVzeScgbWVzc2FnZSB3aXRoIHRoZSBnaXZlbiBzdHJpbmcuIE1hcmtzIGl0IGFzIGRvbmUgd2hlbiB0aGVcbiAgICogcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgZ2l2ZW4gZnVuY3Rpb24gaXMgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQuXG4gICAqXG4gICAqIFVzZWQgdG8gaW5kaWNhdGUgdGhhdCBzb21lIHdvcmsgaXMgb25nb2luZyB3aGlsZSB0aGUgZ2l2ZW4gYXN5bmNocm9ub3VzXG4gICAqIGZ1bmN0aW9uIGV4ZWN1dGVzLlxuICAgKi9cbiAgcmVwb3J0QnVzeTxUPihtZXNzYWdlOiBzdHJpbmcsIGY6ICgpID0+IFByb21pc2U8VD4sIG9wdGlvbnM/OiBNZXNzYWdlRGlzcGxheU9wdGlvbnMpOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBtZXNzYWdlUmVtb3ZlciA9IHRoaXMuZGlzcGxheU1lc3NhZ2UobWVzc2FnZSwgb3B0aW9ucyk7XG4gICAgY29uc3QgcmVtb3ZlTWVzc2FnZSA9IG1lc3NhZ2VSZW1vdmVyLmRpc3Bvc2UuYmluZChtZXNzYWdlUmVtb3Zlcik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldHVyblZhbHVlID0gZigpO1xuICAgICAgaW52YXJpYW50KGlzUHJvbWlzZShyZXR1cm5WYWx1ZSkpO1xuICAgICAgcmV0dXJuVmFsdWUudGhlbihyZW1vdmVNZXNzYWdlLCByZW1vdmVNZXNzYWdlKTtcbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZW1vdmVNZXNzYWdlKCk7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxufVxuIl19