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
    logger.info('Creating new hack connection for ' + configDir);
    var startServerResult = yield (0, _commons.checkOutput)(command, ['start', configDir]);
    logger.info('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
    if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
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

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
var HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

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
//# sourceMappingURL=data:application/json;base64,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Q0csY0FBYzs7O0FBNkNwQixJQUFNLFdBQXdDLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyIsImZpbGUiOiJIYWNrQ29ubmVjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7XG4gIHNhZmVTcGF3bixcbiAgb2JzZXJ2ZVN0cmVhbSxcbiAgY2hlY2tPdXRwdXQsXG59IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRIYWNrQ29tbWFuZCwgZmluZEhhY2tDb25maWdEaXJ9IGZyb20gJy4vaGFjay1jb25maWcnO1xuaW1wb3J0IHtTdHJlYW1UcmFuc3BvcnQsIEhhY2tScGN9IGZyb20gJy4vSGFja1JwYyc7XG5cbi8vIEZyb20gaHR0cHM6Ly9yZXZpZXdzLmZhY2Vib29rLm5ldC9kaWZmdXNpb24vSEhWTS9icm93c2UvbWFzdGVyL2hwaHAvaGFjay9zcmMvdXRpbHMvZXhpdF9zdGF0dXMubWxcbmNvbnN0IEhBQ0tfU0VSVkVSX0FMUkVBRFlfRVhJU1RTX0VYSVRfQ09ERSA9IDc3O1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG5cbmNsYXNzIEhhY2tDb25uZWN0aW9uIHtcbiAgX2hoY29uZmlnUGF0aDogc3RyaW5nO1xuICBfcHJvY2VzczogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBfcnBjOiA/SGFja1JwYztcblxuICBjb25zdHJ1Y3RvcihoaGNvbmZpZ1BhdGg6IHN0cmluZywgcHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MpIHtcbiAgICB0aGlzLl9oaGNvbmZpZ1BhdGggPSBoaGNvbmZpZ1BhdGg7XG4gICAgdGhpcy5fcHJvY2VzcyA9IHByb2Nlc3M7XG4gICAgdGhpcy5fcnBjID0gbmV3IEhhY2tScGMobmV3IFN0cmVhbVRyYW5zcG9ydChwcm9jZXNzLnN0ZGluLCBwcm9jZXNzLnN0ZG91dCkpO1xuXG4gICAgcHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHtcbiAgICAgIHRoaXMuX3Byb2Nlc3MgPSBudWxsO1xuICAgICAgdGhpcy5kaXNwb3NlKCk7XG4gICAgfSk7XG4gIH1cblxuICBjYWxsKGFyZ3M6IEFycmF5PHN0cmluZz4pOiBQcm9taXNlPHN0cmluZyB8IE9iamVjdD4ge1xuICAgIGlmICh0aGlzLl9ycGMgPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0aW5nIHRvIGNhbGwgb24gZGlzcG9zZWQgaGFjayBjb25uZWN0aW9uLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcnBjLmNhbGwoYXJncyk7XG4gIH1cblxuICBnZXRSb290KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2hoY29uZmlnUGF0aDtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgbG9nZ2VyLmluZm8oYERpc3Bvc2luZyBoYWNrIGNvbm5lY3Rpb24gJHt0aGlzLl9oaGNvbmZpZ1BhdGh9YCk7XG4gICAgaWYgKHRoaXMuX3JwYyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9ycGMuZGlzcG9zZSgpO1xuICAgICAgY29ubmVjdGlvbnMuZGVsZXRlKHRoaXMuX2hoY29uZmlnUGF0aCk7XG4gICAgICBpZiAodGhpcy5fcHJvY2VzcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3Mua2lsbCgpO1xuICAgICAgICB0aGlzLl9wcm9jZXNzID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBpc0Rpc3Bvc2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9ycGMgPT0gbnVsbDtcbiAgfVxufVxuXG4vLyBNYXBzIGhhY2sgY29uZmlnIGRpciB0byBIYWNrQ29ubmVjdGlvblxuY29uc3QgY29ubmVjdGlvbnM6IE1hcDxzdHJpbmcsIEhhY2tDb25uZWN0aW9uPiA9IG5ldyBNYXAoKTtcblxuYXN5bmMgZnVuY3Rpb24gZ2V0SGFja0Nvbm5lY3Rpb24oZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8P0hhY2tDb25uZWN0aW9uPiB7XG4gIGNvbnN0IGNvbW1hbmQgPSBhd2FpdCBnZXRIYWNrQ29tbWFuZCgpO1xuICBpZiAoY29tbWFuZCA9PT0gJycpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IGNvbmZpZ0RpciA9IGF3YWl0IGZpbmRIYWNrQ29uZmlnRGlyKGZpbGVQYXRoKTtcbiAgaWYgKGNvbmZpZ0RpciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBsZXQgY29ubmVjdGlvbiA9IGNvbm5lY3Rpb25zLmdldChjb25maWdEaXIpO1xuICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgbG9nZ2VyLmluZm8oYENyZWF0aW5nIG5ldyBoYWNrIGNvbm5lY3Rpb24gZm9yICR7Y29uZmlnRGlyfWApO1xuICAgIGNvbnN0IHN0YXJ0U2VydmVyUmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoY29tbWFuZCwgWydzdGFydCcsIGNvbmZpZ0Rpcl0pO1xuICAgIGxvZ2dlci5pbmZvKFxuICAgICAgYEhhY2sgY29ubmVjdGlvbiBzdGFydCBzZXJ2ZXIgcmVzdWx0czpcXG4ke0pTT04uc3RyaW5naWZ5KHN0YXJ0U2VydmVyUmVzdWx0LCBudWxsLCAyKX1cXG5gKTtcbiAgICBpZiAoc3RhcnRTZXJ2ZXJSZXN1bHQuZXhpdENvZGUgIT09IDAgJiZcbiAgICAgICAgc3RhcnRTZXJ2ZXJSZXN1bHQuZXhpdENvZGUgIT09IEhBQ0tfU0VSVkVSX0FMUkVBRFlfRVhJU1RTX0VYSVRfQ09ERSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHByb2Nlc3MgPSBhd2FpdCBzYWZlU3Bhd24oY29tbWFuZCwgWydpZGUnLCBjb25maWdEaXJdKTtcbiAgICBvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3Rkb3V0KS5zdWJzY3JpYmUodGV4dCA9PiB7XG4gICAgICBsb2dnZXIuaW5mbyhgSGFjayBpZGUgc3Rkb3V0OiAke3RleHR9YCk7XG4gICAgfSk7XG4gICAgb2JzZXJ2ZVN0cmVhbShwcm9jZXNzLnN0ZGVycikuc3Vic2NyaWJlKHRleHQgPT4ge1xuICAgICAgbG9nZ2VyLmluZm8oYEhhY2sgaWRlIHN0ZGVycjogJHt0ZXh0fWApO1xuICAgIH0pO1xuICAgIGNvbm5lY3Rpb24gPSBuZXcgSGFja0Nvbm5lY3Rpb24oY29uZmlnRGlyLCBwcm9jZXNzKTtcbiAgICBjb25uZWN0aW9ucy5zZXQoY29uZmlnRGlyLCBjb25uZWN0aW9uKTtcbiAgfVxuICByZXR1cm4gY29ubmVjdGlvbjtcbn1cblxuLyoqXG4gKiBFeGVjdXRlcyBoaF9jbGllbnQgd2l0aCBwcm9wZXIgYXJndW1lbnRzIHJldHVybmluZyB0aGUgcmVzdWx0IHN0cmluZyBvciBqc29uIG9iamVjdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGxISENsaWVudFVzaW5nQ29ubmVjdGlvbihcbiBhcmdzOiBBcnJheTxzdHJpbmc+LFxuIHByb2Nlc3NJbnB1dDogP3N0cmluZyxcbiBmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/e2hhY2tSb290OiBzdHJpbmc7IHJlc3VsdDogc3RyaW5nIHwgT2JqZWN0fT4ge1xuXG4gIGNvbnN0IGNvbm5lY3Rpb246ID9IYWNrQ29ubmVjdGlvbiA9IGF3YWl0IGdldEhhY2tDb25uZWN0aW9uKGZpbGVQYXRoKTtcbiAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgaWYgKHByb2Nlc3NJbnB1dCAhPSBudWxsKSB7XG4gICAgYXJncy5wdXNoKHByb2Nlc3NJbnB1dCk7XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY29ubmVjdGlvbi5jYWxsKGFyZ3MpO1xuICByZXR1cm4ge1xuICAgIGhhY2tSb290OiBjb25uZWN0aW9uLmdldFJvb3QoKSxcbiAgICByZXN1bHQsXG4gIH07XG59XG4iXX0=