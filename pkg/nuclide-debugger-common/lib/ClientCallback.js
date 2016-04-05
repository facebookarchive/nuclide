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

var _rx = require('rx');

var ClientCallback = (function () {
  // For user visible output messages.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _rx.Subject();
    this._userOutputObservable = new _rx.Subject();
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
      this._serverMessageObservable.onNext(message);
    }
  }, {
    key: 'sendUserOutputMessage',
    value: function sendUserOutputMessage(message) {
      this._userOutputObservable.onNext(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._serverMessageObservable.onCompleted();
      this._userOutputObservable.onCompleted();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
// For server messages.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudENhbGxiYWNrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7a0JBV2tDLElBQUk7O0lBRXpCLGNBQWM7OztBQUlkLFdBSkEsY0FBYyxHQUlYOzBCQUpILGNBQWM7O0FBS3ZCLFFBQUksQ0FBQyx3QkFBd0IsR0FBRyxpQkFBYSxDQUFDO0FBQzlDLFFBQUksQ0FBQyxxQkFBcUIsR0FBRyxpQkFBYSxDQUFDO0dBQzVDOztlQVBVLGNBQWM7O1dBU0Msc0NBQXVCO0FBQy9DLGFBQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDO0tBQ3RDOzs7V0FFd0IscUNBQXVCO0FBQzlDLGFBQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDO0tBQ25DOzs7V0FFZ0IsMkJBQUMsT0FBZSxFQUFRO0FBQ3ZDLFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0M7OztXQUVvQiwrQkFBQyxPQUFlLEVBQVE7QUFDM0MsVUFBSSxDQUFDLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM1Qzs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsd0JBQXdCLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDNUMsVUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxDQUFDO0tBQzFDOzs7U0E1QlUsY0FBYyIsImZpbGUiOiJDbGllbnRDYWxsYmFjay5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3ViamVjdH0gZnJvbSAncngnO1xuXG5leHBvcnQgY2xhc3MgQ2xpZW50Q2FsbGJhY2sge1xuICBfc2VydmVyTWVzc2FnZU9ic2VydmFibGU6IFN1YmplY3Q7ICAvLyBGb3Igc2VydmVyIG1lc3NhZ2VzLlxuICBfdXNlck91dHB1dE9ic2VydmFibGU6IFN1YmplY3Q7ICAgICAvLyBGb3IgdXNlciB2aXNpYmxlIG91dHB1dCBtZXNzYWdlcy5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSA9IG5ldyBTdWJqZWN0KCk7XG4gICAgdGhpcy5fdXNlck91dHB1dE9ic2VydmFibGUgPSBuZXcgU3ViamVjdCgpO1xuICB9XG5cbiAgZ2V0U2VydmVyTWVzc2FnZU9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGU7XG4gIH1cblxuICBnZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX3VzZXJPdXRwdXRPYnNlcnZhYmxlO1xuICB9XG5cbiAgc2VuZENocm9tZU1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGUub25OZXh0KG1lc3NhZ2UpO1xuICB9XG5cbiAgc2VuZFVzZXJPdXRwdXRNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3VzZXJPdXRwdXRPYnNlcnZhYmxlLm9uTmV4dChtZXNzYWdlKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGUub25Db21wbGV0ZWQoKTtcbiAgICB0aGlzLl91c2VyT3V0cHV0T2JzZXJ2YWJsZS5vbkNvbXBsZXRlZCgpO1xuICB9XG59XG4iXX0=