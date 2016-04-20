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

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _eventKit = require('event-kit');

var _DbgpMessageHandler = require('./DbgpMessageHandler');

var _ConnectionUtils = require('./ConnectionUtils');

/**
 * xdebugAttachPort is the port to listen for dbgp connections on.
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
  function DbgpConnector(port) {
    _classCallCheck(this, DbgpConnector);

    this._server = null;
    this._emitter = new _eventKit.Emitter();
    this._messageHandler = (0, _DbgpMessageHandler.getDbgpMessageHandlerInstance)();
    this._port = port;
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

      _utils2['default'].log('Creating debug server on port ' + this._port);

      var server = _net2['default'].createServer();

      server.on('close', function (socket) {
        return _utils2['default'].log('Closing port ' + _this._port);
      });
      server.listen(this._port, undefined, // Hostname.
      undefined, // Backlog -- the maximum length of the queue of pending connections.
      function () {
        return _utils2['default'].log('Listening on port ' + _this._port);
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

      _utils2['default'].log('Connection on port ' + this._port);
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
      var errorMessage = undefined;
      if (error.code === 'EADDRINUSE') {
        errorMessage = 'Can\'t start debugging because port ' + this._port + ' is being used by another process. ' + 'Try running \'killall node\' on your devserver and then restarting Nuclide.';
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
        _utils2['default'].log('Ignoring ' + message + ' on port ' + this._port + ' after stopped connection.');
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
//# sourceMappingURL=data:application/json;base64,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LHlCQUFDLE1BQWMsRUFBRSxPQUFlLEVBQVc7QUFDeEQsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRTtBQUN2QiwyQkFBTyxHQUFHLENBQUMsV0FBVyxHQUFHLE9BQU8sR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyw0QkFBNEIsQ0FBQyxDQUFDO0FBQzVGLGVBQU8sS0FBSyxDQUFDO09BQ2Q7QUFDRCxhQUFPLElBQUksQ0FBQztLQUNiOzs7V0FFVSx1QkFBWTtBQUNyQixhQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3ZCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDckMsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7T0FDckI7S0FDRjs7O1NBbEhVLGFBQWEiLCJmaWxlIjoiRGJncENvbm5lY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBuZXQgZnJvbSAnbmV0JztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJ2V2ZW50LWtpdCc7XG5pbXBvcnQge0RiZ3BNZXNzYWdlSGFuZGxlciwgZ2V0RGJncE1lc3NhZ2VIYW5kbGVySW5zdGFuY2V9IGZyb20gJy4vRGJncE1lc3NhZ2VIYW5kbGVyJztcbmltcG9ydCB7ZmFpbENvbm5lY3Rpb259IGZyb20gJy4vQ29ubmVjdGlvblV0aWxzJztcblxuaW1wb3J0IHR5cGUge1NvY2tldCwgU2VydmVyfSBmcm9tICduZXQnO1xuLyoqXG4gKiB4ZGVidWdBdHRhY2hQb3J0IGlzIHRoZSBwb3J0IHRvIGxpc3RlbiBmb3IgZGJncCBjb25uZWN0aW9ucyBvbi5cbiAqXG4gKiBJZiBwcmVzZW50IHNjcmlwdFJlZ2V4IG11c3QgYmUgYSB2YWxpZCBSZWdFeHAuIE9ubHkgZGJncCBjb25uZWN0aW9ucyB3aG9zZSBzY3JpcHRcbiAqIHBhdGggbWF0Y2hlcyBzY3JpcHRSZWdleCB3aWxsIGJlIGFjY2VwdGVkLiBEYmdwIGNvbm5lY3Rpb25zIHdoaWNoIGRvIG5vdCBtYXRjaFxuICogdGhlIHNjcmlwdFJlZ2V4IHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBTaW1pbGFybHksIHRoZSBpZGVrZXlSZWdleCBmaWx0ZXJzIGluY29taW5nIGRiZ3AgY29ubmVjdGlvbnMgYnkgaWRla2V5LFxuICogYW5kIHBpZCBmaWx0ZXJzIGNvbm5lY3Rpb25zIGJ5IHByb2Nlc3MgaWQgKGFwcGlkIGluIHRoZSBkYmdwIHRlcm1pbm9sb2d5KS5cbiAqIE5vdGUgdGhhdCAwIHBpZCBhbHNvIGRvZXMgbm90IGZpbHRlciBvbiBwcm9jZXNzIGlkLlxuICovXG5cbmNvbnN0IERCR1BfQVRUQUNIX0VWRU5UID0gJ2RiZ3AtYXR0YWNoLWV2ZW50JztcbmNvbnN0IERCR1BfQ0xPU0VfRVZFTlQgPSAnZGJncC1jbG9zZS1ldmVudCc7XG5jb25zdCBEQkdQX0VSUk9SX0VWRU5UID0gJ2RiZ3AtZXJyb3ItZXZlbnQnO1xuXG4vKipcbiAqIENvbm5lY3QgdG8gcmVxdWVzdGVkIGRiZ3AgZGVidWdnZWUgb24gZ2l2ZW4gcG9ydC5cbiAqXG4gKiBTdGFydHMgbGlzdGVuaW5nIGZvciBzb2NrZXQgY29ubmVjdGlvbnMgb24gdGhlIGdpdmVuIHBvcnQuXG4gKiBXYWl0cyBmb3IgZGJncCBpbml0IGNvbm5lY3Rpb24gbWVzc2FnZSBmb3IgZWFjaCBjb25uZWN0aW9uLlxuICogSWYgdGhlIGNvbm5lY3Rpb24gbWF0Y2hlcyB0aGUgZ2l2ZW4gcGlkL2lkZWt5L3BhdGggdGhlblxuICogcmVzb2x2ZSB3aXRoIHRoZSBjb25uZWN0aW9uIGFuZCBzdG9wIGxpc3RlbmluZyBmb3IgbmV3XG4gKiBjb25uZWN0aW9ucy5cbiAqIElmIHRoZSBjb25uZWN0aW9uIGRvZXMgbm90IG1hdGNoIHRoZSBnaXZlbiBwaWQvaWRla2V5L3BhdGhcbiAqIHRoZW4gY2xvc2UgdGhlIGNvbm5lY3Rpb24gYW5kIGNvbnRpbnVlIHdhaXRpbmcgZm9yIGEgbWF0Y2guXG4gKi9cbmV4cG9ydCBjbGFzcyBEYmdwQ29ubmVjdG9yIHtcbiAgX3NlcnZlcjogP1NlcnZlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9tZXNzYWdlSGFuZGxlcjogRGJncE1lc3NhZ2VIYW5kbGVyO1xuICBfcG9ydDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHBvcnQ6IG51bWJlcikge1xuICAgIHRoaXMuX3NlcnZlciA9IG51bGw7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fbWVzc2FnZUhhbmRsZXIgPSBnZXREYmdwTWVzc2FnZUhhbmRsZXJJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3BvcnQgPSBwb3J0O1xuICB9XG5cbiAgb25BdHRhY2goY2FsbGJhY2s6IChwYXJhbXM6IHtzb2NrZXQ6IFNvY2tldDsgbWVzc2FnZTogT2JqZWN0fSkgPT4gUHJvbWlzZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihEQkdQX0FUVEFDSF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgb25DbG9zZShjYWxsYmFjazogKCkgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihEQkdQX0NMT1NFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBvbkVycm9yKGNhbGxiYWNrOiAoZXJyb3I6IHN0cmluZykgPT4gdm9pZCk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihEQkdQX0VSUk9SX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBsaXN0ZW4oKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnQ3JlYXRpbmcgZGVidWcgc2VydmVyIG9uIHBvcnQgJyArIHRoaXMuX3BvcnQpO1xuXG4gICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuXG4gICAgc2VydmVyLm9uKCdjbG9zZScsIHNvY2tldCA9PiBsb2dnZXIubG9nKCdDbG9zaW5nIHBvcnQgJyArIHRoaXMuX3BvcnQpKTtcbiAgICBzZXJ2ZXIubGlzdGVuKFxuICAgICAgdGhpcy5fcG9ydCxcbiAgICAgIHVuZGVmaW5lZCwgLy8gSG9zdG5hbWUuXG4gICAgICB1bmRlZmluZWQsIC8vIEJhY2tsb2cgLS0gdGhlIG1heGltdW0gbGVuZ3RoIG9mIHRoZSBxdWV1ZSBvZiBwZW5kaW5nIGNvbm5lY3Rpb25zLlxuICAgICAgKCkgPT4gbG9nZ2VyLmxvZygnTGlzdGVuaW5nIG9uIHBvcnQgJyArIHRoaXMuX3BvcnQpLFxuICAgICk7XG5cbiAgICBzZXJ2ZXIub24oJ2Vycm9yJywgZXJyb3IgPT4gdGhpcy5fb25TZXJ2ZXJFcnJvcihlcnJvcikpO1xuICAgIHNlcnZlci5vbignY29ubmVjdGlvbicsIHNvY2tldCA9PiB0aGlzLl9vblNvY2tldENvbm5lY3Rpb24oc29ja2V0KSk7XG4gICAgc2VydmVyLm9uKCdjbG9zZScsICgpID0+IHsgbG9nZ2VyLmxvZygnREJHUCBTZXJ2ZXIgY2xvc2VkLicpOyB9KTtcblxuICAgIHRoaXMuX3NlcnZlciA9IHNlcnZlcjtcbiAgfVxuXG4gIF9vblNvY2tldENvbm5lY3Rpb24oc29ja2V0OiBTb2NrZXQpIHtcbiAgICBsb2dnZXIubG9nKCdDb25uZWN0aW9uIG9uIHBvcnQgJyArIHRoaXMuX3BvcnQpO1xuICAgIGlmICghdGhpcy5fY2hlY2tMaXN0ZW5pbmcoc29ja2V0LCAnQ29ubmVjdGlvbicpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNvY2tldC5vbmNlKCdkYXRhJywgZGF0YSA9PiB0aGlzLl9vblNvY2tldERhdGEoc29ja2V0LCBkYXRhKSk7XG4gIH1cblxuICBfb25TZXJ2ZXJFcnJvcihlcnJvcjogT2JqZWN0KTogdm9pZCB7XG4gICAgbGV0IGVycm9yTWVzc2FnZTtcbiAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VBRERSSU5VU0UnKSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPVxuICAgICAgICBgQ2FuJ3Qgc3RhcnQgZGVidWdnaW5nIGJlY2F1c2UgcG9ydCAke3RoaXMuX3BvcnR9IGlzIGJlaW5nIHVzZWQgYnkgYW5vdGhlciBwcm9jZXNzLiBgXG4gICAgICAgICsgYFRyeSBydW5uaW5nICdraWxsYWxsIG5vZGUnIG9uIHlvdXIgZGV2c2VydmVyIGFuZCB0aGVuIHJlc3RhcnRpbmcgTnVjbGlkZS5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBlcnJvck1lc3NhZ2UgPSBgVW5rbm93biBkZWJ1Z2dlciBzb2NrZXQgZXJyb3I6ICR7ZXJyb3IuY29kZX0uYDtcbiAgICB9XG5cbiAgICBsb2dnZXIubG9nRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoREJHUF9FUlJPUl9FVkVOVCwgZXJyb3JNZXNzYWdlKTtcblxuICAgIHRoaXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX29uU29ja2V0RGF0YShzb2NrZXQ6IFNvY2tldCwgZGF0YTogQnVmZmVyIHwgc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9jaGVja0xpc3RlbmluZyhzb2NrZXQsICdEYXRhJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbWVzc2FnZXM7XG4gICAgdHJ5IHtcbiAgICAgIG1lc3NhZ2VzID0gdGhpcy5fbWVzc2FnZUhhbmRsZXIucGFyc2VNZXNzYWdlcyhkYXRhLnRvU3RyaW5nKCkpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBmYWlsQ29ubmVjdGlvbihcbiAgICAgICAgc29ja2V0LFxuICAgICAgICAnTm9uIFhNTCBjb25uZWN0aW9uIHN0cmluZzogJyArIGRhdGEudG9TdHJpbmcoKSArICcuIERpc2NhcmRpbmcgY29ubmVjdGlvbi4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWVzc2FnZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICBmYWlsQ29ubmVjdGlvbihzb2NrZXQsICdFeHBlY3RlZCBhIHNpbmdsZSBjb25uZWN0aW9uIG1lc3NhZ2UuIEdvdCAnICsgbWVzc2FnZXMubGVuZ3RoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXNbMF07XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KERCR1BfQVRUQUNIX0VWRU5ULCB7c29ja2V0LCBtZXNzYWdlfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGxpc3RlbmluZyBmb3IgY29ubmVjdGlvbnMuIElmIG5vdCB0aGVuIGNsb3NlIHRoZSBuZXcgc29ja2V0LlxuICAgKi9cbiAgX2NoZWNrTGlzdGVuaW5nKHNvY2tldDogU29ja2V0LCBtZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaXNMaXN0ZW5pbmcoKSkge1xuICAgICAgbG9nZ2VyLmxvZygnSWdub3JpbmcgJyArIG1lc3NhZ2UgKyAnIG9uIHBvcnQgJyArIHRoaXMuX3BvcnQgKyAnIGFmdGVyIHN0b3BwZWQgY29ubmVjdGlvbi4nKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpc0xpc3RlbmluZygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLl9zZXJ2ZXI7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9zZXJ2ZXIpIHtcbiAgICAgIHRoaXMuX3NlcnZlci5jbG9zZSgpO1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KERCR1BfQ0xPU0VfRVZFTlQpO1xuICAgICAgdGhpcy5fc2VydmVyID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==