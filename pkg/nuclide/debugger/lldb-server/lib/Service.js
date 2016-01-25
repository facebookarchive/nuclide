var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getProcessInfoList = _asyncToGenerator(function* () {
  var _require = require('../../../commons');

  var asyncExecute = _require.asyncExecute;

  var result = yield asyncExecute('ps', ['-e', '-o', 'pid,comm'], {});
  // $FlowFixMe: cryptic error about Promises
  return result.stdout.toString().split('\n').slice(1).map(function (line) {
    var words = line.trim().split(' ');
    var pid = Number(words[0]);
    var command = words.slice(1).join(' ');
    var components = command.split('/');
    var name = components[components.length - 1];
    return new ProcessInfo(pid, command, name);
  }).filter(function (item) {
    return !item.displayString().startsWith('(') || !item.displayString().endsWith(')');
  });
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('../../utils');

var _atom = require('atom');

var _logging = require('../../../logging');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var logger = (0, _logging.getLogger)();

var DebuggerProcess = (function () {

  /**
   * @param proc  a process running the debugger/lldb script.
   */

  function DebuggerProcess(proc) {
    _classCallCheck(this, DebuggerProcess);

    this._emitter = new _atom.Emitter();
    this._proc = proc;

    this._websocketAddress = new Promise(function (resolve, reject) {
      // Async handle parsing websocket address from the stdout of the child.
      proc.stdout.on('data', function (chunk) {
        // stdout should hopefully be set to line-buffering, in which case the

        var block = chunk.toString();
        logger.debug('child process(' + proc.pid + ') stdout: ' + block);
        var result = /Port: (\d+)\n/.exec(block);
        if (result != null) {
          // $FlowFixMe
          proc.stdout.removeAllListeners(['data', 'error', 'exit']);
          resolve('ws=localhost:' + result[1] + '/');
        }
      });
      proc.stderr.on('data', function (chunk) {
        logger.error('child process(' + proc.pid + ') stderr: ' + chunk.toString());
      });
      proc.on('error', function () {
        reject('child_process error');
      });
      proc.on('exit', function () {
        reject('child_process exit');
      });
    });
  }

  _createClass(DebuggerProcess, [{
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      // TODO(jeffreytan): Figure out if/when this event should be dispatched.
      return this._emitter.on('session-end', callback);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._emitter.dispose();
      this._proc.kill();
    }
  }, {
    key: 'getWebsocketAddress',
    value: function getWebsocketAddress() {
      return this._websocketAddress;
    }
  }]);

  return DebuggerProcess;
})();

var ProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(ProcessInfo, _DebuggerProcessInfo);

  function ProcessInfo(pid, command, name) {
    _classCallCheck(this, ProcessInfo);

    _get(Object.getPrototypeOf(ProcessInfo.prototype), 'constructor', this).call(this, 'lldb');

    this._pid = pid;
    this._name = name;
    this._command = command;
  }

  _createClass(ProcessInfo, [{
    key: 'attach',
    value: function attach() {
      var lldbPath = _path2['default'].join(__dirname, '../scripts/main.py');
      var args = [lldbPath, '-p', String(this._pid)];
      if (this._basepath) {
        args.push('--basepath', this._basepath);
      }
      var proc = _child_process2['default'].spawn('python', args);
      return new DebuggerProcess(proc);
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof ProcessInfo);
      return this._name === other._name ? this._pid - other._pid : this._name < other._name ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._name + '(' + this._pid + ')';
    }
  }, {
    key: 'pid',
    get: function get() {
      return this._pid;
    }
  }, {
    key: 'basepath',
    set: function set(basepath) {
      this._basepath = basepath;
    }
  }]);

  return ProcessInfo;
})(_utils.DebuggerProcessInfo);

module.exports = {
  name: 'lldb',
  getProcessInfoList: getProcessInfoList
};
// string would come on one line.

// Execution parameter.
//# sourceMappingURL=data:application/json;base64,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TSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ2pELFVBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixZQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7T0FDekM7QUFDRCxVQUFNLElBQUksR0FBRywyQkFBYyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2pELGFBQU8sSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEM7OztXQUVhLHdCQUFDLEtBQTJDLEVBQVU7QUFDbEUsK0JBQVUsS0FBSyxZQUFZLFdBQVcsQ0FBQyxDQUFDO0FBQ3hDLGFBQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBSyxHQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQ3ZCLEFBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN6Qzs7O1dBRVkseUJBQVc7QUFDdEIsYUFBTyxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztLQUMzQzs7O1NBM0JNLGVBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ2xCOzs7U0FFVyxhQUFDLFFBQWdCLEVBQVE7QUFDbkMsVUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7S0FDM0I7OztTQXRCRyxXQUFXOzs7QUE2RGpCLE1BQU0sQ0FBQyxPQUFPLEdBQUc7QUFDZixNQUFJLEVBQUUsTUFBTTtBQUNaLG9CQUFrQixFQUFsQixrQkFBa0I7Q0FDbkIsQ0FBQyIsImZpbGUiOiJTZXJ2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8sXG59IGZyb20gJy4uLy4uL2ludGVyZmFjZXMvc2VydmljZSc7XG5cbmltcG9ydCB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vdXRpbHMnO1xuaW1wb3J0IHtFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi8uLi9sb2dnaW5nJztcblxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmNsYXNzIERlYnVnZ2VyUHJvY2VzcyB7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfcHJvYzogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF93ZWJzb2NrZXRBZGRyZXNzOiBQcm9taXNlPHN0cmluZz47XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwcm9jICBhIHByb2Nlc3MgcnVubmluZyB0aGUgZGVidWdnZXIvbGxkYiBzY3JpcHQuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9jOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcykge1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICAgIHRoaXMuX3Byb2MgPSBwcm9jO1xuXG4gICAgdGhpcy5fd2Vic29ja2V0QWRkcmVzcyA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEFzeW5jIGhhbmRsZSBwYXJzaW5nIHdlYnNvY2tldCBhZGRyZXNzIGZyb20gdGhlIHN0ZG91dCBvZiB0aGUgY2hpbGQuXG4gICAgICBwcm9jLnN0ZG91dC5vbignZGF0YScsIGNodW5rID0+IHtcbiAgICAgICAgLy8gc3Rkb3V0IHNob3VsZCBob3BlZnVsbHkgYmUgc2V0IHRvIGxpbmUtYnVmZmVyaW5nLCBpbiB3aGljaCBjYXNlIHRoZVxuICAgICAgICAvLyBzdHJpbmcgd291bGQgY29tZSBvbiBvbmUgbGluZS5cbiAgICAgICAgY29uc3QgYmxvY2s6IHN0cmluZyA9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgY2hpbGQgcHJvY2Vzcygke3Byb2MucGlkfSkgc3Rkb3V0OiAke2Jsb2NrfWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSAvUG9ydDogKFxcZCspXFxuLy5leGVjKGJsb2NrKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgICAgIHByb2Muc3Rkb3V0LnJlbW92ZUFsbExpc3RlbmVycyhbJ2RhdGEnLCAnZXJyb3InLCAnZXhpdCddKTtcbiAgICAgICAgICByZXNvbHZlKCd3cz1sb2NhbGhvc3Q6JyArIHJlc3VsdFsxXSArICcvJyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcHJvYy5zdGRlcnIub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihgY2hpbGQgcHJvY2Vzcygke3Byb2MucGlkfSkgc3RkZXJyOiAke2NodW5rLnRvU3RyaW5nKCl9YCk7XG4gICAgICB9KTtcbiAgICAgIHByb2Mub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICByZWplY3QoJ2NoaWxkX3Byb2Nlc3MgZXJyb3InKTtcbiAgICAgIH0pO1xuICAgICAgcHJvYy5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgcmVqZWN0KCdjaGlsZF9wcm9jZXNzIGV4aXQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogYXRvbSRJRGlzcG9zYWJsZSB7XG4gICAgLy8gVE9ETyhqZWZmcmV5dGFuKTogRmlndXJlIG91dCBpZi93aGVuIHRoaXMgZXZlbnQgc2hvdWxkIGJlIGRpc3BhdGNoZWQuXG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ3Nlc3Npb24tZW5kJywgY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgICB0aGlzLl9wcm9jLmtpbGwoKTtcbiAgfVxuXG4gIGdldFdlYnNvY2tldEFkZHJlc3MoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gdGhpcy5fd2Vic29ja2V0QWRkcmVzcztcbiAgfVxufVxuXG5cbmNsYXNzIFByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIF9waWQ6IG51bWJlcjtcbiAgX25hbWU6IHN0cmluZztcbiAgX2NvbW1hbmQ6IHN0cmluZztcblxuICAvLyBFeGVjdXRpb24gcGFyYW1ldGVyLlxuICBfYmFzZXBhdGg6ID9zdHJpbmc7XG5cbiAgY29uc3RydWN0b3IocGlkOiBudW1iZXIsIGNvbW1hbmQ6IHN0cmluZywgbmFtZTogc3RyaW5nKSB7XG4gICAgc3VwZXIoJ2xsZGInKTtcblxuICAgIHRoaXMuX3BpZCA9IHBpZDtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9jb21tYW5kID0gY29tbWFuZDtcbiAgfVxuXG4gIGdldCBwaWQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcGlkO1xuICB9XG5cbiAgc2V0IGJhc2VwYXRoKGJhc2VwYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9iYXNlcGF0aCA9IGJhc2VwYXRoO1xuICB9XG5cbiAgYXR0YWNoKCk6IERlYnVnZ2VyUHJvY2VzcyB7XG4gICAgY29uc3QgbGxkYlBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc2NyaXB0cy9tYWluLnB5Jyk7XG4gICAgY29uc3QgYXJncyA9IFtsbGRiUGF0aCwgJy1wJywgU3RyaW5nKHRoaXMuX3BpZCldO1xuICAgIGlmICh0aGlzLl9iYXNlcGF0aCkge1xuICAgICAgYXJncy5wdXNoKCctLWJhc2VwYXRoJywgdGhpcy5fYmFzZXBhdGgpO1xuICAgIH1cbiAgICBjb25zdCBwcm9jID0gY2hpbGRfcHJvY2Vzcy5zcGF3bigncHl0aG9uJywgYXJncyk7XG4gICAgcmV0dXJuIG5ldyBEZWJ1Z2dlclByb2Nlc3MocHJvYyk7XG4gIH1cblxuICBjb21wYXJlRGV0YWlscyhvdGhlcjogbnVjbGlkZV9kZWJ1Z2dlciREZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIHRoaXMuX25hbWUgPT09IG90aGVyLl9uYW1lXG4gICAgICA/ICh0aGlzLl9waWQgLSBvdGhlci5fcGlkKVxuICAgICAgOiAodGhpcy5fbmFtZSA8IG90aGVyLl9uYW1lKSA/IC0xIDogMTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbmFtZSArICcoJyArIHRoaXMuX3BpZCArICcpJztcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRQcm9jZXNzSW5mb0xpc3QoKTogUHJvbWlzZTxBcnJheTxudWNsaWRlX2RlYnVnZ2VyJERlYnVnZ2VyUHJvY2Vzc0luZm8+PiB7XG4gIGNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi4vLi4vLi4vY29tbW9ucycpO1xuICBjb25zdCByZXN1bHQgPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ3BzJywgWyctZScsICctbycsICdwaWQsY29tbSddLCB7fSk7XG4gIC8vICRGbG93Rml4TWU6IGNyeXB0aWMgZXJyb3IgYWJvdXQgUHJvbWlzZXNcbiAgcmV0dXJuIHJlc3VsdC5zdGRvdXQudG9TdHJpbmcoKS5zcGxpdCgnXFxuJykuc2xpY2UoMSkubWFwKGxpbmUgPT4ge1xuICAgIGNvbnN0IHdvcmRzID0gbGluZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBjb25zdCBwaWQgPSBOdW1iZXIod29yZHNbMF0pO1xuICAgIGNvbnN0IGNvbW1hbmQgPSB3b3Jkcy5zbGljZSgxKS5qb2luKCcgJyk7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IGNvbW1hbmQuc3BsaXQoJy8nKTtcbiAgICBjb25zdCBuYW1lID0gY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBuZXcgUHJvY2Vzc0luZm8ocGlkLCBjb21tYW5kLCBuYW1lKTtcbiAgfSlcbiAgLmZpbHRlcihpdGVtID0+ICFpdGVtLmRpc3BsYXlTdHJpbmcoKS5zdGFydHNXaXRoKCcoJykgfHwgIWl0ZW0uZGlzcGxheVN0cmluZygpLmVuZHNXaXRoKCcpJykpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbmFtZTogJ2xsZGInLFxuICBnZXRQcm9jZXNzSW5mb0xpc3QsXG59O1xuIl19