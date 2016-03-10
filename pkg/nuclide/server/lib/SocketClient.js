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

var _config = require('./config');

var _serviceframework = require('./serviceframework');

var _serviceframework2 = _interopRequireDefault(_serviceframework);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();

// Server side analog to (parts of) NuclideSocket
// Handles JSON messaging and reconnect.

var SocketClient = (function () {
  function SocketClient(clientId, serverComponent, socket) {
    _classCallCheck(this, SocketClient);

    this.id = clientId;
    this._socket = null;
    this._messageQueue = [];
    this._serverComponent = serverComponent;
    this._connect(socket);
  }

  _createClass(SocketClient, [{
    key: '_connect',
    value: function _connect(socket) {
      var _this = this;

      logger.info('Client #%s connecting with a new socket!', this.id);
      (0, _assert2['default'])(this._socket == null);
      this._socket = socket;
      socket.on('message', function (message) {
        return _this._onSocketMessage(message);
      });

      socket.on('close', function () {
        if (_this._socket != null) {
          // This can occur on a reconnect, where the old socket has been closed
          // but its close event is sent asynchronously.
          if (_this._socket === socket) {
            _this._socket = null;
          }
          logger.info('Client #%s closing a socket!', _this.id);
        }
      });
    }
  }, {
    key: 'reconnect',
    value: function reconnect(socket) {
      var _this2 = this;

      this._close();
      this._connect(socket);
      var queuedMessages = this._messageQueue;
      this._messageQueue = [];
      queuedMessages.forEach(function (message) {
        return _this2.sendSocketMessage(message.data);
      });
    }
  }, {
    key: '_close',
    value: function _close() {
      if (this._socket != null) {
        this._socket.close();
        // In certain (Error) conditions socket.close may not emit the on close
        // event synchronously.
        this._socket = null;
      }
    }
  }, {
    key: '_onSocketMessage',
    value: function _onSocketMessage(message) {
      var parsedMessage = JSON.parse(message);
      (0, _assert2['default'])(parsedMessage.protocol && parsedMessage.protocol === _config.SERVICE_FRAMEWORK3_CHANNEL);
      this._serverComponent.handleMessage(this, parsedMessage);
    }
  }, {
    key: 'sendSocketMessage',
    value: function sendSocketMessage(data) {
      var _this3 = this;

      // Wrap the data in an object, because if `data` is a primitive data type,
      // finding it in an array would return the first matching item, not necessarily
      // the same inserted item.
      var message = { data: data };
      this._messageQueue.push(message);
      var socket = this._socket;
      if (socket == null) {
        return;
      }
      socket.send(JSON.stringify(data), function (err) {
        if (err) {
          logger.warn('Failed sending socket message to client:', _this3.id, data);
        } else {
          var messageIndex = _this3._messageQueue.indexOf(message);
          if (messageIndex !== -1) {
            _this3._messageQueue.splice(messageIndex, 1);
          }
        }
      });
    }
  }]);

  return SocketClient;
})();

exports.SocketClient = SocketClient;
//# sourceMappingURL=data:application/json;base64,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LGVBQU87T0FDUjtBQUNELFlBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxVQUFBLEdBQUcsRUFBSTtBQUN2QyxZQUFJLEdBQUcsRUFBRTtBQUNQLGdCQUFNLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxFQUFFLE9BQUssRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hFLE1BQU07QUFDTCxjQUFNLFlBQVksR0FBRyxPQUFLLGFBQWEsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDekQsY0FBSSxZQUFZLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdkIsbUJBQUssYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUM7V0FDNUM7U0FDRjtPQUNGLENBQUMsQ0FBQztLQUNKOzs7U0EvRVUsWUFBWSIsImZpbGUiOiJTb2NrZXRDbGllbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1NFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgU2VydmljZUZyYW1ld29yayBmcm9tICcuL3NlcnZpY2VmcmFtZXdvcmsnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuLy8gU2VydmVyIHNpZGUgYW5hbG9nIHRvIChwYXJ0cyBvZikgTnVjbGlkZVNvY2tldFxuLy8gSGFuZGxlcyBKU09OIG1lc3NhZ2luZyBhbmQgcmVjb25uZWN0LlxuZXhwb3J0IGNsYXNzIFNvY2tldENsaWVudCB7XG4gIGlkOiBzdHJpbmc7XG4gIF9zb2NrZXQ6ID93cyRXZWJTb2NrZXQ7XG4gIF9tZXNzYWdlUXVldWU6IEFycmF5PHtkYXRhOiBzdHJpbmd9PjtcbiAgX3NlcnZlckNvbXBvbmVudDogU2VydmljZUZyYW1ld29yay5TZXJ2ZXJDb21wb25lbnQ7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBjbGllbnRJZDogc3RyaW5nLFxuICAgICAgc2VydmVyQ29tcG9uZW50OiBTZXJ2aWNlRnJhbWV3b3JrLlNlcnZlckNvbXBvbmVudCxcbiAgICAgIHNvY2tldDogd3MkV2ViU29ja2V0KSB7XG4gICAgdGhpcy5pZCA9IGNsaWVudElkO1xuICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgdGhpcy5fbWVzc2FnZVF1ZXVlID0gW107XG4gICAgdGhpcy5fc2VydmVyQ29tcG9uZW50ID0gc2VydmVyQ29tcG9uZW50O1xuICAgIHRoaXMuX2Nvbm5lY3Qoc29ja2V0KTtcbiAgfVxuXG4gIF9jb25uZWN0KHNvY2tldDogd3MkV2ViU29ja2V0KTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oJ0NsaWVudCAjJXMgY29ubmVjdGluZyB3aXRoIGEgbmV3IHNvY2tldCEnLCB0aGlzLmlkKTtcbiAgICBpbnZhcmlhbnQodGhpcy5fc29ja2V0ID09IG51bGwpO1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICBzb2NrZXQub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHRoaXMuX29uU29ja2V0TWVzc2FnZShtZXNzYWdlKSk7XG5cbiAgICBzb2NrZXQub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuX3NvY2tldCAhPSBudWxsKSB7XG4gICAgICAgIC8vIFRoaXMgY2FuIG9jY3VyIG9uIGEgcmVjb25uZWN0LCB3aGVyZSB0aGUgb2xkIHNvY2tldCBoYXMgYmVlbiBjbG9zZWRcbiAgICAgICAgLy8gYnV0IGl0cyBjbG9zZSBldmVudCBpcyBzZW50IGFzeW5jaHJvbm91c2x5LlxuICAgICAgICBpZiAodGhpcy5fc29ja2V0ID09PSBzb2NrZXQpIHtcbiAgICAgICAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDbGllbnQgIyVzIGNsb3NpbmcgYSBzb2NrZXQhJywgdGhpcy5pZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZWNvbm5lY3Qoc29ja2V0OiB3cyRXZWJTb2NrZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZSgpO1xuICAgIHRoaXMuX2Nvbm5lY3Qoc29ja2V0KTtcbiAgICBjb25zdCBxdWV1ZWRNZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VRdWV1ZTtcbiAgICB0aGlzLl9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICBxdWV1ZWRNZXNzYWdlcy5cbiAgICAgICAgZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuc2VuZFNvY2tldE1lc3NhZ2UobWVzc2FnZS5kYXRhKSk7XG4gIH1cblxuICBfY2xvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3NvY2tldCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgICAgIC8vIEluIGNlcnRhaW4gKEVycm9yKSBjb25kaXRpb25zIHNvY2tldC5jbG9zZSBtYXkgbm90IGVtaXQgdGhlIG9uIGNsb3NlXG4gICAgICAvLyBldmVudCBzeW5jaHJvbm91c2x5LlxuICAgICAgdGhpcy5fc29ja2V0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHBhcnNlZE1lc3NhZ2U6IE9iamVjdCA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgaW52YXJpYW50KHBhcnNlZE1lc3NhZ2UucHJvdG9jb2wgJiYgcGFyc2VkTWVzc2FnZS5wcm90b2NvbCA9PT0gU0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUwpO1xuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudC5oYW5kbGVNZXNzYWdlKHRoaXMsIHBhcnNlZE1lc3NhZ2UpO1xuICB9XG5cbiAgc2VuZFNvY2tldE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgLy8gV3JhcCB0aGUgZGF0YSBpbiBhbiBvYmplY3QsIGJlY2F1c2UgaWYgYGRhdGFgIGlzIGEgcHJpbWl0aXZlIGRhdGEgdHlwZSxcbiAgICAvLyBmaW5kaW5nIGl0IGluIGFuIGFycmF5IHdvdWxkIHJldHVybiB0aGUgZmlyc3QgbWF0Y2hpbmcgaXRlbSwgbm90IG5lY2Vzc2FyaWx5XG4gICAgLy8gdGhlIHNhbWUgaW5zZXJ0ZWQgaXRlbS5cbiAgICBjb25zdCBtZXNzYWdlID0ge2RhdGF9O1xuICAgIHRoaXMuX21lc3NhZ2VRdWV1ZS5wdXNoKG1lc3NhZ2UpO1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICBpZiAoc29ja2V0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSksIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdGYWlsZWQgc2VuZGluZyBzb2NrZXQgbWVzc2FnZSB0byBjbGllbnQ6JywgdGhpcy5pZCwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBtZXNzYWdlSW5kZXggPSB0aGlzLl9tZXNzYWdlUXVldWUuaW5kZXhPZihtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9tZXNzYWdlUXVldWUuc3BsaWNlKG1lc3NhZ2VJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19