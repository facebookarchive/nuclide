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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _executeRnRequests = require('./executeRnRequests');

var _rx = require('rx');

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

var ChildManager = (function () {
  function ChildManager(onReply, emitter) {
    _classCallCheck(this, ChildManager);

    this._onReply = onReply;
    this._emitter = emitter;
    this._rnRequests = new _rx.Subject();
    this._executorResponses = (0, _executeRnRequests.executeRnRequests)(this._rnRequests);
  }

  _createClass(ChildManager, [{
    key: '_createChild',
    value: function _createChild() {
      var _this = this;

      if (this._executorSubscription != null) {
        return;
      }

      this._executorSubscription = this._executorResponses.subscribe(function (response) {
        switch (response.kind) {
          case 'result':
            _this._onReply(response.replyId, response.result);
            return;
          case 'error':
            getLogger().error(response.message);
            return;
          case 'pid':
            _this._emitter.emit('eval_application_script', response.pid);
            return;
        }
      });
    }
  }, {
    key: 'killChild',
    value: function killChild() {
      if (!this._executorSubscription) {
        return;
      }
      this._executorSubscription.dispose();
      this._executorSubscription = null;
    }
  }, {
    key: 'handleMessage',
    value: function handleMessage(request) {
      if (request.replyID) {
        // getting cross-talk from another executor (probably Chrome)
        return;
      }

      // Make sure we have a worker to run the JS.
      this._createChild();

      this._rnRequests.onNext(request);
    }
  }]);

  return ChildManager;
})();

exports['default'] = ChildManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoaWxkTWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2lDQWtCZ0MscUJBQXFCOztrQkFDbkIsSUFBSTs7QUFFdEMsSUFBSSxNQUFNLFlBQUEsQ0FBQztBQUNYLFNBQVMsU0FBUyxHQUFHO0FBQ25CLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxVQUFNLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7R0FDdkQ7QUFDRCxTQUFPLE1BQU0sQ0FBQztDQUNmOztJQUVvQixZQUFZO0FBU3BCLFdBVFEsWUFBWSxDQVNuQixPQUE0QixFQUFFLE9BQXFCLEVBQUU7MEJBVDlDLFlBQVk7O0FBVTdCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxXQUFXLEdBQUcsaUJBQWEsQ0FBQztBQUNqQyxRQUFJLENBQUMsa0JBQWtCLEdBQUcsMENBQWtCLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMvRDs7ZUFka0IsWUFBWTs7V0FnQm5CLHdCQUFTOzs7QUFDbkIsVUFBSSxJQUFJLENBQUMscUJBQXFCLElBQUksSUFBSSxFQUFFO0FBQ3RDLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxVQUFBLFFBQVEsRUFBSTtBQUN6RSxnQkFBUSxRQUFRLENBQUMsSUFBSTtBQUNuQixlQUFLLFFBQVE7QUFDWCxrQkFBSyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakQsbUJBQU87QUFBQSxBQUNULGVBQUssT0FBTztBQUNWLHFCQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDLG1CQUFPO0FBQUEsQUFDVCxlQUFLLEtBQUs7QUFDUixrQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLHlCQUF5QixFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM1RCxtQkFBTztBQUFBLFNBQ1Y7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRVEscUJBQVM7QUFDaEIsVUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtBQUMvQixlQUFPO09BQ1I7QUFDRCxVQUFJLENBQUMscUJBQXFCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDckMsVUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQztLQUNuQzs7O1dBRVksdUJBQUMsT0FBa0IsRUFBUTtBQUN0QyxVQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7O0FBRW5CLGVBQU87T0FDUjs7O0FBR0QsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDOztBQUVwQixVQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNsQzs7O1NBdERrQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiJDaGlsZE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFJuUmVxdWVzdCxcbiAgRXhlY3V0b3JSZXNwb25zZSxcbiAgU2VydmVyUmVwbHlDYWxsYmFjayxcbn0gZnJvbSAnLi90eXBlcyc7XG5pbXBvcnQgdHlwZSB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuXG5pbXBvcnQge2V4ZWN1dGVSblJlcXVlc3RzfSBmcm9tICcuL2V4ZWN1dGVSblJlcXVlc3RzJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncngnO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoaWxkTWFuYWdlciB7XG5cbiAgX29uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2s7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG5cbiAgX2V4ZWN1dG9yU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9leGVjdXRvclJlc3BvbnNlczogT2JzZXJ2YWJsZTxFeGVjdXRvclJlc3BvbnNlPjtcbiAgX3JuUmVxdWVzdHM6IFN1YmplY3Q8Um5SZXF1ZXN0PjtcblxuICBjb25zdHJ1Y3RvcihvblJlcGx5OiBTZXJ2ZXJSZXBseUNhbGxiYWNrLCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIpIHtcbiAgICB0aGlzLl9vblJlcGx5ID0gb25SZXBseTtcbiAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlcjtcbiAgICB0aGlzLl9yblJlcXVlc3RzID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9leGVjdXRvclJlc3BvbnNlcyA9IGV4ZWN1dGVSblJlcXVlc3RzKHRoaXMuX3JuUmVxdWVzdHMpO1xuICB9XG5cbiAgX2NyZWF0ZUNoaWxkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9leGVjdXRvclN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fZXhlY3V0b3JTdWJzY3JpcHRpb24gPSB0aGlzLl9leGVjdXRvclJlc3BvbnNlcy5zdWJzY3JpYmUocmVzcG9uc2UgPT4ge1xuICAgICAgc3dpdGNoIChyZXNwb25zZS5raW5kKSB7XG4gICAgICAgIGNhc2UgJ3Jlc3VsdCc6XG4gICAgICAgICAgdGhpcy5fb25SZXBseShyZXNwb25zZS5yZXBseUlkLCByZXNwb25zZS5yZXN1bHQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSAnZXJyb3InOlxuICAgICAgICAgIGdldExvZ2dlcigpLmVycm9yKHJlc3BvbnNlLm1lc3NhZ2UpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY2FzZSAncGlkJzpcbiAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2V2YWxfYXBwbGljYXRpb25fc2NyaXB0JywgcmVzcG9uc2UucGlkKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBraWxsQ2hpbGQoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9leGVjdXRvclN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9leGVjdXRvclN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgdGhpcy5fZXhlY3V0b3JTdWJzY3JpcHRpb24gPSBudWxsO1xuICB9XG5cbiAgaGFuZGxlTWVzc2FnZShyZXF1ZXN0OiBSblJlcXVlc3QpOiB2b2lkIHtcbiAgICBpZiAocmVxdWVzdC5yZXBseUlEKSB7XG4gICAgICAvLyBnZXR0aW5nIGNyb3NzLXRhbGsgZnJvbSBhbm90aGVyIGV4ZWN1dG9yIChwcm9iYWJseSBDaHJvbWUpXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYSB3b3JrZXIgdG8gcnVuIHRoZSBKUy5cbiAgICB0aGlzLl9jcmVhdGVDaGlsZCgpO1xuXG4gICAgdGhpcy5fcm5SZXF1ZXN0cy5vbk5leHQocmVxdWVzdCk7XG4gIH1cblxufVxuIl19