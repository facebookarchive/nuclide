Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commonsLibProcess = require('../../commons/lib/process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Child = (function () {
  function Child(onReply, emitter) {
    var _this = this;

    _classCallCheck(this, Child);

    this._execScriptMessageId = -1;

    var process$ = this._process$ = _rx2['default'].Observable.fromPromise(
    // TODO: The node location/path needs to be more configurable. We need to figure out a way to
    //   handle this across the board.
    (0, _commonsLibProcess.forkWithExecEnvironment)(_path2['default'].join(__dirname, 'executor.js'), [], { execPath: 'node' }));

    this._closed = process$.flatMap(function (process) {
      return _rx2['default'].Observable.fromEvent(process, 'close');
    }).first().toPromise();

    // A stream of messages we're sending to the executor.
    this._input$ = new _rx2['default'].Subject();

    // The messages we're receiving from the executor.
    var output$ = process$.flatMap(function (process) {
      return _rx2['default'].Observable.fromEvent(process, 'message');
    });

    // Emit the eval_application_script event when we get the message that corresponds to it.
    output$.filter(function (message) {
      return message.replyId === _this._execScriptMessageId;
    }).first().combineLatest(process$).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var process = _ref2[1];
      return process.pid;
    }).subscribe(function (pid) {
      emitter.emit('eval_application_script', pid);
    });

    // Forward the output we get from the process to subscribers
    output$.subscribe(function (message) {
      onReply(message.replyId, message.result);
    });

    // Buffer the messages until we have a process to send them to, then send them.
    var bufferedMessage$ = this._input$.takeUntil(process$).buffer(process$).flatMap(function (x) {
      return x;
    });
    var remainingMessages = this._input$.skipUntil(process$);
    bufferedMessage$.concat(remainingMessages).combineLatest(process$).subscribe(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 2);

      var message = _ref32[0];
      var process = _ref32[1];

      process.send(message);
    });
  }

  _createClass(Child, [{
    key: 'kill',
    value: _asyncToGenerator(function* () {
      // Kill the process once we have one.
      this._process$.subscribe(function (process) {
        process.kill();
      });
      yield this._closed;
    })
  }, {
    key: 'execScript',
    value: function execScript(script, inject, id) {
      this._execScriptMessageId = id;
      this._input$.onNext({
        id: id,
        op: 'evalScript',
        data: {
          script: script,
          inject: inject
        }
      });
    }
  }, {
    key: 'execCall',
    value: function execCall(payload, id) {
      this._input$.onNext({
        id: id,
        op: 'call',
        data: {
          method: payload.method,
          arguments: payload.arguments
        }
      });
    }
  }]);

  return Child;
})();

exports['default'] = Child;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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Qy9CLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQ2xCLFVBQUUsRUFBRixFQUFFO0FBQ0YsVUFBRSxFQUFFLFlBQVk7QUFDaEIsWUFBSSxFQUFFO0FBQ0osZ0JBQU0sRUFBTixNQUFNO0FBQ04sZ0JBQU0sRUFBTixNQUFNO1NBQ1A7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRU8sa0JBQUMsT0FBZSxFQUFFLEVBQVUsRUFBRTtBQUNwQyxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUNsQixVQUFFLEVBQUYsRUFBRTtBQUNGLFVBQUUsRUFBRSxNQUFNO0FBQ1YsWUFBSSxFQUFFO0FBQ0osZ0JBQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtBQUN0QixtQkFBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1NBQzdCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztTQTlFa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiQ2hpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCB0eXBlIHtTZXJ2ZXJSZXBseUNhbGxiYWNrfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCB7Zm9ya1dpdGhFeGVjRW52aXJvbm1lbnR9IGZyb20gJy4uLy4uL2NvbW1vbnMvbGliL3Byb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGlsZCB7XG5cbiAgX2Nsb3NlZDogUHJvbWlzZTxtaXhlZD47XG4gIF9leGVjU2NyaXB0TWVzc2FnZUlkOiBudW1iZXI7XG4gIF9wcm9jZXNzJDogUnguT2JzZXJ2YWJsZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz47XG4gIF9pbnB1dCQ6IFJ4LlN1YmplY3Q8T2JqZWN0PjtcblxuICBjb25zdHJ1Y3RvcihvblJlcGx5OiBTZXJ2ZXJSZXBseUNhbGxiYWNrLCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIpIHtcbiAgICB0aGlzLl9leGVjU2NyaXB0TWVzc2FnZUlkID0gLTE7XG5cbiAgICBjb25zdCBwcm9jZXNzJCA9IHRoaXMuX3Byb2Nlc3MkID0gUnguT2JzZXJ2YWJsZS5mcm9tUHJvbWlzZShcbiAgICAgIC8vIFRPRE86IFRoZSBub2RlIGxvY2F0aW9uL3BhdGggbmVlZHMgdG8gYmUgbW9yZSBjb25maWd1cmFibGUuIFdlIG5lZWQgdG8gZmlndXJlIG91dCBhIHdheSB0b1xuICAgICAgLy8gICBoYW5kbGUgdGhpcyBhY3Jvc3MgdGhlIGJvYXJkLlxuICAgICAgZm9ya1dpdGhFeGVjRW52aXJvbm1lbnQocGF0aC5qb2luKF9fZGlybmFtZSwgJ2V4ZWN1dG9yLmpzJyksIFtdLCB7ZXhlY1BhdGg6ICdub2RlJ30pXG4gICAgKTtcblxuICAgIHRoaXMuX2Nsb3NlZCA9IHByb2Nlc3MkLmZsYXRNYXAocHJvY2VzcyA9PiBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnY2xvc2UnKSlcbiAgICAgIC5maXJzdCgpXG4gICAgICAudG9Qcm9taXNlKCk7XG5cbiAgICAvLyBBIHN0cmVhbSBvZiBtZXNzYWdlcyB3ZSdyZSBzZW5kaW5nIHRvIHRoZSBleGVjdXRvci5cbiAgICB0aGlzLl9pbnB1dCQgPSBuZXcgUnguU3ViamVjdCgpO1xuXG4gICAgLy8gVGhlIG1lc3NhZ2VzIHdlJ3JlIHJlY2VpdmluZyBmcm9tIHRoZSBleGVjdXRvci5cbiAgICBjb25zdCBvdXRwdXQkID0gcHJvY2VzcyQuZmxhdE1hcChwcm9jZXNzID0+IFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdtZXNzYWdlJykpO1xuXG4gICAgLy8gRW1pdCB0aGUgZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQgZXZlbnQgd2hlbiB3ZSBnZXQgdGhlIG1lc3NhZ2UgdGhhdCBjb3JyZXNwb25kcyB0byBpdC5cbiAgICBvdXRwdXQkXG4gICAgICAuZmlsdGVyKG1lc3NhZ2UgPT4gbWVzc2FnZS5yZXBseUlkID09PSB0aGlzLl9leGVjU2NyaXB0TWVzc2FnZUlkKVxuICAgICAgLmZpcnN0KClcbiAgICAgIC5jb21iaW5lTGF0ZXN0KHByb2Nlc3MkKVxuICAgICAgLm1hcCgoWywgcHJvY2Vzc10pID0+IHByb2Nlc3MucGlkKVxuICAgICAgLnN1YnNjcmliZShwaWQgPT4ge1xuICAgICAgICBlbWl0dGVyLmVtaXQoJ2V2YWxfYXBwbGljYXRpb25fc2NyaXB0JywgcGlkKTtcbiAgICAgIH0pO1xuXG4gICAgLy8gRm9yd2FyZCB0aGUgb3V0cHV0IHdlIGdldCBmcm9tIHRoZSBwcm9jZXNzIHRvIHN1YnNjcmliZXJzXG4gICAgb3V0cHV0JC5zdWJzY3JpYmUobWVzc2FnZSA9PiB7XG4gICAgICBvblJlcGx5KG1lc3NhZ2UucmVwbHlJZCwgbWVzc2FnZS5yZXN1bHQpO1xuICAgIH0pO1xuXG4gICAgLy8gQnVmZmVyIHRoZSBtZXNzYWdlcyB1bnRpbCB3ZSBoYXZlIGEgcHJvY2VzcyB0byBzZW5kIHRoZW0gdG8sIHRoZW4gc2VuZCB0aGVtLlxuICAgIGNvbnN0IGJ1ZmZlcmVkTWVzc2FnZSQgPSB0aGlzLl9pbnB1dCQudGFrZVVudGlsKHByb2Nlc3MkKS5idWZmZXIocHJvY2VzcyQpLmZsYXRNYXAoeCA9PiB4KTtcbiAgICBjb25zdCByZW1haW5pbmdNZXNzYWdlcyA9IHRoaXMuX2lucHV0JC5za2lwVW50aWwocHJvY2VzcyQpO1xuICAgIGJ1ZmZlcmVkTWVzc2FnZSQuY29uY2F0KHJlbWFpbmluZ01lc3NhZ2VzKVxuICAgICAgLmNvbWJpbmVMYXRlc3QocHJvY2VzcyQpXG4gICAgICAuc3Vic2NyaWJlKChbbWVzc2FnZSwgcHJvY2Vzc10pID0+IHtcbiAgICAgICAgcHJvY2Vzcy5zZW5kKG1lc3NhZ2UpO1xuICAgICAgfSk7XG4gIH1cblxuICBhc3luYyBraWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEtpbGwgdGhlIHByb2Nlc3Mgb25jZSB3ZSBoYXZlIG9uZS5cbiAgICB0aGlzLl9wcm9jZXNzJC5zdWJzY3JpYmUocHJvY2VzcyA9PiB7IHByb2Nlc3Mua2lsbCgpOyB9KTtcbiAgICBhd2FpdCB0aGlzLl9jbG9zZWQ7XG4gIH1cblxuICBleGVjU2NyaXB0KHNjcmlwdDogc3RyaW5nLCBpbmplY3Q6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICAgIHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQgPSBpZDtcbiAgICB0aGlzLl9pbnB1dCQub25OZXh0KHtcbiAgICAgIGlkLFxuICAgICAgb3A6ICdldmFsU2NyaXB0JyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc2NyaXB0LFxuICAgICAgICBpbmplY3QsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgZXhlY0NhbGwocGF5bG9hZDogT2JqZWN0LCBpZDogbnVtYmVyKSB7XG4gICAgdGhpcy5faW5wdXQkLm9uTmV4dCh7XG4gICAgICBpZCxcbiAgICAgIG9wOiAnY2FsbCcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIG1ldGhvZDogcGF5bG9hZC5tZXRob2QsXG4gICAgICAgIGFyZ3VtZW50czogcGF5bG9hZC5hcmd1bWVudHMsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=