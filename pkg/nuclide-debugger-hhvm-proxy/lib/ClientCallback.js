Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _reactivexRxjs = require('@reactivex/rxjs');

function createMessage(method, params) {
  var result = { method: method };
  if (params) {
    result.params = params;
  }
  return result;
}

/**
 * This class provides a central callback channel to communicate with debugger client.
 * Currently it provides four callback channels:
 * 1. Chrome server messages.
 * 2. Atom UI notification.
 * 3. Chrome console user messages.
 * 4. Output window messages.
 */

var ClientCallback = (function () {
  // For output window messages.

  function ClientCallback() {
    _classCallCheck(this, ClientCallback);

    this._serverMessageObservable = new _reactivexRxjs.Subject();
    this._notificationObservable = new _reactivexRxjs.Subject();
    this._outputWindowObservable = new _reactivexRxjs.Subject();
  }

  _createClass(ClientCallback, [{
    key: 'getNotificationObservable',
    value: function getNotificationObservable() {
      return this._notificationObservable;
    }
  }, {
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._serverMessageObservable;
    }
  }, {
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      return this._outputWindowObservable;
    }
  }, {
    key: 'sendUserMessage',
    value: function sendUserMessage(type, message) {
      _utils2['default'].log('sendUserMessage(' + type + '): ' + JSON.stringify(message));
      switch (type) {
        case 'notification':
          this._notificationObservable.next({
            type: message.type,
            message: message.message
          });
          break;
        case 'console':
          this.sendMethod(this._serverMessageObservable, 'Console.messageAdded', {
            message: message
          });
          break;
        case 'outputWindow':
          this.sendMethod(this._outputWindowObservable, 'Console.messageAdded', {
            message: message
          });
          break;
        default:
          _utils2['default'].logError('Unknown UserMessageType: ' + type);
      }
    }
  }, {
    key: 'unknownMethod',
    value: function unknownMethod(id, domain, method, params) {
      var message = 'Unknown chrome dev tools method: ' + domain + '.' + method;
      _utils2['default'].log(message);
      this.replyWithError(id, message);
    }
  }, {
    key: 'replyWithError',
    value: function replyWithError(id, error) {
      this.replyToCommand(id, {}, error);
    }
  }, {
    key: 'replyToCommand',
    value: function replyToCommand(id, result, error) {
      var value = { id: id, result: result };
      if (error) {
        value.error = error;
      }
      this._sendJsonObject(this._serverMessageObservable, value);
    }
  }, {
    key: 'sendMethod',
    value: function sendMethod(observable, method, params) {
      this._sendJsonObject(observable, createMessage(method, params));
    }
  }, {
    key: '_sendJsonObject',
    value: function _sendJsonObject(observable, value) {
      var message = JSON.stringify(value);
      _utils2['default'].log('Sending JSON: ' + message);
      observable.next(message);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._notificationObservable.complete();
      this._serverMessageObservable.complete();
      this._outputWindowObservable.complete();
    }
  }]);

  return ClientCallback;
})();

exports.ClientCallback = ClientCallback;
// For server messages.
// For atom UI notifications.
//# sourceMappingURL=data:application/json;base64,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QixFQUFFLE1BQWMsRUFBRSxNQUFlLEVBQUU7QUFDMUUsVUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0tBQ2pFOzs7V0FFYyx5QkFBQyxVQUE4QixFQUFFLEtBQWEsRUFBUTtBQUNuRSxVQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3RDLHlCQUFPLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsQ0FBQztBQUN2QyxBQUFFLGdCQUFVLENBQW1CLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM5Qzs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsdUJBQXVCLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDeEMsVUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3pDLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN6Qzs7O1NBL0VVLGNBQWMiLCJmaWxlIjoiQ2xpZW50Q2FsbGJhY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBTdWJqZWN0fSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG5pbXBvcnQgdHlwZSB7Tm90aWZpY2F0aW9uTWVzc2FnZX0gZnJvbSAnLi4nO1xuXG5leHBvcnQgdHlwZSBVc2VyTWVzc2FnZVR5cGUgPSAnbm90aWZpY2F0aW9uJyB8ICdjb25zb2xlJyB8ICdvdXRwdXRXaW5kb3cnO1xuZXhwb3J0IHR5cGUgTm90aWZpY2F0aW9uVHlwZSA9ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnZmF0YWxFcnJvcic7XG5cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2UobWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IHJlc3VsdDogT2JqZWN0ID0ge21ldGhvZH07XG4gIGlmIChwYXJhbXMpIHtcbiAgICByZXN1bHQucGFyYW1zID0gcGFyYW1zO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogVGhpcyBjbGFzcyBwcm92aWRlcyBhIGNlbnRyYWwgY2FsbGJhY2sgY2hhbm5lbCB0byBjb21tdW5pY2F0ZSB3aXRoIGRlYnVnZ2VyIGNsaWVudC5cbiAqIEN1cnJlbnRseSBpdCBwcm92aWRlcyBmb3VyIGNhbGxiYWNrIGNoYW5uZWxzOlxuICogMS4gQ2hyb21lIHNlcnZlciBtZXNzYWdlcy5cbiAqIDIuIEF0b20gVUkgbm90aWZpY2F0aW9uLlxuICogMy4gQ2hyb21lIGNvbnNvbGUgdXNlciBtZXNzYWdlcy5cbiAqIDQuIE91dHB1dCB3aW5kb3cgbWVzc2FnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnRDYWxsYmFjayB7XG4gIF9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZTogU3ViamVjdDsgIC8vIEZvciBzZXJ2ZXIgbWVzc2FnZXMuXG4gIF9ub3RpZmljYXRpb25PYnNlcnZhYmxlOiBTdWJqZWN0OyAgIC8vIEZvciBhdG9tIFVJIG5vdGlmaWNhdGlvbnMuXG4gIF9vdXRwdXRXaW5kb3dPYnNlcnZhYmxlOiBTdWJqZWN0OyAgIC8vIEZvciBvdXRwdXQgd2luZG93IG1lc3NhZ2VzLlxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9ub3RpZmljYXRpb25PYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgICB0aGlzLl9vdXRwdXRXaW5kb3dPYnNlcnZhYmxlID0gbmV3IFN1YmplY3QoKTtcbiAgfVxuXG4gIGdldE5vdGlmaWNhdGlvbk9ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxOb3RpZmljYXRpb25NZXNzYWdlPiB7XG4gICAgcmV0dXJuIHRoaXMuX25vdGlmaWNhdGlvbk9ic2VydmFibGU7XG4gIH1cblxuICBnZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZTtcbiAgfVxuXG4gIGdldE91dHB1dFdpbmRvd09ic2VydmFibGUoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fb3V0cHV0V2luZG93T2JzZXJ2YWJsZTtcbiAgfVxuXG4gIHNlbmRVc2VyTWVzc2FnZSh0eXBlOiBVc2VyTWVzc2FnZVR5cGUsIG1lc3NhZ2U6IE9iamVjdCk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coYHNlbmRVc2VyTWVzc2FnZSgke3R5cGV9KTogJHtKU09OLnN0cmluZ2lmeShtZXNzYWdlKX1gKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgIGNhc2UgJ25vdGlmaWNhdGlvbic6XG4gICAgICAgIHRoaXMuX25vdGlmaWNhdGlvbk9ic2VydmFibGUubmV4dCh7XG4gICAgICAgICAgdHlwZTogbWVzc2FnZS50eXBlLFxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UubWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29uc29sZSc6XG4gICAgICAgIHRoaXMuc2VuZE1ldGhvZCh0aGlzLl9zZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSwgJ0NvbnNvbGUubWVzc2FnZUFkZGVkJywge1xuICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ291dHB1dFdpbmRvdyc6XG4gICAgICAgIHRoaXMuc2VuZE1ldGhvZCh0aGlzLl9vdXRwdXRXaW5kb3dPYnNlcnZhYmxlLCAnQ29uc29sZS5tZXNzYWdlQWRkZWQnLCB7XG4gICAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbG9nZ2VyLmxvZ0Vycm9yKGBVbmtub3duIFVzZXJNZXNzYWdlVHlwZTogJHt0eXBlfWApO1xuICAgIH1cbiAgfVxuXG4gIHVua25vd25NZXRob2QoaWQ6IG51bWJlciwgZG9tYWluOiBzdHJpbmcsIG1ldGhvZDogc3RyaW5nLCBwYXJhbXM6ID9PYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gJ1Vua25vd24gY2hyb21lIGRldiB0b29scyBtZXRob2Q6ICcgKyBkb21haW4gKyAnLicgKyBtZXRob2Q7XG4gICAgbG9nZ2VyLmxvZyhtZXNzYWdlKTtcbiAgICB0aGlzLnJlcGx5V2l0aEVycm9yKGlkLCBtZXNzYWdlKTtcbiAgfVxuXG4gIHJlcGx5V2l0aEVycm9yKGlkOiBudW1iZXIsIGVycm9yOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnJlcGx5VG9Db21tYW5kKGlkLCB7fSwgZXJyb3IpO1xuICB9XG5cbiAgcmVwbHlUb0NvbW1hbmQoaWQ6IG51bWJlciwgcmVzdWx0OiBPYmplY3QsIGVycm9yOiA/c3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgdmFsdWU6IE9iamVjdCA9IHtpZCwgcmVzdWx0fTtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHZhbHVlLmVycm9yID0gZXJyb3I7XG4gICAgfVxuICAgIHRoaXMuX3NlbmRKc29uT2JqZWN0KHRoaXMuX3NlcnZlck1lc3NhZ2VPYnNlcnZhYmxlLCB2YWx1ZSk7XG4gIH1cblxuICBzZW5kTWV0aG9kKG9ic2VydmFibGU6IE9ic2VydmFibGU8c3RyaW5nPiwgbWV0aG9kOiBzdHJpbmcsIHBhcmFtczogP09iamVjdCkge1xuICAgIHRoaXMuX3NlbmRKc29uT2JqZWN0KG9ic2VydmFibGUsIGNyZWF0ZU1lc3NhZ2UobWV0aG9kLCBwYXJhbXMpKTtcbiAgfVxuXG4gIF9zZW5kSnNvbk9iamVjdChvYnNlcnZhYmxlOiBPYnNlcnZhYmxlPHN0cmluZz4sIHZhbHVlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBjb25zdCBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIGxvZ2dlci5sb2coJ1NlbmRpbmcgSlNPTjogJyArIG1lc3NhZ2UpO1xuICAgICgob2JzZXJ2YWJsZSA6IGFueSkgOiBTdWJqZWN0KS5uZXh0KG1lc3NhZ2UpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9ub3RpZmljYXRpb25PYnNlcnZhYmxlLmNvbXBsZXRlKCk7XG4gICAgdGhpcy5fc2VydmVyTWVzc2FnZU9ic2VydmFibGUuY29tcGxldGUoKTtcbiAgICB0aGlzLl9vdXRwdXRXaW5kb3dPYnNlcnZhYmxlLmNvbXBsZXRlKCk7XG4gIH1cbn1cbiJdfQ==