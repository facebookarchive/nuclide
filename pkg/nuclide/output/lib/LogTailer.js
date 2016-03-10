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

var _analytics = require('../../analytics');

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
      (0, _analytics.track)(this._eventNames.restart);
      this._stop(false);
      this._start(false);
    }
  }, {
    key: '_start',
    value: function _start() {
      var _this = this;

      var trackCall = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      if (this._running) {
        return;
      }
      if (trackCall) {
        (0, _analytics.track)(this._eventNames.start);
      }

      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-output:show');

      this._running = true;

      if (this._disposables != null) {
        this._disposables.dispose();
      }

      this._disposables = new _atom.CompositeDisposable(this._input$.subscribe(function (message) {
        _this._message$.onNext(message);
      }, function (err) {
        _this._stop(false);
        (0, _analytics.track)(_this._eventNames.error, { message: err.message });
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
        (0, _analytics.track)(this._eventNames.stop);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvZ1RhaWxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBYW9CLGlCQUFpQjs7b0JBQ0gsTUFBTTs7a0JBQ3pCLElBQUk7Ozs7Ozs7OztJQWFOLFNBQVM7QUFPVCxXQVBBLFNBQVMsQ0FPUixNQUE4QixFQUFFLFVBQXNCLEVBQUU7MEJBUHpELFNBQVM7O0FBUWxCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0FBQzlCLFFBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxnQkFBRyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztHQUN2Qjs7ZUFaVSxTQUFTOztXQWNmLGlCQUFTO0FBQ1osVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVHLGdCQUFTO0FBQ1gsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVNLG1CQUFTO0FBQ2QsNEJBQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoQyxVQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEI7OztXQUVLLGtCQUFrQzs7O1VBQWpDLFNBQWtCLHlEQUFHLElBQUk7O0FBQzlCLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixlQUFPO09BQ1I7QUFDRCxVQUFJLFNBQVMsRUFBRTtBQUNiLDhCQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDL0I7O0FBRUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7O0FBRWxGLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUVyQixVQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDN0I7O0FBRUQsVUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIsSUFBSSxDQUFDLE9BQU8sQ0FDVCxTQUFTLENBQ1IsVUFBQSxPQUFPLEVBQUk7QUFBRSxjQUFLLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7T0FBRSxFQUM5QyxVQUFBLEdBQUcsRUFBSTtBQUNMLGNBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xCLDhCQUFNLE1BQUssV0FBVyxDQUFDLEtBQUssRUFBRSxFQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFDLENBQUMsQ0FBQztPQUN2RCxDQUNGLENBQ0osQ0FBQztLQUNIOzs7V0FFSSxpQkFBa0M7VUFBakMsU0FBa0IseURBQUcsSUFBSTs7QUFDN0IsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDbEIsZUFBTztPQUNSO0FBQ0QsVUFBSSxTQUFTLEVBQUU7QUFDYiw4QkFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlCOztBQUVELFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDOztBQUV0QixVQUFJLElBQUksQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO0FBQzdCLFlBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDN0I7S0FDRjs7O1dBRVUsdUJBQTJCO0FBQ3BDLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQUN0Qzs7O1NBekVVLFNBQVMiLCJmaWxlIjoiTG9nVGFpbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge01lc3NhZ2V9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbnR5cGUgRXZlbnROYW1lcyA9IHtcbiAgc3RhcnQ6IHN0cmluZztcbiAgc3RvcDogc3RyaW5nO1xuICByZXN0YXJ0OiBzdHJpbmc7XG4gIGVycm9yOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEEgdXRpbGl0eSBmb3Igd3JpdGluZyBwYWNrYWdlcyB0aGF0IHRhaWwgbG9nIHNvdXJjZXMuIEp1c3QgZ2l2ZSBpdCBhIGNvbGQgb2JzZXJ2YWJsZSBhbmQgbGV0IGl0XG4gKiBoYW5kbGUgdGhlIHJlc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBMb2dUYWlsZXIge1xuICBfZXZlbnROYW1lczogRXZlbnROYW1lcztcbiAgX2Rpc3Bvc2FibGVzOiA/SURpc3Bvc2FibGU7XG4gIF9pbnB1dCQ6IFJ4Lk9ic2VydmFibGU8TWVzc2FnZT47XG4gIF9tZXNzYWdlJDogUnguU3ViamVjdDxNZXNzYWdlPjtcbiAgX3J1bm5pbmc6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoaW5wdXQkOiBSeC5PYnNlcnZhYmxlPE1lc3NhZ2U+LCBldmVudE5hbWVzOiBFdmVudE5hbWVzKSB7XG4gICAgdGhpcy5faW5wdXQkID0gaW5wdXQkO1xuICAgIHRoaXMuX2V2ZW50TmFtZXMgPSBldmVudE5hbWVzO1xuICAgIHRoaXMuX21lc3NhZ2UkID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgICB0aGlzLl9ydW5uaW5nID0gZmFsc2U7XG4gIH1cblxuICBzdGFydCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdGFydCgpO1xuICB9XG5cbiAgc3RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9wKCk7XG4gIH1cblxuICByZXN0YXJ0KCk6IHZvaWQge1xuICAgIHRyYWNrKHRoaXMuX2V2ZW50TmFtZXMucmVzdGFydCk7XG4gICAgdGhpcy5fc3RvcChmYWxzZSk7XG4gICAgdGhpcy5fc3RhcnQoZmFsc2UpO1xuICB9XG5cbiAgX3N0YXJ0KHRyYWNrQ2FsbDogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fcnVubmluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodHJhY2tDYWxsKSB7XG4gICAgICB0cmFjayh0aGlzLl9ldmVudE5hbWVzLnN0YXJ0KTtcbiAgICB9XG5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksICdudWNsaWRlLW91dHB1dDpzaG93Jyk7XG5cbiAgICB0aGlzLl9ydW5uaW5nID0gdHJ1ZTtcblxuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlcyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX2lucHV0JFxuICAgICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAgIG1lc3NhZ2UgPT4geyB0aGlzLl9tZXNzYWdlJC5vbk5leHQobWVzc2FnZSk7IH0sXG4gICAgICAgICAgZXJyID0+IHtcbiAgICAgICAgICAgIHRoaXMuX3N0b3AoZmFsc2UpO1xuICAgICAgICAgICAgdHJhY2sodGhpcy5fZXZlbnROYW1lcy5lcnJvciwge21lc3NhZ2U6IGVyci5tZXNzYWdlfSk7XG4gICAgICAgICAgfVxuICAgICAgICApLFxuICAgICk7XG4gIH1cblxuICBfc3RvcCh0cmFja0NhbGw6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9ydW5uaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0cmFja0NhbGwpIHtcbiAgICAgIHRyYWNrKHRoaXMuX2V2ZW50TmFtZXMuc3RvcCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xuXG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXRNZXNzYWdlcygpOiBSeC5PYnNlcnZhYmxlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5fbWVzc2FnZSQuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxufVxuIl19