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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

/**
 * A utility for writing packages that tail log sources. Just give it a cold observable and let it
 * handle the rest.
 */

var LogTailer = (function () {
  function LogTailer(input$, eventNames) {
    _classCallCheck(this, LogTailer);

    this._input$ = input$;
    this._eventNames = eventNames;
    this._message$ = new _reactivexRxjs2['default'].Subject();
    this._running = false;
  }

  _createClass(LogTailer, [{
    key: 'start',
    value: function start() {
      this._start();
    }
  }, {
    key: 'stop',
    value: function stop() {
      this._stop();
    }
  }, {
    key: 'restart',
    value: function restart() {
      (0, _nuclideAnalytics.track)(this._eventNames.restart);
      this._stop(false);
      this._start(false);
    }
  }, {
    key: '_start',
    value: function _start() {
      var _this = this;

      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-console:show');

      if (this._running) {
        return;
      }
      if (trackCall) {
        (0, _nuclideAnalytics.track)(this._eventNames.start);
      }

      this._running = true;

      if (this._subscription != null) {
        this._subscription.unsubscribe();
      }

      this._subscription = this._input$.subscribe(function (message) {
        _this._message$.next(message);
      }, function (err) {
        _this._stop(false);
        (0, _nuclideAnalytics.track)(_this._eventNames.error, { message: err.message });
      });
    }
  }, {
    key: '_stop',
    value: function _stop() {
      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (!this._running) {
        return;
      }
      if (trackCall) {
        (0, _nuclideAnalytics.track)(this._eventNames.stop);
      }

      this._running = false;

      if (this._disposables != null) {
        this._disposables.dispose();
      }
    }
  }, {
    key: 'getMessages',
    value: function getMessages() {
      return this._message$.asObservable();
    }
  }]);

  return LogTailer;
})();

exports.LogTailer = LogTailer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZ1RhaWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBYW9CLHlCQUF5Qjs7NkJBQzlCLGlCQUFpQjs7Ozs7Ozs7O0lBYW5CLFNBQVM7QUFPVCxXQVBBLFNBQVMsQ0FPUixNQUE4QixFQUFFLFVBQXNCLEVBQUU7MEJBUHpELFNBQVM7O0FBUWxCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSwyQkFBRyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztHQUN2Qjs7ZUFaVSxTQUFTOztXQWNmLGlCQUFTO0FBQ1osVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVHLGdCQUFTO0FBQ1gsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVNLG1CQUFTO0FBQ2QsbUNBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7OztXQUVLLGtCQUFrQzs7O1VBQWpDLFNBQWtCLHlEQUFHLElBQUk7O0FBQzlCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOztBQUVuRixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsZUFBTztPQUNSO0FBQ0QsVUFBSSxTQUFTLEVBQUU7QUFDYixxQ0FBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQy9COztBQUVELFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVyQixVQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDbEM7O0FBRUQsVUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FDekMsVUFBQSxPQUFPLEVBQUk7QUFBRSxjQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7T0FBRSxFQUM1QyxVQUFBLEdBQUcsRUFBSTtBQUNMLGNBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLHFDQUFNLE1BQUssV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztPQUN2RCxDQUNGLENBQUM7S0FDSDs7O1dBRUksaUJBQWtDO1VBQWpDLFNBQWtCLHlEQUFHLElBQUk7O0FBQzdCLFVBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2xCLGVBQU87T0FDUjtBQUNELFVBQUksU0FBUyxFQUFFO0FBQ2IscUNBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM5Qjs7QUFFRCxVQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQzs7QUFFdEIsVUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksRUFBRTtBQUM3QixZQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzdCO0tBQ0Y7OztXQUVVLHVCQUEyQjtBQUNwQyxhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDdEM7OztTQXRFVSxTQUFTIiwiZmlsZSI6IkxvZ1RhaWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtNZXNzYWdlfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbnR5cGUgRXZlbnROYW1lcyA9IHtcbiAgc3RhcnQ6IHN0cmluZztcbiAgc3RvcDogc3RyaW5nO1xuICByZXN0YXJ0OiBzdHJpbmc7XG4gIGVycm9yOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgdXRpbGl0eSBmb3Igd3JpdGluZyBwYWNrYWdlcyB0aGF0IHRhaWwgbG9nIHNvdXJjZXMuIEp1c3QgZ2l2ZSBpdCBhIGNvbGQgb2JzZXJ2YWJsZSBhbmQgbGV0IGl0XG4gKiBoYW5kbGUgdGhlIHJlc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dUYWlsZXIge1xuICBfZXZlbnROYW1lczogRXZlbnROYW1lcztcbiAgX3N1YnNjcmlwdGlvbjogP3J4JElTdWJzY3JpcHRpb247XG4gIF9pbnB1dCQ6IFJ4Lk9ic2VydmFibGU8TWVzc2FnZT47XG4gIF9tZXNzYWdlJDogUnguU3ViamVjdDxNZXNzYWdlPjtcbiAgX3J1bm5pbmc6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoaW5wdXQkOiBSeC5PYnNlcnZhYmxlPE1lc3NhZ2U+LCBldmVudE5hbWVzOiBFdmVudE5hbWVzKSB7XG4gICAgdGhpcy5faW5wdXQkID0gaW5wdXQkO1xuICAgIHRoaXMuX2V2ZW50TmFtZXMgPSBldmVudE5hbWVzO1xuICAgIHRoaXMuX21lc3NhZ2UkID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgICB0aGlzLl9ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9wKCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRyYWNrKHRoaXMuX2V2ZW50TmFtZXMucmVzdGFydCk7XG4gICAgdGhpcy5fc3RvcChmYWxzZSk7XG4gICAgdGhpcy5fc3RhcnQoZmFsc2UpO1xuICB9XG5cbiAgX3N0YXJ0KHRyYWNrQ2FsbDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLWNvbnNvbGU6c2hvdycpO1xuXG4gICAgaWYgKHRoaXMuX3J1bm5pbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRyYWNrQ2FsbCkge1xuICAgICAgdHJhY2sodGhpcy5fZXZlbnROYW1lcy5zdGFydCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcnVubmluZyA9IHRydWU7XG5cbiAgICBpZiAodGhpcy5fc3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbiA9IHRoaXMuX2lucHV0JC5zdWJzY3JpYmUoXG4gICAgICBtZXNzYWdlID0+IHsgdGhpcy5fbWVzc2FnZSQubmV4dChtZXNzYWdlKTsgfSxcbiAgICAgIGVyciA9PiB7XG4gICAgICAgIHRoaXMuX3N0b3AoZmFsc2UpO1xuICAgICAgICB0cmFjayh0aGlzLl9ldmVudE5hbWVzLmVycm9yLCB7bWVzc2FnZTogZXJyLm1lc3NhZ2V9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX3N0b3AodHJhY2tDYWxsOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fcnVubmluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHJhY2tDYWxsKSB7XG4gICAgICB0cmFjayh0aGlzLl9ldmVudE5hbWVzLnN0b3ApO1xuICAgIH1cblxuICAgIHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcblxuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVzc2FnZXMoKTogUnguT2JzZXJ2YWJsZTxNZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2UkLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbn1cbiJdfQ==