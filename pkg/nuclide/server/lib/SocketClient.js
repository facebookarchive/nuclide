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
          (0, _assert2['default'])(_this._socket === socket);
          _this._socket = null;
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
        // In Error conditions socket.close may not emit the on close event.
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
//# sourceMappingURL=data:application/json;base64,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QUFPO09BQ1I7QUFDRCxZQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsVUFBQSxHQUFHLEVBQUk7QUFDdkMsWUFBSSxHQUFHLEVBQUU7QUFDUCxnQkFBTSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsRUFBRSxPQUFLLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN4RSxNQUFNO0FBQ0wsY0FBTSxZQUFZLEdBQUcsT0FBSyxhQUFhLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pELGNBQUksWUFBWSxLQUFLLENBQUMsQ0FBQyxFQUFFO0FBQ3ZCLG1CQUFLLGFBQWEsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1dBQzVDO1NBQ0Y7T0FDRixDQUFDLENBQUM7S0FDSjs7O1NBM0VVLFlBQVkiLCJmaWxlIjoiU29ja2V0Q2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtTRVJWSUNFX0ZSQU1FV09SSzNfQ0hBTk5FTH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbi8vIFNlcnZlciBzaWRlIGFuYWxvZyB0byAocGFydHMgb2YpIE51Y2xpZGVTb2NrZXRcbi8vIEhhbmRsZXMgSlNPTiBtZXNzYWdpbmcgYW5kIHJlY29ubmVjdC5cbmV4cG9ydCBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBpZDogc3RyaW5nO1xuICBfc29ja2V0OiA/d3MkV2ViU29ja2V0O1xuICBfbWVzc2FnZVF1ZXVlOiBBcnJheTx7ZGF0YTogc3RyaW5nfT47XG4gIF9zZXJ2ZXJDb21wb25lbnQ6IFNlcnZpY2VGcmFtZXdvcmsuU2VydmVyQ29tcG9uZW50O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgY2xpZW50SWQ6IHN0cmluZyxcbiAgICAgIHNlcnZlckNvbXBvbmVudDogU2VydmljZUZyYW1ld29yay5TZXJ2ZXJDb21wb25lbnQsXG4gICAgICBzb2NrZXQ6IHdzJFdlYlNvY2tldCkge1xuICAgIHRoaXMuaWQgPSBjbGllbnRJZDtcbiAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuICAgIHRoaXMuX21lc3NhZ2VRdWV1ZSA9IFtdO1xuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudCA9IHNlcnZlckNvbXBvbmVudDtcbiAgICB0aGlzLl9jb25uZWN0KHNvY2tldCk7XG4gIH1cblxuICBfY29ubmVjdChzb2NrZXQ6IHdzJFdlYlNvY2tldCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKCdDbGllbnQgIyVzIGNvbm5lY3Rpbmcgd2l0aCBhIG5ldyBzb2NrZXQhJywgdGhpcy5pZCk7XG4gICAgaW52YXJpYW50KHRoaXMuX3NvY2tldCA9PSBudWxsKTtcbiAgICB0aGlzLl9zb2NrZXQgPSBzb2NrZXQ7XG4gICAgc29ja2V0Lm9uKCdtZXNzYWdlJywgbWVzc2FnZSA9PiB0aGlzLl9vblNvY2tldE1lc3NhZ2UobWVzc2FnZSkpO1xuXG4gICAgc29ja2V0Lm9uKCdjbG9zZScsICgpID0+IHtcbiAgICAgIGlmICh0aGlzLl9zb2NrZXQgIT0gbnVsbCkge1xuICAgICAgICBpbnZhcmlhbnQodGhpcy5fc29ja2V0ID09PSBzb2NrZXQpO1xuICAgICAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuICAgICAgICBsb2dnZXIuaW5mbygnQ2xpZW50ICMlcyBjbG9zaW5nIGEgc29ja2V0IScsIHRoaXMuaWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVjb25uZWN0KHNvY2tldDogd3MkV2ViU29ja2V0KTogdm9pZCB7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgICB0aGlzLl9jb25uZWN0KHNvY2tldCk7XG4gICAgY29uc3QgcXVldWVkTWVzc2FnZXMgPSB0aGlzLl9tZXNzYWdlUXVldWU7XG4gICAgdGhpcy5fbWVzc2FnZVF1ZXVlID0gW107XG4gICAgcXVldWVkTWVzc2FnZXMuXG4gICAgICAgIGZvckVhY2gobWVzc2FnZSA9PiB0aGlzLnNlbmRTb2NrZXRNZXNzYWdlKG1lc3NhZ2UuZGF0YSkpO1xuICB9XG5cbiAgX2Nsb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zb2NrZXQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fc29ja2V0LmNsb3NlKCk7XG4gICAgICAvLyBJbiBFcnJvciBjb25kaXRpb25zIHNvY2tldC5jbG9zZSBtYXkgbm90IGVtaXQgdGhlIG9uIGNsb3NlIGV2ZW50LlxuICAgICAgdGhpcy5fc29ja2V0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHBhcnNlZE1lc3NhZ2U6IE9iamVjdCA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgaW52YXJpYW50KHBhcnNlZE1lc3NhZ2UucHJvdG9jb2wgJiYgcGFyc2VkTWVzc2FnZS5wcm90b2NvbCA9PT0gU0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUwpO1xuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudC5oYW5kbGVNZXNzYWdlKHRoaXMsIHBhcnNlZE1lc3NhZ2UpO1xuICB9XG5cbiAgc2VuZFNvY2tldE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgLy8gV3JhcCB0aGUgZGF0YSBpbiBhbiBvYmplY3QsIGJlY2F1c2UgaWYgYGRhdGFgIGlzIGEgcHJpbWl0aXZlIGRhdGEgdHlwZSxcbiAgICAvLyBmaW5kaW5nIGl0IGluIGFuIGFycmF5IHdvdWxkIHJldHVybiB0aGUgZmlyc3QgbWF0Y2hpbmcgaXRlbSwgbm90IG5lY2Vzc2FyaWx5XG4gICAgLy8gdGhlIHNhbWUgaW5zZXJ0ZWQgaXRlbS5cbiAgICBjb25zdCBtZXNzYWdlID0ge2RhdGF9O1xuICAgIHRoaXMuX21lc3NhZ2VRdWV1ZS5wdXNoKG1lc3NhZ2UpO1xuICAgIGNvbnN0IHNvY2tldCA9IHRoaXMuX3NvY2tldDtcbiAgICBpZiAoc29ja2V0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSksIGVyciA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGxvZ2dlci53YXJuKCdGYWlsZWQgc2VuZGluZyBzb2NrZXQgbWVzc2FnZSB0byBjbGllbnQ6JywgdGhpcy5pZCwgZGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBtZXNzYWdlSW5kZXggPSB0aGlzLl9tZXNzYWdlUXVldWUuaW5kZXhPZihtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2VJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICB0aGlzLl9tZXNzYWdlUXVldWUuc3BsaWNlKG1lc3NhZ2VJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuIl19