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

var _serviceframeworkObjectRegistry = require('./serviceframework/ObjectRegistry');

// Server side analog to (parts of) NuclideSocket
// Handles JSON messaging and reconnect.

var logger = (0, _nuclideLogging.getLogger)();

var SocketClient = (function () {
  function SocketClient(clientId, serverComponent, socket) {
    _classCallCheck(this, SocketClient);

    this.id = clientId;
    this._isDisposed = false;
    this._socket = null;
    this._messageQueue = [];
    this._objectRegistry = new _serviceframeworkObjectRegistry.ObjectRegistry();
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
            logger.info('Client #%s socket close recieved on open socket!', _this.id);
          } else {
            logger.info('Client #%s socket close received on orphaned socket!', _this.id);
          }
        } else {
          logger.info('Client #%s recieved socket close on already closed socket!', _this.id);
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
      if (this._isDisposed) {
        logger.error('Received socket message after connection closed', new Error());
        return;
      }

      var parsedMessage = JSON.parse(message);
      (0, _assert2['default'])(parsedMessage.protocol && parsedMessage.protocol === _config.SERVICE_FRAMEWORK3_CHANNEL);
      this._serverComponent.handleMessage(this, parsedMessage);
    }
  }, {
    key: 'sendSocketMessage',
    value: function sendSocketMessage(data) {
      var _this3 = this;

      if (this._isDisposed) {
        logger.error('Attempt to send socket message after connection closed', new Error());
        return;
      }

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
  }, {
    key: 'getMarshallingContext',
    value: function getMarshallingContext() {
      return this._objectRegistry;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._isDisposed = true;
      this._close();
      this._objectRegistry.dispose();
    }
  }]);

  return SocketClient;
})();

exports.SocketClient = SocketClient;
//# sourceMappingURL=data:application/json;base64,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QUFDeEIsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsVUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQzs7O1NBM0dVLFlBQVkiLCJmaWxlIjoiU29ja2V0Q2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtTRVJWSUNFX0ZSQU1FV09SSzNfQ0hBTk5FTH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IFNlcnZpY2VGcmFtZXdvcmsgZnJvbSAnLi9zZXJ2aWNlZnJhbWV3b3JrL2luZGV4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmltcG9ydCB7T2JqZWN0UmVnaXN0cnl9IGZyb20gJy4vc2VydmljZWZyYW1ld29yay9PYmplY3RSZWdpc3RyeSc7XG5cbi8vIFNlcnZlciBzaWRlIGFuYWxvZyB0byAocGFydHMgb2YpIE51Y2xpZGVTb2NrZXRcbi8vIEhhbmRsZXMgSlNPTiBtZXNzYWdpbmcgYW5kIHJlY29ubmVjdC5cbmV4cG9ydCBjbGFzcyBTb2NrZXRDbGllbnQge1xuICBpZDogc3RyaW5nO1xuICBfaXNEaXNwb3NlZDogYm9vbGVhbjtcbiAgX3NvY2tldDogP3dzJFdlYlNvY2tldDtcbiAgX21lc3NhZ2VRdWV1ZTogQXJyYXk8e2RhdGE6IHN0cmluZ30+O1xuICBfc2VydmVyQ29tcG9uZW50OiBTZXJ2aWNlRnJhbWV3b3JrLlNlcnZlckNvbXBvbmVudDtcbiAgX29iamVjdFJlZ2lzdHJ5OiBPYmplY3RSZWdpc3RyeTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNsaWVudElkOiBzdHJpbmcsXG4gICAgICBzZXJ2ZXJDb21wb25lbnQ6IFNlcnZpY2VGcmFtZXdvcmsuU2VydmVyQ29tcG9uZW50LFxuICAgICAgc29ja2V0OiB3cyRXZWJTb2NrZXQpIHtcbiAgICB0aGlzLmlkID0gY2xpZW50SWQ7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgdGhpcy5fbWVzc2FnZVF1ZXVlID0gW107XG4gICAgdGhpcy5fb2JqZWN0UmVnaXN0cnkgPSBuZXcgT2JqZWN0UmVnaXN0cnkoKTtcbiAgICB0aGlzLl9zZXJ2ZXJDb21wb25lbnQgPSBzZXJ2ZXJDb21wb25lbnQ7XG4gICAgdGhpcy5fY29ubmVjdChzb2NrZXQpO1xuICB9XG5cbiAgX2Nvbm5lY3Qoc29ja2V0OiB3cyRXZWJTb2NrZXQpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbygnQ2xpZW50ICMlcyBjb25uZWN0aW5nIHdpdGggYSBuZXcgc29ja2V0IScsIHRoaXMuaWQpO1xuICAgIGludmFyaWFudCh0aGlzLl9zb2NrZXQgPT0gbnVsbCk7XG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0O1xuICAgIHNvY2tldC5vbignbWVzc2FnZScsIG1lc3NhZ2UgPT4gdGhpcy5fb25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2UpKTtcblxuICAgIHNvY2tldC5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICBpZiAodGhpcy5fc29ja2V0ICE9IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBjYW4gb2NjdXIgb24gYSByZWNvbm5lY3QsIHdoZXJlIHRoZSBvbGQgc29ja2V0IGhhcyBiZWVuIGNsb3NlZFxuICAgICAgICAvLyBidXQgaXRzIGNsb3NlIGV2ZW50IGlzIHNlbnQgYXN5bmNocm9ub3VzbHkuXG4gICAgICAgIGlmICh0aGlzLl9zb2NrZXQgPT09IHNvY2tldCkge1xuICAgICAgICAgIHRoaXMuX3NvY2tldCA9IG51bGw7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oJ0NsaWVudCAjJXMgc29ja2V0IGNsb3NlIHJlY2lldmVkIG9uIG9wZW4gc29ja2V0IScsIHRoaXMuaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ2dlci5pbmZvKCdDbGllbnQgIyVzIHNvY2tldCBjbG9zZSByZWNlaXZlZCBvbiBvcnBoYW5lZCBzb2NrZXQhJywgdGhpcy5pZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdDbGllbnQgIyVzIHJlY2lldmVkIHNvY2tldCBjbG9zZSBvbiBhbHJlYWR5IGNsb3NlZCBzb2NrZXQhJywgdGhpcy5pZCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZWNvbm5lY3Qoc29ja2V0OiB3cyRXZWJTb2NrZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9jbG9zZSgpO1xuICAgIHRoaXMuX2Nvbm5lY3Qoc29ja2V0KTtcbiAgICBjb25zdCBxdWV1ZWRNZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VRdWV1ZTtcbiAgICB0aGlzLl9tZXNzYWdlUXVldWUgPSBbXTtcbiAgICBxdWV1ZWRNZXNzYWdlcy5cbiAgICAgICAgZm9yRWFjaChtZXNzYWdlID0+IHRoaXMuc2VuZFNvY2tldE1lc3NhZ2UobWVzc2FnZS5kYXRhKSk7XG4gIH1cblxuICBfY2xvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3NvY2tldCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zb2NrZXQuY2xvc2UoKTtcbiAgICAgIC8vIEluIGNlcnRhaW4gKEVycm9yKSBjb25kaXRpb25zIHNvY2tldC5jbG9zZSBtYXkgbm90IGVtaXQgdGhlIG9uIGNsb3NlXG4gICAgICAvLyBldmVudCBzeW5jaHJvbm91c2x5LlxuICAgICAgdGhpcy5fc29ja2V0ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb25Tb2NrZXRNZXNzYWdlKG1lc3NhZ2U6IGFueSk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoYFJlY2VpdmVkIHNvY2tldCBtZXNzYWdlIGFmdGVyIGNvbm5lY3Rpb24gY2xvc2VkYCwgbmV3IEVycm9yKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnNlZE1lc3NhZ2U6IE9iamVjdCA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgaW52YXJpYW50KHBhcnNlZE1lc3NhZ2UucHJvdG9jb2wgJiYgcGFyc2VkTWVzc2FnZS5wcm90b2NvbCA9PT0gU0VSVklDRV9GUkFNRVdPUkszX0NIQU5ORUwpO1xuICAgIHRoaXMuX3NlcnZlckNvbXBvbmVudC5oYW5kbGVNZXNzYWdlKHRoaXMsIHBhcnNlZE1lc3NhZ2UpO1xuICB9XG5cbiAgc2VuZFNvY2tldE1lc3NhZ2UoZGF0YTogYW55KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzRGlzcG9zZWQpIHtcbiAgICAgIGxvZ2dlci5lcnJvcihgQXR0ZW1wdCB0byBzZW5kIHNvY2tldCBtZXNzYWdlIGFmdGVyIGNvbm5lY3Rpb24gY2xvc2VkYCwgbmV3IEVycm9yKCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFdyYXAgdGhlIGRhdGEgaW4gYW4gb2JqZWN0LCBiZWNhdXNlIGlmIGBkYXRhYCBpcyBhIHByaW1pdGl2ZSBkYXRhIHR5cGUsXG4gICAgLy8gZmluZGluZyBpdCBpbiBhbiBhcnJheSB3b3VsZCByZXR1cm4gdGhlIGZpcnN0IG1hdGNoaW5nIGl0ZW0sIG5vdCBuZWNlc3NhcmlseVxuICAgIC8vIHRoZSBzYW1lIGluc2VydGVkIGl0ZW0uXG4gICAgY29uc3QgbWVzc2FnZSA9IHtkYXRhfTtcbiAgICB0aGlzLl9tZXNzYWdlUXVldWUucHVzaChtZXNzYWdlKTtcbiAgICBjb25zdCBzb2NrZXQgPSB0aGlzLl9zb2NrZXQ7XG4gICAgaWYgKHNvY2tldCA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpLCBlcnIgPT4ge1xuICAgICAgaWYgKGVycikge1xuICAgICAgICBsb2dnZXIud2FybignRmFpbGVkIHNlbmRpbmcgc29ja2V0IG1lc3NhZ2UgdG8gY2xpZW50OicsIHRoaXMuaWQsIGRhdGEpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZUluZGV4ID0gdGhpcy5fbWVzc2FnZVF1ZXVlLmluZGV4T2YobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlSW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgdGhpcy5fbWVzc2FnZVF1ZXVlLnNwbGljZShtZXNzYWdlSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXRNYXJzaGFsbGluZ0NvbnRleHQoKTogT2JqZWN0UmVnaXN0cnkge1xuICAgIHJldHVybiB0aGlzLl9vYmplY3RSZWdpc3RyeTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgICB0aGlzLl9vYmplY3RSZWdpc3RyeS5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==