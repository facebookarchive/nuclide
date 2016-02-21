Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getHackConnection = _asyncToGenerator(function* (filePath) {
  var command = yield (0, _hackConfig.getHackCommand)();
  if (command === '') {
    return null;
  }

  var configDir = yield (0, _hackConfig.findHackConfigDir)(filePath);
  if (configDir == null) {
    return null;
  }

  var connection = connections.get(configDir);
  if (connection == null) {
    logger.info('Creating new hack conncection for ' + configDir);
    var startServerResult = yield (0, _commons.checkOutput)(command, ['start', configDir]);
    logger.info('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
    if (startServerResult.exitCode !== 0) {
      return null;
    }
    var _process = yield (0, _commons.safeSpawn)(command, ['ide', configDir]);
    (0, _commons.observeStream)(_process.stdout).subscribe(function (text) {
      logger.info('Hack ide stdout: ' + text);
    });
    (0, _commons.observeStream)(_process.stderr).subscribe(function (text) {
      logger.info('Hack ide stderr: ' + text);
    });
    connection = new HackConnection(configDir, _process);
    connections.set(configDir, connection);
  }
  return connection;
}

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
);

var callHHClientUsingConnection = _asyncToGenerator(function* (args, processInput, filePath) {

  var connection = yield getHackConnection(filePath);
  if (connection == null) {
    return null;
  }

  if (processInput != null) {
    args.push(processInput);
  }
  var result = yield connection.call(args);
  return {
    hackRoot: connection.getRoot(),
    result: result
  };
});

exports.callHHClientUsingConnection = callHHClientUsingConnection;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commons = require('../../commons');

var _hackConfig = require('./hack-config');

var _HackRpc = require('./HackRpc');

var logger = require('../../logging').getLogger();

var HackConnection = (function () {
  function HackConnection(hhconfigPath, process) {
    var _this = this;

    _classCallCheck(this, HackConnection);

    this._hhconfigPath = hhconfigPath;
    this._process = process;
    this._rpc = new _HackRpc.HackRpc(new _HackRpc.StreamTransport(process.stdin, process.stdout));

    process.on('exit', function () {
      _this._process = null;
      _this.dispose();
    });
  }

  // Maps hack config dir to HackConnection

  _createClass(HackConnection, [{
    key: 'call',
    value: function call(args) {
      if (this._rpc == null) {
        throw new Error('Attempting to call on disposed hack connection.');
      }
      return this._rpc.call(args);
    }
  }, {
    key: 'getRoot',
    value: function getRoot() {
      return this._hhconfigPath;
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      logger.info('Disposing hack connection ' + this._hhconfigPath);
      if (this._rpc != null) {
        this._rpc.dispose();
        connections['delete'](this._hhconfigPath);
        if (this._process != null) {
          this._process.kill();
          this._process = null;
        }
      }
    }
  }, {
    key: 'isDisposed',
    value: function isDisposed() {
      return this._rpc == null;
    }
  }]);

  return HackConnection;
})();

var connections = new Map();
//# sourceMappingURL=data:application/json;base64,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ZWN0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgc2FmZVNwYXduLFxuICBvYnNlcnZlU3RyZWFtLFxuICBjaGVja091dHB1dCxcbn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldEhhY2tDb21tYW5kLCBmaW5kSGFja0NvbmZpZ0Rpcn0gZnJvbSAnLi9oYWNrLWNvbmZpZyc7XG5pbXBvcnQge1N0cmVhbVRyYW5zcG9ydCwgSGFja1JwY30gZnJvbSAnLi9IYWNrUnBjJztcbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuY2xhc3MgSGFja0Nvbm5lY3Rpb24ge1xuICBfaGhjb25maWdQYXRoOiBzdHJpbmc7XG4gIF9wcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF9ycGM6ID9IYWNrUnBjO1xuXG4gIGNvbnN0cnVjdG9yKGhoY29uZmlnUGF0aDogc3RyaW5nLCBwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIHRoaXMuX2hoY29uZmlnUGF0aCA9IGhoY29uZmlnUGF0aDtcbiAgICB0aGlzLl9wcm9jZXNzID0gcHJvY2VzcztcbiAgICB0aGlzLl9ycGMgPSBuZXcgSGFja1JwYyhuZXcgU3RyZWFtVHJhbnNwb3J0KHByb2Nlc3Muc3RkaW4sIHByb2Nlc3Muc3Rkb3V0KSk7XG5cbiAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgdGhpcy5fcHJvY2VzcyA9IG51bGw7XG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGwoYXJnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8c3RyaW5nIHwgT2JqZWN0PiB7XG4gICAgaWYgKHRoaXMuX3JwYyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRpbmcgdG8gY2FsbCBvbiBkaXNwb3NlZCBoYWNrIGNvbm5lY3Rpb24uJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ycGMuY2FsbChhcmdzKTtcbiAgfVxuXG4gIGdldFJvb3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faGhjb25maWdQYXRoO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbyhgRGlzcG9zaW5nIGhhY2sgY29ubmVjdGlvbiAke3RoaXMuX2hoY29uZmlnUGF0aH1gKTtcbiAgICBpZiAodGhpcy5fcnBjICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3JwYy5kaXNwb3NlKCk7XG4gICAgICBjb25uZWN0aW9ucy5kZWxldGUodGhpcy5faGhjb25maWdQYXRoKTtcbiAgICAgIGlmICh0aGlzLl9wcm9jZXNzICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcHJvY2Vzcy5raWxsKCk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3MgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzRGlzcG9zZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3JwYyA9PSBudWxsO1xuICB9XG59XG5cbi8vIE1hcHMgaGFjayBjb25maWcgZGlyIHRvIEhhY2tDb25uZWN0aW9uXG5jb25zdCBjb25uZWN0aW9uczogTWFwPHN0cmluZywgSGFja0Nvbm5lY3Rpb24+ID0gbmV3IE1hcCgpO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRIYWNrQ29ubmVjdGlvbihmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/SGFja0Nvbm5lY3Rpb24+IHtcbiAgY29uc3QgY29tbWFuZCA9IGF3YWl0IGdldEhhY2tDb21tYW5kKCk7XG4gIGlmIChjb21tYW5kID09PSAnJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY29uZmlnRGlyID0gYXdhaXQgZmluZEhhY2tDb25maWdEaXIoZmlsZVBhdGgpO1xuICBpZiAoY29uZmlnRGlyID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBjb25uZWN0aW9uID0gY29ubmVjdGlvbnMuZ2V0KGNvbmZpZ0Rpcik7XG4gIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICBsb2dnZXIuaW5mbyhgQ3JlYXRpbmcgbmV3IGhhY2sgY29ubmNlY3Rpb24gZm9yICR7Y29uZmlnRGlyfWApO1xuICAgIGNvbnN0IHN0YXJ0U2VydmVyUmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoY29tbWFuZCwgWydzdGFydCcsIGNvbmZpZ0Rpcl0pO1xuICAgIGxvZ2dlci5pbmZvKFxuICAgICAgYEhhY2sgY29ubmVjdGlvbiBzdGFydCBzZXJ2ZXIgcmVzdWx0czpcXG4ke0pTT04uc3RyaW5naWZ5KHN0YXJ0U2VydmVyUmVzdWx0LCBudWxsLCAyKX1cXG5gKTtcbiAgICBpZiAoc3RhcnRTZXJ2ZXJSZXN1bHQuZXhpdENvZGUgIT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBwcm9jZXNzID0gYXdhaXQgc2FmZVNwYXduKGNvbW1hbmQsIFsnaWRlJywgY29uZmlnRGlyXSk7XG4gICAgb2JzZXJ2ZVN0cmVhbShwcm9jZXNzLnN0ZG91dCkuc3Vic2NyaWJlKHRleHQgPT4ge1xuICAgICAgbG9nZ2VyLmluZm8oYEhhY2sgaWRlIHN0ZG91dDogJHt0ZXh0fWApO1xuICAgIH0pO1xuICAgIG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRlcnIpLnN1YnNjcmliZSh0ZXh0ID0+IHtcbiAgICAgIGxvZ2dlci5pbmZvKGBIYWNrIGlkZSBzdGRlcnI6ICR7dGV4dH1gKTtcbiAgICB9KTtcbiAgICBjb25uZWN0aW9uID0gbmV3IEhhY2tDb25uZWN0aW9uKGNvbmZpZ0RpciwgcHJvY2Vzcyk7XG4gICAgY29ubmVjdGlvbnMuc2V0KGNvbmZpZ0RpciwgY29ubmVjdGlvbik7XG4gIH1cbiAgcmV0dXJuIGNvbm5lY3Rpb247XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgaGhfY2xpZW50IHdpdGggcHJvcGVyIGFyZ3VtZW50cyByZXR1cm5pbmcgdGhlIHJlc3VsdCBzdHJpbmcgb3IganNvbiBvYmplY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYWxsSEhDbGllbnRVc2luZ0Nvbm5lY3Rpb24oXG4gYXJnczogQXJyYXk8c3RyaW5nPixcbiBwcm9jZXNzSW5wdXQ6ID9zdHJpbmcsXG4gZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8P3toYWNrUm9vdDogc3RyaW5nOyByZXN1bHQ6IHN0cmluZyB8IE9iamVjdH0+IHtcblxuICBjb25zdCBjb25uZWN0aW9uOiA/SGFja0Nvbm5lY3Rpb24gPSBhd2FpdCBnZXRIYWNrQ29ubmVjdGlvbihmaWxlUGF0aCk7XG4gIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGlmIChwcm9jZXNzSW5wdXQgIT0gbnVsbCkge1xuICAgIGFyZ3MucHVzaChwcm9jZXNzSW5wdXQpO1xuICB9XG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNvbm5lY3Rpb24uY2FsbChhcmdzKTtcbiAgcmV0dXJuIHtcbiAgICBoYWNrUm9vdDogY29ubmVjdGlvbi5nZXRSb290KCksXG4gICAgcmVzdWx0LFxuICB9O1xufVxuIl19