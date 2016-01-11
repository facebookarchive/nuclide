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

var _eventKit = require('event-kit');

var _DbgpMessageHandler = require('./DbgpMessageHandler');

var _ConnectionUtils = require('./ConnectionUtils');

/**
 * xdebugPort is the port to listen for dbgp connections on.
 *
 * If present scriptRegex must be a valid RegExp. Only dbgp connections whose script
 * path matches scriptRegex will be accepted. Dbgp connections which do not match
 * the scriptRegex will be ignored.
 *
 * Similarly, the idekeyRegex filters incoming dbgp connections by idekey,
 * and pid filters connections by process id (appid in the dbgp terminology).
 * Note that 0 pid also does not filter on process id.
 */

var DBGP_ATTACH_EVENT = 'dbgp-attach-event';
var DBGP_CLOSE_EVENT = 'dbgp-close-event';
var DBGP_ERROR_EVENT = 'dbgp-error-event';

/**
 * Connect to requested dbgp debuggee on given port.
 *
 * Starts listening for socket connections on the given port.
 * Waits for dbgp init connection message for each connection.
 * If the connection matches the given pid/ideky/path then
 * resolve with the connection and stop listening for new
 * connections.
 * If the connection does not match the given pid/idekey/path
 * then close the connection and continue waiting for a match.
 */

var DbgpConnector = (function () {
  function DbgpConnector(config) {
    _classCallCheck(this, DbgpConnector);

    this._config = config;
    this._server = null;
    this._emitter = new _eventKit.Emitter();
    this._messageHandler = (0, _DbgpMessageHandler.getDbgpMessageHandlerInstance)();
  }

  _createClass(DbgpConnector, [{
    key: 'onAttach',
    value: function onAttach(callback) {
      return this._emitter.on(DBGP_ATTACH_EVENT, callback);
    }
  }, {
    key: 'onClose',
    value: function onClose(callback) {
      return this._emitter.on(DBGP_CLOSE_EVENT, callback);
    }
  }, {
    key: 'onError',
    value: function onError(callback) {
      return this._emitter.on(DBGP_ERROR_EVENT, callback);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this;

      var port = this._config.xdebugPort;

      _utils2['default'].log('Creating debug server on port ' + port);

      var server = require('net').createServer();

      server.on('close', function (socket) {
        return _utils2['default'].log('Closing port ' + port);
      });
      server.listen(port, undefined, undefined, function () {
        return _utils2['default'].log('Listening on port ' + port);
      });

      server.on('error', function (error) {
        return _this._onServerError(error);
      });
      server.on('connection', function (socket) {
        return _this._onSocketConnection(socket);
      });
      server.on('close', function () {
        _utils2['default'].log('DBGP Server closed.');
      });

      this._server = server;
    }
  }, {
    key: '_onSocketConnection',
    value: function _onSocketConnection(socket) {
      var _this2 = this;

      var port = this._config.xdebugPort;

      _utils2['default'].log('Connection on port ' + port);
      if (!this._checkListening(socket, 'Connection')) {
        return;
      }
      socket.once('data', function (data) {
        return _this2._onSocketData(socket, data);
      });
    }
  }, {
    key: '_onServerError',
    value: function _onServerError(error) {
      var port = this._config.xdebugPort;

      var errorMessage = undefined;
      if (error.code === 'EADDRINUSE') {
        errorMessage = 'Can\'t start debugging because port ' + port + ' is being used by another process. ' + 'Try running \'killall node\' on your devserver and then restarting Nuclide.';
      } else {
        errorMessage = 'Unknown debugger socket error: ' + error.code + '.';
      }

      _utils2['default'].logError(errorMessage);
      this._emitter.emit(DBGP_ERROR_EVENT, errorMessage);

      this.dispose();
    }
  }, {
    key: '_onSocketData',
    value: function _onSocketData(socket, data) {
      if (!this._checkListening(socket, 'Data')) {
        return;
      }

      var messages = undefined;
      try {
        messages = this._messageHandler.parseMessages(data.toString());
      } catch (error) {
        (0, _ConnectionUtils.failConnection)(socket, 'Non XML connection string: ' + data.toString() + '. Discarding connection.');
        return;
      }

      if (messages.length !== 1) {
        (0, _ConnectionUtils.failConnection)(socket, 'Expected a single connection message. Got ' + messages.length);
        return;
      }

      var message = messages[0];
      this._emitter.emit(DBGP_ATTACH_EVENT, { socket: socket, message: message });
    }

    /**
     * Checks if listening for connections. If not then close the new socket.
     */
  }, {
    key: '_checkListening',
    value: function _checkListening(socket, message) {
      if (!this.isListening()) {
        var port = this._config.xdebugPort;
        _utils2['default'].log('Ignoring ' + message + ' on port ' + port + ' after stopped connection.');
        return false;
      }
      return true;
    }
  }, {
    key: 'isListening',
    value: function isListening() {
      return !!this._server;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._server) {
        this._server.close();
        this._emitter.emit(DBGP_CLOSE_EVENT);
        this._server = null;
      }
    }
  }]);

  return DbgpConnector;
})();

exports.DbgpConnector = DbgpConnector;
//# sourceMappingURL=data:application/json;base64,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QzVCLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBRSxPQUFPLEVBQVAsT0FBTyxFQUFDLENBQUMsQ0FBQztLQUMxRDs7Ozs7OztXQUtjLHlCQUFDLE1BQWMsRUFBRSxPQUFlLEVBQVc7QUFDeEQsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN2QixZQUFNLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQztBQUNyQywyQkFBTyxHQUFHLENBQUMsV0FBVyxHQUFHLE9BQU8sR0FBRyxXQUFXLEdBQUcsSUFBSSxHQUFHLDRCQUE0QixDQUFDLENBQUM7QUFDdEYsZUFBTyxLQUFLLENBQUM7T0FDZDtBQUNELGFBQU8sSUFBSSxDQUFDO0tBQ2I7OztXQUVVLHVCQUFZO0FBQ3JCLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7S0FDdkI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hCLFlBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNyQyxZQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztPQUNyQjtLQUNGOzs7U0FuSFUsYUFBYSIsImZpbGUiOiJEYmdwQ29ubmVjdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnZXZlbnQta2l0JztcbmltcG9ydCB7RGJncE1lc3NhZ2VIYW5kbGVyLCBnZXREYmdwTWVzc2FnZUhhbmRsZXJJbnN0YW5jZX0gZnJvbSAnLi9EYmdwTWVzc2FnZUhhbmRsZXInO1xuaW1wb3J0IHtmYWlsQ29ubmVjdGlvbn0gZnJvbSAnLi9Db25uZWN0aW9uVXRpbHMnO1xuXG5pbXBvcnQgdHlwZSB7U29ja2V0LCBTZXJ2ZXJ9IGZyb20gJ25ldCc7XG5pbXBvcnQgdHlwZSB7Q29ubmVjdGlvbkNvbmZpZ30gZnJvbSAnLi9IaHZtRGVidWdnZXJQcm94eVNlcnZpY2UnO1xuLyoqXG4gKiB4ZGVidWdQb3J0IGlzIHRoZSBwb3J0IHRvIGxpc3RlbiBmb3IgZGJncCBjb25uZWN0aW9ucyBvbi5cbiAqXG4gKiBJZiBwcmVzZW50IHNjcmlwdFJlZ2V4IG11c3QgYmUgYSB2YWxpZCBSZWdFeHAuIE9ubHkgZGJncCBjb25uZWN0aW9ucyB3aG9zZSBzY3JpcHRcbiAqIHBhdGggbWF0Y2hlcyBzY3JpcHRSZWdleCB3aWxsIGJlIGFjY2VwdGVkLiBEYmdwIGNvbm5lY3Rpb25zIHdoaWNoIGRvIG5vdCBtYXRjaFxuICogdGhlIHNjcmlwdFJlZ2V4IHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBTaW1pbGFybHksIHRoZSBpZGVrZXlSZWdleCBmaWx0ZXJzIGluY29taW5nIGRiZ3AgY29ubmVjdGlvbnMgYnkgaWRla2V5LFxuICogYW5kIHBpZCBmaWx0ZXJzIGNvbm5lY3Rpb25zIGJ5IHByb2Nlc3MgaWQgKGFwcGlkIGluIHRoZSBkYmdwIHRlcm1pbm9sb2d5KS5cbiAqIE5vdGUgdGhhdCAwIHBpZCBhbHNvIGRvZXMgbm90IGZpbHRlciBvbiBwcm9jZXNzIGlkLlxuICovXG5cbmNvbnN0IERCR1BfQVRUQUNIX0VWRU5UID0gJ2RiZ3AtYXR0YWNoLWV2ZW50JztcbmNvbnN0IERCR1BfQ0xPU0VfRVZFTlQgPSAnZGJncC1jbG9zZS1ldmVudCc7XG5jb25zdCBEQkdQX0VSUk9SX0VWRU5UID0gJ2RiZ3AtZXJyb3ItZXZlbnQnO1xuXG4vKipcbiAqIENvbm5lY3QgdG8gcmVxdWVzdGVkIGRiZ3AgZGVidWdnZWUgb24gZ2l2ZW4gcG9ydC5cbiAqXG4gKiBTdGFydHMgbGlzdGVuaW5nIGZvciBzb2NrZXQgY29ubmVjdGlvbnMgb24gdGhlIGdpdmVuIHBvcnQuXG4gKiBXYWl0cyBmb3IgZGJncCBpbml0IGNvbm5lY3Rpb24gbWVzc2FnZSBmb3IgZWFjaCBjb25uZWN0aW9uLlxuICogSWYgdGhlIGNvbm5lY3Rpb24gbWF0Y2hlcyB0aGUgZ2l2ZW4gcGlkL2lkZWt5L3BhdGggdGhlblxuICogcmVzb2x2ZSB3aXRoIHRoZSBjb25uZWN0aW9uIGFuZCBzdG9wIGxpc3RlbmluZyBmb3IgbmV3XG4gKiBjb25uZWN0aW9ucy5cbiAqIElmIHRoZSBjb25uZWN0aW9uIGRvZXMgbm90IG1hdGNoIHRoZSBnaXZlbiBwaWQvaWRla2V5L3BhdGhcbiAqIHRoZW4gY2xvc2UgdGhlIGNvbm5lY3Rpb24gYW5kIGNvbnRpbnVlIHdhaXRpbmcgZm9yIGEgbWF0Y2guXG4gKi9cbmV4cG9ydCBjbGFzcyBEYmdwQ29ubmVjdG9yIHtcbiAgX2NvbmZpZzogQ29ubmVjdGlvbkNvbmZpZztcbiAgX3NlcnZlcjogP1NlcnZlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9tZXNzYWdlSGFuZGxlcjogRGJncE1lc3NhZ2VIYW5kbGVyO1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZzogQ29ubmVjdGlvbkNvbmZpZykge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX21lc3NhZ2VIYW5kbGVyID0gZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2UoKTtcbiAgfVxuXG4gIG9uQXR0YWNoKGNhbGxiYWNrOiAocGFyYW1zOiB7c29ja2V0OiBTb2NrZXQsIG1lc3NhZ2U6IE9iamVjdH0pID0+IFByb21pc2UpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKERCR1BfQVRUQUNIX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkNsb3NlKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihEQkdQX0NMT1NFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkVycm9yKGNhbGxiYWNrOiAoZXJyb3I6IHN0cmluZykgPT4gdm9pZCk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oREJHUF9FUlJPUl9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgbGlzdGVuKCk6IHZvaWQge1xuICAgIGNvbnN0IHBvcnQgPSB0aGlzLl9jb25maWcueGRlYnVnUG9ydDtcblxuICAgIGxvZ2dlci5sb2coJ0NyZWF0aW5nIGRlYnVnIHNlcnZlciBvbiBwb3J0ICcgKyBwb3J0KTtcblxuICAgIGNvbnN0IHNlcnZlciA9IHJlcXVpcmUoJ25ldCcpLmNyZWF0ZVNlcnZlcigpO1xuXG4gICAgc2VydmVyLm9uKCdjbG9zZScsIHNvY2tldCA9PiBsb2dnZXIubG9nKCdDbG9zaW5nIHBvcnQgJyArIHBvcnQpKTtcbiAgICBzZXJ2ZXIubGlzdGVuKHBvcnQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCAoKSA9PiBsb2dnZXIubG9nKCdMaXN0ZW5pbmcgb24gcG9ydCAnICsgcG9ydCkpO1xuXG4gICAgc2VydmVyLm9uKCdlcnJvcicsIGVycm9yID0+IHRoaXMuX29uU2VydmVyRXJyb3IoZXJyb3IpKTtcbiAgICBzZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCBzb2NrZXQgPT4gdGhpcy5fb25Tb2NrZXRDb25uZWN0aW9uKHNvY2tldCkpO1xuICAgIHNlcnZlci5vbignY2xvc2UnLCAoKSA9PiB7IGxvZ2dlci5sb2coJ0RCR1AgU2VydmVyIGNsb3NlZC4nKTsgfSk7XG5cbiAgICB0aGlzLl9zZXJ2ZXIgPSBzZXJ2ZXI7XG4gIH1cblxuICBfb25Tb2NrZXRDb25uZWN0aW9uKHNvY2tldDogU29ja2V0KSB7XG4gICAgY29uc3QgcG9ydCA9IHRoaXMuX2NvbmZpZy54ZGVidWdQb3J0O1xuXG4gICAgbG9nZ2VyLmxvZygnQ29ubmVjdGlvbiBvbiBwb3J0ICcgKyBwb3J0KTtcbiAgICBpZiAoIXRoaXMuX2NoZWNrTGlzdGVuaW5nKHNvY2tldCwgJ0Nvbm5lY3Rpb24nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzb2NrZXQub25jZSgnZGF0YScsIGRhdGEgPT4gdGhpcy5fb25Tb2NrZXREYXRhKHNvY2tldCwgZGF0YSkpO1xuICB9XG5cbiAgX29uU2VydmVyRXJyb3IoZXJyb3I6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IHBvcnQgPSB0aGlzLl9jb25maWcueGRlYnVnUG9ydDtcblxuICAgIGxldCBlcnJvck1lc3NhZ2U7XG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdFQUREUklOVVNFJykge1xuICAgICAgZXJyb3JNZXNzYWdlID0gYENhbid0IHN0YXJ0IGRlYnVnZ2luZyBiZWNhdXNlIHBvcnQgJHtwb3J0fSBpcyBiZWluZyB1c2VkIGJ5IGFub3RoZXIgcHJvY2Vzcy4gYFxuICAgICAgICArIGBUcnkgcnVubmluZyAna2lsbGFsbCBub2RlJyBvbiB5b3VyIGRldnNlcnZlciBhbmQgdGhlbiByZXN0YXJ0aW5nIE51Y2xpZGUuYDtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JNZXNzYWdlID0gYFVua25vd24gZGVidWdnZXIgc29ja2V0IGVycm9yOiAke2Vycm9yLmNvZGV9LmA7XG4gICAgfVxuXG4gICAgbG9nZ2VyLmxvZ0Vycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KERCR1BfRVJST1JfRVZFTlQsIGVycm9yTWVzc2FnZSk7XG5cbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9vblNvY2tldERhdGEoc29ja2V0OiBTb2NrZXQsIGRhdGE6IEJ1ZmZlciB8IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fY2hlY2tMaXN0ZW5pbmcoc29ja2V0LCAnRGF0YScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG1lc3NhZ2VzO1xuICAgIHRyeSB7XG4gICAgICBtZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VIYW5kbGVyLnBhcnNlTWVzc2FnZXMoZGF0YS50b1N0cmluZygpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgZmFpbENvbm5lY3Rpb24oXG4gICAgICAgIHNvY2tldCxcbiAgICAgICAgJ05vbiBYTUwgY29ubmVjdGlvbiBzdHJpbmc6ICcgKyBkYXRhLnRvU3RyaW5nKCkgKyAnLiBEaXNjYXJkaW5nIGNvbm5lY3Rpb24uJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCAhPT0gMSkge1xuICAgICAgZmFpbENvbm5lY3Rpb24oc29ja2V0LCAnRXhwZWN0ZWQgYSBzaW5nbGUgY29ubmVjdGlvbiBtZXNzYWdlLiBHb3QgJyArIG1lc3NhZ2VzLmxlbmd0aCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWVzc2FnZSA9IG1lc3NhZ2VzWzBdO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChEQkdQX0FUVEFDSF9FVkVOVCwge3NvY2tldCwgbWVzc2FnZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBsaXN0ZW5pbmcgZm9yIGNvbm5lY3Rpb25zLiBJZiBub3QgdGhlbiBjbG9zZSB0aGUgbmV3IHNvY2tldC5cbiAgICovXG4gIF9jaGVja0xpc3RlbmluZyhzb2NrZXQ6IFNvY2tldCwgbWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLmlzTGlzdGVuaW5nKCkpIHtcbiAgICAgIGNvbnN0IHBvcnQgPSB0aGlzLl9jb25maWcueGRlYnVnUG9ydDtcbiAgICAgIGxvZ2dlci5sb2coJ0lnbm9yaW5nICcgKyBtZXNzYWdlICsgJyBvbiBwb3J0ICcgKyBwb3J0ICsgJyBhZnRlciBzdG9wcGVkIGNvbm5lY3Rpb24uJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaXNMaXN0ZW5pbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fc2VydmVyO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChEQkdQX0NMT1NFX0VWRU5UKTtcbiAgICAgIHRoaXMuX3NlcnZlciA9IG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=