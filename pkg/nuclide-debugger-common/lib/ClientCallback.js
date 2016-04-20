Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactivexRxjs = require('@reactivex/rxjs');

var ClientCallback = (function () {
  // For user visible output messages.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _reactivexRxjs.Subject();
    this._userOutputObservable = new _reactivexRxjs.Subject();
  }

  _createClass(ClientCallback, [{
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._serverMessageObservable;
    }
  }, {
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      return this._userOutputObservable;
    }
  }, {
    key: 'sendChromeMessage',
    value: function sendChromeMessage(message) {
      this._serverMessageObservable.next(message);
    }
  }, {
    key: 'sendUserOutputMessage',
    value: function sendUserOutputMessage(message) {
      this._userOutputObservable.next(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._serverMessageObservable.complete();
      this._userOutputObservable.complete();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
// For server messages.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudENhbGxiYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7NkJBV2tDLGlCQUFpQjs7SUFFdEMsY0FBYzs7O0FBSWQsV0FKQSxjQUFjLEdBSVg7MEJBSkgsY0FBYzs7QUFLdkIsUUFBSSxDQUFDLHdCQUF3QixHQUFHLDRCQUFhLENBQUM7QUFDOUMsUUFBSSxDQUFDLHFCQUFxQixHQUFHLDRCQUFhLENBQUM7R0FDNUM7O2VBUFUsY0FBYzs7V0FTQyxzQ0FBdUI7QUFDL0MsYUFBTyxJQUFJLENBQUMsd0JBQXdCLENBQUM7S0FDdEM7OztXQUV3QixxQ0FBdUI7QUFDOUMsYUFBTyxJQUFJLENBQUMscUJBQXFCLENBQUM7S0FDbkM7OztXQUVnQiwyQkFBQyxPQUFlLEVBQVE7QUFDdkMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM3Qzs7O1dBRW9CLCtCQUFDLE9BQWUsRUFBUTtBQUMzQyxVQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQzFDOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN6QyxVQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7OztTQTVCVSxjQUFjIiwiZmlsZSI6IkNsaWVudENhbGxiYWNrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5leHBvcnQgY2xhc3MgQ2xpZW50Q2FsbGJhY2sge1xuICBfc2VydmVyTWVzc2FnZU9ic2VydmFibGU6IFN1YmplY3Q7ICAvLyBGb3Igc2VydmVyIG1lc3NhZ2VzLlxuICBfdXNlck91dHB1dE9ic2VydmFibGU6IFN1YmplY3Q7ICAgICAvLyBGb3IgdXNlciB2aXNpYmxlIG91dHB1dCBtZXNzYWdlcy5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5fdXNlck91dHB1dE9ic2VydmFibGUgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGU7XG4gIH1cblxuICBnZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZXJPdXRwdXRPYnNlcnZhYmxlO1xuICB9XG5cbiAgc2VuZENocm9tZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGUubmV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIHNlbmRVc2VyT3V0cHV0TWVzc2FnZShtZXNzYWdlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl91c2VyT3V0cHV0T2JzZXJ2YWJsZS5uZXh0KG1lc3NhZ2UpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZS5jb21wbGV0ZSgpO1xuICAgIHRoaXMuX3VzZXJPdXRwdXRPYnNlcnZhYmxlLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==