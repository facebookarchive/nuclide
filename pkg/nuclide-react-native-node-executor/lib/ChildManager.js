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

var _reactivexRxjs = require('@reactivex/rxjs');

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
    this._rnRequests = new _reactivexRxjs.Subject();
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
      this._executorSubscription.unsubscribe();
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

      this._rnRequests.next(request);
    }
  }]);

  return ChildManager;
})();

exports['default'] = ChildManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoaWxkTWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2lDQWtCZ0MscUJBQXFCOzs2QkFDbkIsaUJBQWlCOztBQUVuRCxJQUFJLE1BQU0sWUFBQSxDQUFDO0FBQ1gsU0FBUyxTQUFTLEdBQUc7QUFDbkIsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sR0FBRyxPQUFPLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztHQUN2RDtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7O0lBRW9CLFlBQVk7QUFTcEIsV0FUUSxZQUFZLENBU25CLE9BQTRCLEVBQUUsT0FBcUIsRUFBRTswQkFUOUMsWUFBWTs7QUFVN0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFDeEIsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFDeEIsUUFBSSxDQUFDLFdBQVcsR0FBRyw0QkFBYSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxrQkFBa0IsR0FBRywwQ0FBa0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0dBQy9EOztlQWRrQixZQUFZOztXQWdCbkIsd0JBQVM7OztBQUNuQixVQUFJLElBQUksQ0FBQyxxQkFBcUIsSUFBSSxJQUFJLEVBQUU7QUFDdEMsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ3pFLGdCQUFRLFFBQVEsQ0FBQyxJQUFJO0FBQ25CLGVBQUssUUFBUTtBQUNYLGtCQUFLLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqRCxtQkFBTztBQUFBLEFBQ1QsZUFBSyxPQUFPO0FBQ1YscUJBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsbUJBQU87QUFBQSxBQUNULGVBQUssS0FBSztBQUNSLGtCQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVELG1CQUFPO0FBQUEsU0FDVjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFUSxxQkFBUztBQUNoQixVQUFJLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFO0FBQy9CLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUN6QyxVQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0tBQ25DOzs7V0FFWSx1QkFBQyxPQUFrQixFQUFRO0FBQ3RDLFVBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTs7QUFFbkIsZUFBTztPQUNSOzs7QUFHRCxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7O0FBRXBCLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ2hDOzs7U0F0RGtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6IkNoaWxkTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUm5SZXF1ZXN0LFxuICBFeGVjdXRvclJlc3BvbnNlLFxuICBTZXJ2ZXJSZXBseUNhbGxiYWNrLFxufSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCB7ZXhlY3V0ZVJuUmVxdWVzdHN9IGZyb20gJy4vZXhlY3V0ZVJuUmVxdWVzdHMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5sZXQgbG9nZ2VyO1xuZnVuY3Rpb24gZ2V0TG9nZ2VyKCkge1xuICBpZiAoIWxvZ2dlcikge1xuICAgIGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoaWxkTWFuYWdlciB7XG5cbiAgX29uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2s7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG5cbiAgX2V4ZWN1dG9yU3Vic2NyaXB0aW9uOiA/cngkSVN1YnNjcmlwdGlvbjtcbiAgX2V4ZWN1dG9yUmVzcG9uc2VzOiBPYnNlcnZhYmxlPEV4ZWN1dG9yUmVzcG9uc2U+O1xuICBfcm5SZXF1ZXN0czogU3ViamVjdDxSblJlcXVlc3Q+O1xuXG4gIGNvbnN0cnVjdG9yKG9uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2ssIGVtaXR0ZXI6IEV2ZW50RW1pdHRlcikge1xuICAgIHRoaXMuX29uUmVwbHkgPSBvblJlcGx5O1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBlbWl0dGVyO1xuICAgIHRoaXMuX3JuUmVxdWVzdHMgPSBuZXcgU3ViamVjdCgpO1xuICAgIHRoaXMuX2V4ZWN1dG9yUmVzcG9uc2VzID0gZXhlY3V0ZVJuUmVxdWVzdHModGhpcy5fcm5SZXF1ZXN0cyk7XG4gIH1cblxuICBfY3JlYXRlQ2hpbGQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2V4ZWN1dG9yU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9leGVjdXRvclN1YnNjcmlwdGlvbiA9IHRoaXMuX2V4ZWN1dG9yUmVzcG9uc2VzLnN1YnNjcmliZShyZXNwb25zZSA9PiB7XG4gICAgICBzd2l0Y2ggKHJlc3BvbnNlLmtpbmQpIHtcbiAgICAgICAgY2FzZSAncmVzdWx0JzpcbiAgICAgICAgICB0aGlzLl9vblJlcGx5KHJlc3BvbnNlLnJlcGx5SWQsIHJlc3BvbnNlLnJlc3VsdCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IocmVzcG9uc2UubWVzc2FnZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBjYXNlICdwaWQnOlxuICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCByZXNwb25zZS5waWQpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGtpbGxDaGlsZCgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX2V4ZWN1dG9yU3Vic2NyaXB0aW9uKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2V4ZWN1dG9yU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fZXhlY3V0b3JTdWJzY3JpcHRpb24gPSBudWxsO1xuICB9XG5cbiAgaGFuZGxlTWVzc2FnZShyZXF1ZXN0OiBSblJlcXVlc3QpOiB2b2lkIHtcbiAgICBpZiAocmVxdWVzdC5yZXBseUlEKSB7XG4gICAgICAvLyBnZXR0aW5nIGNyb3NzLXRhbGsgZnJvbSBhbm90aGVyIGV4ZWN1dG9yIChwcm9iYWJseSBDaHJvbWUpXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYSB3b3JrZXIgdG8gcnVuIHRoZSBKUy5cbiAgICB0aGlzLl9jcmVhdGVDaGlsZCgpO1xuXG4gICAgdGhpcy5fcm5SZXF1ZXN0cy5uZXh0KHJlcXVlc3QpO1xuICB9XG5cbn1cbiJdfQ==