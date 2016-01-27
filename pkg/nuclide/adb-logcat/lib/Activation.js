var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../analytics');

var _commons = require('../../commons');

var _createMessageStream = require('./createMessageStream');

var _createMessageStream2 = _interopRequireDefault(_createMessageStream);

var _atom = require('atom');

var _child_process = require('child_process');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    this._message$ = new _rx2['default'].Subject();
    this._disposables = new _atom.CompositeDisposable(atom.commands.add('atom-workspace', {
      'nuclide-adb-logcat:start': function nuclideAdbLogcatStart() {
        return _this._start();
      },
      'nuclide-adb-logcat:stop': function nuclideAdbLogcatStop() {
        return _this._stop();
      },
      'nuclide-adb-logcat:restart': function nuclideAdbLogcatRestart() {
        return _this._restart();
      }
    }));
  }

  _createClass(Activation, [{
    key: '_restart',
    value: function _restart() {
      (0, _analytics.track)('adb-logcat:restart');
      this._stop(false);
      this._start(false);
    }
  }, {
    key: '_start',
    value: function _start(trackCall) {
      var _this2 = this;

      if (trackCall !== false) {
        (0, _analytics.track)('adb-logcat:start');
      }

      this._processKilledByUser = false;
      if (this._processDisposables) {
        this._processDisposables.dispose();
      }

      var output$ = (0, _commons.observeProcess)(spawnAdbLogcat).map(function (event) {
        if (event.kind === 'exit' && !_this2._processKilledByUser) {
          throw new Error('adb logcat exited unexpectedly');
        }
        return event;
      })

      // Only get the text from stdout.
      .filter(function (event) {
        return event.kind === 'stdout';
      }).map(function (event) {
        return event.data && event.data.replace(/\r?\n$/, '');
      })

      // Skip the single historical log. Adb requires us to have at least one (`-T`) but (for now at
      // least) we only want to show live logs. Also, since we're automatically retrying, displaying
      // it would mean users would get an inexplicable old entry.
      .skip(1).retry(3).tapOnError(function () {
        if (_this2._processDisposables) {
          _this2._processDisposables.dispose();
        }

        atom.notifications.addError('adb logcat has crashed 3 times.' + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.');

        (0, _analytics.track)('adb-logcat:crash');
      });

      this._processDisposables = new _atom.CompositeDisposable((0, _createMessageStream2['default'])(output$).subscribe(this._message$));
      this._disposables.add(this._processDisposables);
    }
  }, {
    key: '_stop',
    value: function _stop(trackCall) {
      if (trackCall !== false) {
        (0, _analytics.track)('adb-logcat:stop');
      }

      this._processKilledByUser = true;
      if (this._processDisposables != null) {
        this._processDisposables.dispose();
      }
    }
  }, {
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      return api.registerOutputProvider({
        source: 'adb logcat',
        messages: this._message$.asObservable()
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

function spawnAdbLogcat() {
  // TODO(matthewwithanm): Move the adb path to a setting.
  return (0, _child_process.spawn)('/usr/local/bin/adb', ['logcat', '-v', 'long', '-T', '1']);
}

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,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QUFJLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDcEMsWUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3BDO0tBQ0Y7OztXQUVtQiw4QkFBQyxHQUFrQixFQUFtQjtBQUN4RCxhQUFPLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztBQUNoQyxjQUFNLEVBQUUsWUFBWTtBQUNwQixnQkFBUSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFO09BQ3hDLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQTNGRyxVQUFVOzs7QUE4RmhCLFNBQVMsY0FBYyxHQUErQjs7QUFFcEQsU0FBTywwQkFBTSxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQ3pFOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBPdXRwdXRTZXJ2aWNlIGZyb20gJy4uLy4uL291dHB1dC9saWIvT3V0cHV0U2VydmljZSc7XG5cbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge29ic2VydmVQcm9jZXNzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCBjcmVhdGVNZXNzYWdlU3RyZWFtIGZyb20gJy4vY3JlYXRlTWVzc2FnZVN0cmVhbSc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcHJvY2VzczogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBfcHJvY2Vzc0Rpc3Bvc2FibGVzOiA/YXRvbSRJRGlzcG9zYWJsZTtcbiAgX21lc3NhZ2UkOiBSeC5TdWJqZWN0O1xuICBfcHJvY2Vzc0tpbGxlZEJ5VXNlcjogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX21lc3NhZ2UkID0gbmV3IFJ4LlN1YmplY3QoKTtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnN0YXJ0JzogKCkgPT4gdGhpcy5fc3RhcnQoKSxcbiAgICAgICAgJ251Y2xpZGUtYWRiLWxvZ2NhdDpzdG9wJzogKCkgPT4gdGhpcy5fc3RvcCgpLFxuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnJlc3RhcnQnOiAoKSA9PiB0aGlzLl9yZXN0YXJ0KCksXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgX3Jlc3RhcnQoKTogdm9pZCB7XG4gICAgdHJhY2soJ2FkYi1sb2djYXQ6cmVzdGFydCcpO1xuICAgIHRoaXMuX3N0b3AoZmFsc2UpO1xuICAgIHRoaXMuX3N0YXJ0KGZhbHNlKTtcbiAgfVxuXG4gIF9zdGFydCh0cmFja0NhbGw6ID9ib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRyYWNrQ2FsbCAhPT0gZmFsc2UpIHtcbiAgICAgIHRyYWNrKCdhZGItbG9nY2F0OnN0YXJ0Jyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcHJvY2Vzc0tpbGxlZEJ5VXNlciA9IGZhbHNlO1xuICAgIGlmICh0aGlzLl9wcm9jZXNzRGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0JCA9IG9ic2VydmVQcm9jZXNzKHNwYXduQWRiTG9nY2F0KVxuICAgICAgLm1hcChldmVudCA9PiB7XG4gICAgICAgIGlmIChldmVudC5raW5kID09PSAnZXhpdCcgJiYgIXRoaXMuX3Byb2Nlc3NLaWxsZWRCeVVzZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FkYiBsb2djYXQgZXhpdGVkIHVuZXhwZWN0ZWRseScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH0pXG5cbiAgICAgIC8vIE9ubHkgZ2V0IHRoZSB0ZXh0IGZyb20gc3Rkb3V0LlxuICAgICAgLmZpbHRlcihldmVudCA9PiBldmVudC5raW5kID09PSAnc3Rkb3V0JylcbiAgICAgIC5tYXAoZXZlbnQgPT4gZXZlbnQuZGF0YSAmJiBldmVudC5kYXRhLnJlcGxhY2UoL1xccj9cXG4kLywgJycpKVxuXG4gICAgICAvLyBTa2lwIHRoZSBzaW5nbGUgaGlzdG9yaWNhbCBsb2cuIEFkYiByZXF1aXJlcyB1cyB0byBoYXZlIGF0IGxlYXN0IG9uZSAoYC1UYCkgYnV0IChmb3Igbm93IGF0XG4gICAgICAvLyBsZWFzdCkgd2Ugb25seSB3YW50IHRvIHNob3cgbGl2ZSBsb2dzLiBBbHNvLCBzaW5jZSB3ZSdyZSBhdXRvbWF0aWNhbGx5IHJldHJ5aW5nLCBkaXNwbGF5aW5nXG4gICAgICAvLyBpdCB3b3VsZCBtZWFuIHVzZXJzIHdvdWxkIGdldCBhbiBpbmV4cGxpY2FibGUgb2xkIGVudHJ5LlxuICAgICAgLnNraXAoMSlcblxuICAgICAgLnJldHJ5KDMpXG4gICAgICAudGFwT25FcnJvcigoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9wcm9jZXNzRGlzcG9zYWJsZXMpIHtcbiAgICAgICAgICB0aGlzLl9wcm9jZXNzRGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdhZGIgbG9nY2F0IGhhcyBjcmFzaGVkIDMgdGltZXMuJ1xuICAgICAgICAgICsgJyBZb3UgY2FuIG1hbnVhbGx5IHJlc3RhcnQgaXQgdXNpbmcgdGhlIFwiTnVjbGlkZSBBZGIgTG9nY2F0OiBTdGFydFwiIGNvbW1hbmQuJ1xuICAgICAgICApO1xuXG4gICAgICAgIHRyYWNrKCdhZGItbG9nY2F0OmNyYXNoJyk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX3Byb2Nlc3NEaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgY3JlYXRlTWVzc2FnZVN0cmVhbShvdXRwdXQkKS5zdWJzY3JpYmUodGhpcy5fbWVzc2FnZSQpLFxuICAgICk7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHRoaXMuX3Byb2Nlc3NEaXNwb3NhYmxlcyk7XG4gIH1cblxuICBfc3RvcCh0cmFja0NhbGw6ID9ib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHRyYWNrQ2FsbCAhPT0gZmFsc2UpIHtcbiAgICAgIHRyYWNrKCdhZGItbG9nY2F0OnN0b3AnKTtcbiAgICB9XG5cbiAgICB0aGlzLl9wcm9jZXNzS2lsbGVkQnlVc2VyID0gdHJ1ZTtcbiAgICBpZiAodGhpcy5fcHJvY2Vzc0Rpc3Bvc2FibGVzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Byb2Nlc3NEaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgY29uc3VtZU91dHB1dFNlcnZpY2UoYXBpOiBPdXRwdXRTZXJ2aWNlKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gYXBpLnJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIoe1xuICAgICAgc291cmNlOiAnYWRiIGxvZ2NhdCcsXG4gICAgICBtZXNzYWdlczogdGhpcy5fbWVzc2FnZSQuYXNPYnNlcnZhYmxlKCksXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzcGF3bkFkYkxvZ2NhdCgpOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB7XG4gIC8vIFRPRE8obWF0dGhld3dpdGhhbm0pOiBNb3ZlIHRoZSBhZGIgcGF0aCB0byBhIHNldHRpbmcuXG4gIHJldHVybiBzcGF3bignL3Vzci9sb2NhbC9iaW4vYWRiJywgWydsb2djYXQnLCAnLXYnLCAnbG9uZycsICctVCcsICcxJ10pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=