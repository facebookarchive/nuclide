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
    var startServerResult = yield (0, _nuclideCommons.checkOutput)(command, ['start', configDir]);
    logger.info('Hack connection start server results:\n' + JSON.stringify(startServerResult, null, 2) + '\n');
    if (startServerResult.exitCode !== 0 && startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
      return null;
    }
    var _process = yield (0, _nuclideCommons.safeSpawn)(command, ['ide', configDir]);
    (0, _nuclideCommons.observeStream)(_process.stdout).subscribe(function (text) {
      logger.info('Hack ide stdout: ' + text);
    });
    (0, _nuclideCommons.observeStream)(_process.stderr).subscribe(function (text) {
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
//# sourceMappingURL=data:application/json;base64,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O1NBekNHLGNBQWM7OztBQTZDcEIsSUFBTSxXQUF3QyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMiLCJmaWxlIjoiSGFja0Nvbm5lY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1xuICBzYWZlU3Bhd24sXG4gIG9ic2VydmVTdHJlYW0sXG4gIGNoZWNrT3V0cHV0LFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRIYWNrQ29tbWFuZCwgZmluZEhhY2tDb25maWdEaXJ9IGZyb20gJy4vaGFjay1jb25maWcnO1xuaW1wb3J0IHtTdHJlYW1UcmFuc3BvcnQsIEhhY2tScGN9IGZyb20gJy4vSGFja1JwYyc7XG5cbi8vIEZyb20gaHR0cHM6Ly9yZXZpZXdzLmZhY2Vib29rLm5ldC9kaWZmdXNpb24vSEhWTS9icm93c2UvbWFzdGVyL2hwaHAvaGFjay9zcmMvdXRpbHMvZXhpdF9zdGF0dXMubWxcbmNvbnN0IEhBQ0tfU0VSVkVSX0FMUkVBRFlfRVhJU1RTX0VYSVRfQ09ERSA9IDc3O1xuXG5jb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcblxuY2xhc3MgSGFja0Nvbm5lY3Rpb24ge1xuICBfaGhjb25maWdQYXRoOiBzdHJpbmc7XG4gIF9wcm9jZXNzOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF9ycGM6ID9IYWNrUnBjO1xuXG4gIGNvbnN0cnVjdG9yKGhoY29uZmlnUGF0aDogc3RyaW5nLCBwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIHRoaXMuX2hoY29uZmlnUGF0aCA9IGhoY29uZmlnUGF0aDtcbiAgICB0aGlzLl9wcm9jZXNzID0gcHJvY2VzcztcbiAgICB0aGlzLl9ycGMgPSBuZXcgSGFja1JwYyhuZXcgU3RyZWFtVHJhbnNwb3J0KHByb2Nlc3Muc3RkaW4sIHByb2Nlc3Muc3Rkb3V0KSk7XG5cbiAgICBwcm9jZXNzLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgdGhpcy5fcHJvY2VzcyA9IG51bGw7XG4gICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGwoYXJnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8c3RyaW5nIHwgT2JqZWN0PiB7XG4gICAgaWYgKHRoaXMuX3JwYyA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F0dGVtcHRpbmcgdG8gY2FsbCBvbiBkaXNwb3NlZCBoYWNrIGNvbm5lY3Rpb24uJyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ycGMuY2FsbChhcmdzKTtcbiAgfVxuXG4gIGdldFJvb3QoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faGhjb25maWdQYXRoO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBsb2dnZXIuaW5mbyhgRGlzcG9zaW5nIGhhY2sgY29ubmVjdGlvbiAke3RoaXMuX2hoY29uZmlnUGF0aH1gKTtcbiAgICBpZiAodGhpcy5fcnBjICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3JwYy5kaXNwb3NlKCk7XG4gICAgICBjb25uZWN0aW9ucy5kZWxldGUodGhpcy5faGhjb25maWdQYXRoKTtcbiAgICAgIGlmICh0aGlzLl9wcm9jZXNzICE9IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcHJvY2Vzcy5raWxsKCk7XG4gICAgICAgIHRoaXMuX3Byb2Nlc3MgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlzRGlzcG9zZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX3JwYyA9PSBudWxsO1xuICB9XG59XG5cbi8vIE1hcHMgaGFjayBjb25maWcgZGlyIHRvIEhhY2tDb25uZWN0aW9uXG5jb25zdCBjb25uZWN0aW9uczogTWFwPHN0cmluZywgSGFja0Nvbm5lY3Rpb24+ID0gbmV3IE1hcCgpO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRIYWNrQ29ubmVjdGlvbihmaWxlUGF0aDogc3RyaW5nKTogUHJvbWlzZTw/SGFja0Nvbm5lY3Rpb24+IHtcbiAgY29uc3QgY29tbWFuZCA9IGF3YWl0IGdldEhhY2tDb21tYW5kKCk7XG4gIGlmIChjb21tYW5kID09PSAnJykge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgY29uc3QgY29uZmlnRGlyID0gYXdhaXQgZmluZEhhY2tDb25maWdEaXIoZmlsZVBhdGgpO1xuICBpZiAoY29uZmlnRGlyID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxldCBjb25uZWN0aW9uID0gY29ubmVjdGlvbnMuZ2V0KGNvbmZpZ0Rpcik7XG4gIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICBsb2dnZXIuaW5mbyhgQ3JlYXRpbmcgbmV3IGhhY2sgY29ubmVjdGlvbiBmb3IgJHtjb25maWdEaXJ9YCk7XG4gICAgY29uc3Qgc3RhcnRTZXJ2ZXJSZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dChjb21tYW5kLCBbJ3N0YXJ0JywgY29uZmlnRGlyXSk7XG4gICAgbG9nZ2VyLmluZm8oXG4gICAgICBgSGFjayBjb25uZWN0aW9uIHN0YXJ0IHNlcnZlciByZXN1bHRzOlxcbiR7SlNPTi5zdHJpbmdpZnkoc3RhcnRTZXJ2ZXJSZXN1bHQsIG51bGwsIDIpfVxcbmApO1xuICAgIGlmIChzdGFydFNlcnZlclJlc3VsdC5leGl0Q29kZSAhPT0gMCAmJlxuICAgICAgICBzdGFydFNlcnZlclJlc3VsdC5leGl0Q29kZSAhPT0gSEFDS19TRVJWRVJfQUxSRUFEWV9FWElTVFNfRVhJVF9DT0RFKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcHJvY2VzcyA9IGF3YWl0IHNhZmVTcGF3bihjb21tYW5kLCBbJ2lkZScsIGNvbmZpZ0Rpcl0pO1xuICAgIG9ic2VydmVTdHJlYW0ocHJvY2Vzcy5zdGRvdXQpLnN1YnNjcmliZSh0ZXh0ID0+IHtcbiAgICAgIGxvZ2dlci5pbmZvKGBIYWNrIGlkZSBzdGRvdXQ6ICR7dGV4dH1gKTtcbiAgICB9KTtcbiAgICBvYnNlcnZlU3RyZWFtKHByb2Nlc3Muc3RkZXJyKS5zdWJzY3JpYmUodGV4dCA9PiB7XG4gICAgICBsb2dnZXIuaW5mbyhgSGFjayBpZGUgc3RkZXJyOiAke3RleHR9YCk7XG4gICAgfSk7XG4gICAgY29ubmVjdGlvbiA9IG5ldyBIYWNrQ29ubmVjdGlvbihjb25maWdEaXIsIHByb2Nlc3MpO1xuICAgIGNvbm5lY3Rpb25zLnNldChjb25maWdEaXIsIGNvbm5lY3Rpb24pO1xuICB9XG4gIHJldHVybiBjb25uZWN0aW9uO1xufVxuXG4vKipcbiAqIEV4ZWN1dGVzIGhoX2NsaWVudCB3aXRoIHByb3BlciBhcmd1bWVudHMgcmV0dXJuaW5nIHRoZSByZXN1bHQgc3RyaW5nIG9yIGpzb24gb2JqZWN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FsbEhIQ2xpZW50VXNpbmdDb25uZWN0aW9uKFxuIGFyZ3M6IEFycmF5PHN0cmluZz4sXG4gcHJvY2Vzc0lucHV0OiA/c3RyaW5nLFxuIGZpbGVQYXRoOiBzdHJpbmcpOiBQcm9taXNlPD97aGFja1Jvb3Q6IHN0cmluZzsgcmVzdWx0OiBzdHJpbmcgfCBPYmplY3R9PiB7XG5cbiAgY29uc3QgY29ubmVjdGlvbjogP0hhY2tDb25uZWN0aW9uID0gYXdhaXQgZ2V0SGFja0Nvbm5lY3Rpb24oZmlsZVBhdGgpO1xuICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBpZiAocHJvY2Vzc0lucHV0ICE9IG51bGwpIHtcbiAgICBhcmdzLnB1c2gocHJvY2Vzc0lucHV0KTtcbiAgfVxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBjb25uZWN0aW9uLmNhbGwoYXJncyk7XG4gIHJldHVybiB7XG4gICAgaGFja1Jvb3Q6IGNvbm5lY3Rpb24uZ2V0Um9vdCgpLFxuICAgIHJlc3VsdCxcbiAgfTtcbn1cbiJdfQ==