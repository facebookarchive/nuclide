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
    connection = createConnection(command, configDir);
    connections.set(configDir, connection);
    connection.then(function (result) {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        connections['delete'](configDir);
      }
    });
  }
  return connection;
});

var createConnection = _asyncToGenerator(function* (command, configDir) {
  logger.info('Creating new hack connection for ' + configDir + ': ' + command);
  logger.info('Current PATH: ' + process.env.PATH);
  var startServerResult = yield (0, _nuclideCommons.checkOutput)(command, ['start', configDir]);
  logger.info('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
  if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  var childProcess = yield (0, _nuclideCommons.safeSpawn)(command, ['ide', configDir]);
  (0, _nuclideCommons.observeStream)(childProcess.stdout).subscribe(function (text) {
    logger.info('Hack ide stdout: ' + text);
  });
  (0, _nuclideCommons.observeStream)(childProcess.stderr).subscribe(function (text) {
    logger.info('Hack ide stderr: ' + text);
  });
  return new HackConnection(configDir, childProcess);
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

var _nuclideCommons = require('../../nuclide-commons');

var _hackConfig = require('./hack-config');

var _HackRpc = require('./HackRpc');

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
var HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

var logger = require('../../nuclide-logging').getLogger();

var HackConnection = (function () {
  function HackConnection(hhconfigPath, process) {
    var _this = this;

    _classCallCheck(this, HackConnection);

    this._hhconfigPath = hhconfigPath;
    this._process = process;
    this._rpc = new _HackRpc.HackRpc(new _HackRpc.StreamTransport(process.stdin, process.stdout));

    process.on('exit', function (code, signal) {
      logger.info('Hack ide process exited with ' + code + ', ' + signal);
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
//# sourceMappingURL=data:application/json;base64,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UztBQUNkLFlBQU0sQ0FBQyxJQUFJLGdDQUE4QixJQUFJLENBQUMsYUFBYSxDQUFHLENBQUM7QUFDL0QsVUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRTtBQUNyQixZQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLG1CQUFXLFVBQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDdkMsWUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUN6QixjQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3JCLGNBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1NBQ3RCO09BQ0Y7S0FDRjs7O1dBRVMsc0JBQVk7QUFDcEIsYUFBTyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQztLQUMxQjs7O1NBMUNHLGNBQWM7OztBQThDcEIsSUFBTSxXQUFrRCxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiSGFja0Nvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBzYWZlU3Bhd24sXG4gIG9ic2VydmVTdHJlYW0sXG4gIGNoZWNrT3V0cHV0LFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRIYWNrQ29tbWFuZCwgZmluZEhhY2tDb25maWdEaXJ9IGZyb20gJy4vaGFjay1jb25maWcnO1xuaW1wb3J0IHtTdHJlYW1UcmFuc3BvcnQsIEhhY2tScGN9IGZyb20gJy4vSGFja1JwYyc7XG5cbi8vIEZyb20gaHR0cHM6Ly9yZXZpZXdzLmZhY2Vib29rLm5ldC9kaWZmdXNpb24vSEhWTS9icm93c2UvbWFzdGVyL2hwaHAvaGFjay9zcmMvdXRpbHMvZXhpdF9zdGF0dXMubWxcbmNvbnN0IEhBQ0tfU0VSVkVSX0FMUkVBRFlfRVhJU1RTX0VYSVRfQ09ERSA9IDc3O1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuY2xhc3MgSGFja0Nvbm5lY3Rpb24ge1xuICBfaGhjb25maWdQYXRoOiBzdHJpbmc7XG4gIF9wcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF9ycGM6ID9IYWNrUnBjO1xuXG4gIGNvbnN0cnVjdG9yKGhoY29uZmlnUGF0aDogc3RyaW5nLCBwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIHRoaXMuX2hoY29uZmlnUGF0aCA9IGhoY29uZmlnUGF0aDtcbiAgICB0aGlzLl9wcm9jZXNzID0gcHJvY2VzcztcbiAgICB0aGlzLl9ycGMgPSBuZXcgSGFja1JwYyhuZXcgU3RyZWFtVHJhbnNwb3J0KHByb2Nlc3Muc3RkaW4sIHByb2Nlc3Muc3Rkb3V0KSk7XG5cbiAgICBwcm9jZXNzLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgbG9nZ2VyLmluZm8oYEhhY2sgaWRlIHByb2Nlc3MgZXhpdGVkIHdpdGggJHtjb2RlfSwgJHtzaWduYWx9YCk7XG4gICAgICB0aGlzLl9wcm9jZXNzID0gbnVsbDtcbiAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgY2FsbChhcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxzdHJpbmcgfCBPYmplY3Q+IHtcbiAgICBpZiAodGhpcy5fcnBjID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGluZyB0byBjYWxsIG9uIGRpc3Bvc2VkIGhhY2sgY29ubmVjdGlvbi4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3JwYy5jYWxsKGFyZ3MpO1xuICB9XG5cbiAgZ2V0Um9vdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9oaGNvbmZpZ1BhdGg7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGxvZ2dlci5pbmZvKGBEaXNwb3NpbmcgaGFjayBjb25uZWN0aW9uICR7dGhpcy5faGhjb25maWdQYXRofWApO1xuICAgIGlmICh0aGlzLl9ycGMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcnBjLmRpc3Bvc2UoKTtcbiAgICAgIGNvbm5lY3Rpb25zLmRlbGV0ZSh0aGlzLl9oaGNvbmZpZ1BhdGgpO1xuICAgICAgaWYgKHRoaXMuX3Byb2Nlc3MgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wcm9jZXNzLmtpbGwoKTtcbiAgICAgICAgdGhpcy5fcHJvY2VzcyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaXNEaXNwb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fcnBjID09IG51bGw7XG4gIH1cbn1cblxuLy8gTWFwcyBoYWNrIGNvbmZpZyBkaXIgdG8gSGFja0Nvbm5lY3Rpb25cbmNvbnN0IGNvbm5lY3Rpb25zOiBNYXA8c3RyaW5nLCBQcm9taXNlPD9IYWNrQ29ubmVjdGlvbj4+ID0gbmV3IE1hcCgpO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRIYWNrQ29ubmVjdGlvbihmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/SGFja0Nvbm5lY3Rpb24+IHtcbiAgY29uc3QgY29tbWFuZCA9IGF3YWl0IGdldEhhY2tDb21tYW5kKCk7XG4gIGlmIChjb21tYW5kID09PSAnJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY29uZmlnRGlyID0gYXdhaXQgZmluZEhhY2tDb25maWdEaXIoZmlsZVBhdGgpO1xuICBpZiAoY29uZmlnRGlyID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBjb25uZWN0aW9uID0gY29ubmVjdGlvbnMuZ2V0KGNvbmZpZ0Rpcik7XG4gIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICBjb25uZWN0aW9uID0gY3JlYXRlQ29ubmVjdGlvbihjb21tYW5kLCBjb25maWdEaXIpO1xuICAgIGNvbm5lY3Rpb25zLnNldChjb25maWdEaXIsIGNvbm5lY3Rpb24pO1xuICAgIGNvbm5lY3Rpb24udGhlbihyZXN1bHQgPT4ge1xuICAgICAgLy8gSWYgd2UgZmFpbCB0byBjb25uZWN0IHRvIGhhY2ssIHRoZW4gcmV0cnkgb24gbmV4dCByZXF1ZXN0LlxuICAgICAgaWYgKHJlc3VsdCA9PSBudWxsKSB7XG4gICAgICAgIGNvbm5lY3Rpb25zLmRlbGV0ZShjb25maWdEaXIpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBjb25uZWN0aW9uO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVDb25uZWN0aW9uKGNvbW1hbmQ6IHN0cmluZywgY29uZmlnRGlyOiBzdHJpbmcpOiBQcm9taXNlPD9IYWNrQ29ubmVjdGlvbj4ge1xuICBsb2dnZXIuaW5mbyhgQ3JlYXRpbmcgbmV3IGhhY2sgY29ubmVjdGlvbiBmb3IgJHtjb25maWdEaXJ9OiAke2NvbW1hbmR9YCk7XG4gIGxvZ2dlci5pbmZvKGBDdXJyZW50IFBBVEg6ICR7cHJvY2Vzcy5lbnYuUEFUSH1gKTtcbiAgY29uc3Qgc3RhcnRTZXJ2ZXJSZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBbJ3N0YXJ0JywgY29uZmlnRGlyXSk7XG4gIGxvZ2dlci5pbmZvKFxuICAgIGBIYWNrIGNvbm5lY3Rpb24gc3RhcnQgc2VydmVyIHJlc3VsdHM6XFxuJHtKU09OLnN0cmluZ2lmeShzdGFydFNlcnZlclJlc3VsdCwgbnVsbCwgMil9XFxuYCk7XG4gIGlmIChzdGFydFNlcnZlclJlc3VsdC5leGl0Q29kZSAhPT0gMCAmJlxuICAgICAgc3RhcnRTZXJ2ZXJSZXN1bHQuZXhpdENvZGUgIT09IEhBQ0tfU0VSVkVSX0FMUkVBRFlfRVhJU1RTX0VYSVRfQ09ERSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGNoaWxkUHJvY2VzcyA9IGF3YWl0IHNhZmVTcGF3bihjb21tYW5kLCBbJ2lkZScsIGNvbmZpZ0Rpcl0pO1xuICBvYnNlcnZlU3RyZWFtKGNoaWxkUHJvY2Vzcy5zdGRvdXQpLnN1YnNjcmliZSh0ZXh0ID0+IHtcbiAgICBsb2dnZXIuaW5mbyhgSGFjayBpZGUgc3Rkb3V0OiAke3RleHR9YCk7XG4gIH0pO1xuICBvYnNlcnZlU3RyZWFtKGNoaWxkUHJvY2Vzcy5zdGRlcnIpLnN1YnNjcmliZSh0ZXh0ID0+IHtcbiAgICBsb2dnZXIuaW5mbyhgSGFjayBpZGUgc3RkZXJyOiAke3RleHR9YCk7XG4gIH0pO1xuICByZXR1cm4gbmV3IEhhY2tDb25uZWN0aW9uKGNvbmZpZ0RpciwgY2hpbGRQcm9jZXNzKTtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBoaF9jbGllbnQgd2l0aCBwcm9wZXIgYXJndW1lbnRzIHJldHVybmluZyB0aGUgcmVzdWx0IHN0cmluZyBvciBqc29uIG9iamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGxISENsaWVudFVzaW5nQ29ubmVjdGlvbihcbiBhcmdzOiBBcnJheTxhbnk+LFxuIHByb2Nlc3NJbnB1dDogP3N0cmluZyxcbiBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/e2hhY2tSb290OiBzdHJpbmc7IHJlc3VsdDogc3RyaW5nIHwgT2JqZWN0fT4ge1xuXG4gIGNvbnN0IGNvbm5lY3Rpb246ID9IYWNrQ29ubmVjdGlvbiA9IGF3YWl0IGdldEhhY2tDb25uZWN0aW9uKGZpbGVQYXRoKTtcbiAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHByb2Nlc3NJbnB1dCAhPSBudWxsKSB7XG4gICAgYXJncy5wdXNoKHByb2Nlc3NJbnB1dCk7XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY29ubmVjdGlvbi5jYWxsKGFyZ3MpO1xuICByZXR1cm4ge1xuICAgIGhhY2tSb290OiBjb25uZWN0aW9uLmdldFJvb3QoKSxcbiAgICByZXN1bHQsXG4gIH07XG59XG4iXX0=