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

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

/**
 * A utility for writing packages that tail log sources. Just give it a cold observable and let it
 * handle the rest.
 */

var LogTailer = (function () {
  function LogTailer(input$, eventNames) {
    _classCallCheck(this, LogTailer);

    this._input$ = input$;
    this._eventNames = eventNames;
    this._message$ = new _rx2['default'].Subject();
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

      if (this._disposables != null) {
        this._disposables.dispose();
      }

      this._disposables = new _atom.CompositeDisposable(this._input$.subscribe(function (message) {
        _this._message$.onNext(message);
      }, function (err) {
        _this._stop(false);
        (0, _nuclideAnalytics.track)(_this._eventNames.error, { message: err.message });
      }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZ1RhaWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBYW9CLHlCQUF5Qjs7b0JBQ1gsTUFBTTs7a0JBQ3pCLElBQUk7Ozs7Ozs7OztJQWFOLFNBQVM7QUFPVCxXQVBBLFNBQVMsQ0FPUixNQUE4QixFQUFFLFVBQXNCLEVBQUU7MEJBUHpELFNBQVM7O0FBUWxCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxnQkFBRyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztHQUN2Qjs7ZUFaVSxTQUFTOztXQWNmLGlCQUFTO0FBQ1osVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVHLGdCQUFTO0FBQ1gsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVNLG1CQUFTO0FBQ2QsbUNBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7OztXQUVLLGtCQUFrQzs7O1VBQWpDLFNBQWtCLHlEQUFHLElBQUk7O0FBQzlCLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDOztBQUVuRixVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsZUFBTztPQUNSO0FBQ0QsVUFBSSxTQUFTLEVBQUU7QUFDYixxQ0FBTSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQy9COztBQUVELFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVyQixVQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDN0I7O0FBRUQsVUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FDVCxTQUFTLENBQ1IsVUFBQSxPQUFPLEVBQUk7QUFBRSxjQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7T0FBRSxFQUM5QyxVQUFBLEdBQUcsRUFBSTtBQUNMLGNBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLHFDQUFNLE1BQUssV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztPQUN2RCxDQUNGLENBQ0osQ0FBQztLQUNIOzs7V0FFSSxpQkFBa0M7VUFBakMsU0FBa0IseURBQUcsSUFBSTs7QUFDN0IsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsZUFBTztPQUNSO0FBQ0QsVUFBSSxTQUFTLEVBQUU7QUFDYixxQ0FBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlCOztBQUVELFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDOztBQUV0QixVQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDN0I7S0FDRjs7O1dBRVUsdUJBQTJCO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUN0Qzs7O1NBekVVLFNBQVMiLCJmaWxlIjoiTG9nVGFpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge01lc3NhZ2V9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxudHlwZSBFdmVudE5hbWVzID0ge1xuICBzdGFydDogc3RyaW5nO1xuICBzdG9wOiBzdHJpbmc7XG4gIHJlc3RhcnQ6IHN0cmluZztcbiAgZXJyb3I6IHN0cmluZztcbn07XG5cbi8qKlxuICogQSB1dGlsaXR5IGZvciB3cml0aW5nIHBhY2thZ2VzIHRoYXQgdGFpbCBsb2cgc291cmNlcy4gSnVzdCBnaXZlIGl0IGEgY29sZCBvYnNlcnZhYmxlIGFuZCBsZXQgaXRcbiAqIGhhbmRsZSB0aGUgcmVzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIExvZ1RhaWxlciB7XG4gIF9ldmVudE5hbWVzOiBFdmVudE5hbWVzO1xuICBfZGlzcG9zYWJsZXM6ID9JRGlzcG9zYWJsZTtcbiAgX2lucHV0JDogUnguT2JzZXJ2YWJsZTxNZXNzYWdlPjtcbiAgX21lc3NhZ2UkOiBSeC5TdWJqZWN0PE1lc3NhZ2U+O1xuICBfcnVubmluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihpbnB1dCQ6IFJ4Lk9ic2VydmFibGU8TWVzc2FnZT4sIGV2ZW50TmFtZXM6IEV2ZW50TmFtZXMpIHtcbiAgICB0aGlzLl9pbnB1dCQgPSBpbnB1dCQ7XG4gICAgdGhpcy5fZXZlbnROYW1lcyA9IGV2ZW50TmFtZXM7XG4gICAgdGhpcy5fbWVzc2FnZSQgPSBuZXcgUnguU3ViamVjdCgpO1xuICAgIHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcbiAgfVxuXG4gIHN0YXJ0KCk6IHZvaWQge1xuICAgIHRoaXMuX3N0YXJ0KCk7XG4gIH1cblxuICBzdG9wKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0b3AoKTtcbiAgfVxuXG4gIHJlc3RhcnQoKTogdm9pZCB7XG4gICAgdHJhY2sodGhpcy5fZXZlbnROYW1lcy5yZXN0YXJ0KTtcbiAgICB0aGlzLl9zdG9wKGZhbHNlKTtcbiAgICB0aGlzLl9zdGFydChmYWxzZSk7XG4gIH1cblxuICBfc3RhcnQodHJhY2tDYWxsOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ251Y2xpZGUtY29uc29sZTpzaG93Jyk7XG5cbiAgICBpZiAodGhpcy5fcnVubmluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHJhY2tDYWxsKSB7XG4gICAgICB0cmFjayh0aGlzLl9ldmVudE5hbWVzLnN0YXJ0KTtcbiAgICB9XG5cbiAgICB0aGlzLl9ydW5uaW5nID0gdHJ1ZTtcblxuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX2lucHV0JFxuICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgIG1lc3NhZ2UgPT4geyB0aGlzLl9tZXNzYWdlJC5vbk5leHQobWVzc2FnZSk7IH0sXG4gICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3AoZmFsc2UpO1xuICAgICAgICAgICAgdHJhY2sodGhpcy5fZXZlbnROYW1lcy5lcnJvciwge21lc3NhZ2U6IGVyci5tZXNzYWdlfSk7XG4gICAgICAgICAgfVxuICAgICAgICApLFxuICAgICk7XG4gIH1cblxuICBfc3RvcCh0cmFja0NhbGw6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9ydW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0cmFja0NhbGwpIHtcbiAgICAgIHRyYWNrKHRoaXMuX2V2ZW50TmFtZXMuc3RvcCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXRNZXNzYWdlcygpOiBSeC5PYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZSQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxufVxuIl19