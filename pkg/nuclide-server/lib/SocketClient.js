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

var _serviceframeworkIndex = require('./serviceframework/index');

var _serviceframeworkIndex2 = _interopRequireDefault(_serviceframeworkIndex);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideLogging = require('../../nuclide-logging');

var logger = (0, _nuclideLogging.getLogger)();

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
//# sourceMappingURL=data:application/json;base64,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bEIsZUFBTztPQUNSO0FBQ0QsWUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQ3ZDLFlBQUksR0FBRyxFQUFFO0FBQ1AsZ0JBQU0sQ0FBQyxJQUFJLENBQUMsMENBQTBDLEVBQUUsT0FBSyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEUsTUFBTTtBQUNMLGNBQU0sWUFBWSxHQUFHLE9BQUssYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN6RCxjQUFJLFlBQVksS0FBSyxDQUFDLENBQUMsRUFBRTtBQUN2QixtQkFBSyxhQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztXQUM1QztTQUNGO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztTQS9FVSxZQUFZIiwiZmlsZSI6IlNvY2tldENsaWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7U0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBTZXJ2aWNlRnJhbWV3b3JrIGZyb20gJy4vc2VydmljZWZyYW1ld29yay9pbmRleCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8vIFNlcnZlciBzaWRlIGFuYWxvZyB0byAocGFydHMgb2YpIE51Y2xpZGVTb2NrZXRcbi8vIEhhbmRsZXMgSlNPTiBtZXNzYWdpbmcgYW5kIHJlY29ubmVjdC5cbmV4cG9ydCBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBpZDogc3RyaW5nO1xuICBfc29ja2V0OiA/d3MkV2ViU29ja2V0O1xuICBfbWVzc2FnZVF1ZXVlOiBBcnJheTx7ZGF0YTogc3RyaW5nfT47XG4gIF9zZXJ2ZXJDb21wb25lbnQ6IFNlcnZpY2VGcmFtZXdvcmsuU2VydmVyQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgY2xpZW50SWQ6IHN0cmluZyxcbiAgICAgIHNlcnZlckNvbXBvbmVudDogU2VydmljZUZyYW1ld29yay5TZXJ2ZXJDb21wb25lbnQsXG4gICAgICBzb2NrZXQ6IHdzJFdlYlNvY2tldCkge1xuICAgIHRoaXMuaWQgPSBjbGllbnRJZDtcbiAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuICAgIHRoaXMuX21lc3NhZ2VRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudCA9IHNlcnZlckNvbXBvbmVudDtcbiAgICB0aGlzLl9jb25uZWN0KHNvY2tldCk7XG4gIH1cblxuICBfY29ubmVjdChzb2NrZXQ6IHdzJFdlYlNvY2tldCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdDbGllbnQgIyVzIGNvbm5lY3Rpbmcgd2l0aCBhIG5ldyBzb2NrZXQhJywgdGhpcy5pZCk7XG4gICAgaW52YXJpYW50KHRoaXMuX3NvY2tldCA9PSBudWxsKTtcbiAgICB0aGlzLl9zb2NrZXQgPSBzb2NrZXQ7XG4gICAgc29ja2V0Lm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB0aGlzLl9vblNvY2tldE1lc3NhZ2UobWVzc2FnZSkpO1xuXG4gICAgc29ja2V0Lm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9zb2NrZXQgIT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIGNhbiBvY2N1ciBvbiBhIHJlY29ubmVjdCwgd2hlcmUgdGhlIG9sZCBzb2NrZXQgaGFzIGJlZW4gY2xvc2VkXG4gICAgICAgIC8vIGJ1dCBpdHMgY2xvc2UgZXZlbnQgaXMgc2VudCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgaWYgKHRoaXMuX3NvY2tldCA9PT0gc29ja2V0KSB7XG4gICAgICAgICAgdGhpcy5fc29ja2V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBsb2dnZXIuaW5mbygnQ2xpZW50ICMlcyBjbG9zaW5nIGEgc29ja2V0IScsIHRoaXMuaWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVjb25uZWN0KHNvY2tldDogd3MkV2ViU29ja2V0KTogdm9pZCB7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgICB0aGlzLl9jb25uZWN0KHNvY2tldCk7XG4gICAgY29uc3QgcXVldWVkTWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlUXVldWU7XG4gICAgdGhpcy5fbWVzc2FnZVF1ZXVlID0gW107XG4gICAgcXVldWVkTWVzc2FnZXMuXG4gICAgICAgIGZvckVhY2gobWVzc2FnZSA9PiB0aGlzLnNlbmRTb2NrZXRNZXNzYWdlKG1lc3NhZ2UuZGF0YSkpO1xuICB9XG5cbiAgX2Nsb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zb2NrZXQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG4gICAgICAvLyBJbiBjZXJ0YWluIChFcnJvcikgY29uZGl0aW9ucyBzb2NrZXQuY2xvc2UgbWF5IG5vdCBlbWl0IHRoZSBvbiBjbG9zZVxuICAgICAgLy8gZXZlbnQgc3luY2hyb25vdXNseS5cbiAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX29uU29ja2V0TWVzc2FnZShtZXNzYWdlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCBwYXJzZWRNZXNzYWdlOiBPYmplY3QgPSBKU09OLnBhcnNlKG1lc3NhZ2UpO1xuICAgIGludmFyaWFudChwYXJzZWRNZXNzYWdlLnByb3RvY29sICYmIHBhcnNlZE1lc3NhZ2UucHJvdG9jb2wgPT09IFNFUlZJQ0VfRlJBTUVXT1JLM19DSEFOTkVMKTtcbiAgICB0aGlzLl9zZXJ2ZXJDb21wb25lbnQuaGFuZGxlTWVzc2FnZSh0aGlzLCBwYXJzZWRNZXNzYWdlKTtcbiAgfVxuXG4gIHNlbmRTb2NrZXRNZXNzYWdlKGRhdGE6IGFueSk6IHZvaWQge1xuICAgIC8vIFdyYXAgdGhlIGRhdGEgaW4gYW4gb2JqZWN0LCBiZWNhdXNlIGlmIGBkYXRhYCBpcyBhIHByaW1pdGl2ZSBkYXRhIHR5cGUsXG4gICAgLy8gZmluZGluZyBpdCBpbiBhbiBhcnJheSB3b3VsZCByZXR1cm4gdGhlIGZpcnN0IG1hdGNoaW5nIGl0ZW0sIG5vdCBuZWNlc3NhcmlseVxuICAgIC8vIHRoZSBzYW1lIGluc2VydGVkIGl0ZW0uXG4gICAgY29uc3QgbWVzc2FnZSA9IHtkYXRhfTtcbiAgICB0aGlzLl9tZXNzYWdlUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpLCBlcnIgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBsb2dnZXIud2FybignRmFpbGVkIHNlbmRpbmcgc29ja2V0IG1lc3NhZ2UgdG8gY2xpZW50OicsIHRoaXMuaWQsIGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUluZGV4ID0gdGhpcy5fbWVzc2FnZVF1ZXVlLmluZGV4T2YobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fbWVzc2FnZVF1ZXVlLnNwbGljZShtZXNzYWdlSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==