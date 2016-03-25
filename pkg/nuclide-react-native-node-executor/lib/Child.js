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

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideCommonsLibProcess = require('../../nuclide-commons/lib/process');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Child = (function () {
  function Child(onReply, emitter) {
    var _this = this;

    _classCallCheck(this, Child);

    this._execScriptMessageId = -1;

    var execPath = _nuclideFeatureConfig2['default'].get('nuclide-react-native.pathToNode');
    var process$ = this._process$ = _rx2['default'].Observable.fromPromise(
    // TODO: The node location/path needs to be more configurable. We need to figure out a way to
    //   handle this across the board.
    (0, _nuclideCommonsLibProcess.forkWithExecEnvironment)(_path2['default'].join(__dirname, 'executor.js'), [], { execPath: execPath, silent: true }));

    // Pipe output from forked process. This just makes things easier to debug for us.
    process$.flatMapLatest(function (process) {
      return _rx2['default'].Observable.fromEvent(process.stdout, 'data');
    }).subscribe(function (data) {
      return console.log(data.toString());
    }); // eslint-disable-line no-console

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
    key: 'executeApplicationScript',
    value: function executeApplicationScript(script, inject, id) {
      this._execScriptMessageId = id;
      this._input$.onNext({
        id: id,
        op: 'executeApplicationScript',
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
//# sourceMappingURL=data:application/json;base64,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LElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN2QixDQUFDLENBQUM7R0FDTjs7ZUEzRGtCLEtBQUs7OzZCQTZEZCxhQUFrQjs7QUFFMUIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQSxPQUFPLEVBQUk7QUFBRSxlQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7T0FBRSxDQUFDLENBQUM7QUFDekQsWUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3BCOzs7V0FFdUIsa0NBQUMsTUFBYyxFQUFFLE1BQWMsRUFBRSxFQUFVLEVBQUU7QUFDbkUsVUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUNsQixVQUFFLEVBQUYsRUFBRTtBQUNGLFVBQUUsRUFBRSwwQkFBMEI7QUFDOUIsWUFBSSxFQUFFO0FBQ0osZ0JBQU0sRUFBTixNQUFNO0FBQ04sZ0JBQU0sRUFBTixNQUFNO1NBQ1A7T0FDRixDQUFDLENBQUM7S0FDSjs7O1dBRU8sa0JBQUMsT0FBZSxFQUFFLEVBQVUsRUFBRTtBQUNwQyxVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUNsQixVQUFFLEVBQUYsRUFBRTtBQUNGLFVBQUUsRUFBRSxNQUFNO0FBQ1YsWUFBSSxFQUFFO0FBQ0osZ0JBQU0sRUFBRSxPQUFPLENBQUMsTUFBTTtBQUN0QixtQkFBUyxFQUFFLE9BQU8sQ0FBQyxTQUFTO1NBQzdCO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztTQXhGa0IsS0FBSzs7O3FCQUFMLEtBQUsiLCJmaWxlIjoiQ2hpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCB0eXBlIHtTZXJ2ZXJSZXBseUNhbGxiYWNrfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHtmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zL2xpYi9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hpbGQge1xuXG4gIF9jbG9zZWQ6IFByb21pc2U8bWl4ZWQ+O1xuICBfZXhlY1NjcmlwdE1lc3NhZ2VJZDogbnVtYmVyO1xuICBfcHJvY2VzcyQ6IFJ4Lk9ic2VydmFibGU8Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M+O1xuICBfaW5wdXQkOiBSeC5TdWJqZWN0PE9iamVjdD47XG5cbiAgY29uc3RydWN0b3Iob25SZXBseTogU2VydmVyUmVwbHlDYWxsYmFjaywgZW1pdHRlcjogRXZlbnRFbWl0dGVyKSB7XG4gICAgdGhpcy5fZXhlY1NjcmlwdE1lc3NhZ2VJZCA9IC0xO1xuXG4gICAgY29uc3QgZXhlY1BhdGggPSBmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1yZWFjdC1uYXRpdmUucGF0aFRvTm9kZScpO1xuICAgIGNvbnN0IHByb2Nlc3MkID0gdGhpcy5fcHJvY2VzcyQgPSBSeC5PYnNlcnZhYmxlLmZyb21Qcm9taXNlKFxuICAgICAgLy8gVE9ETzogVGhlIG5vZGUgbG9jYXRpb24vcGF0aCBuZWVkcyB0byBiZSBtb3JlIGNvbmZpZ3VyYWJsZS4gV2UgbmVlZCB0byBmaWd1cmUgb3V0IGEgd2F5IHRvXG4gICAgICAvLyAgIGhhbmRsZSB0aGlzIGFjcm9zcyB0aGUgYm9hcmQuXG4gICAgICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudChcbiAgICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJ2V4ZWN1dG9yLmpzJyksXG4gICAgICAgIFtdLFxuICAgICAgICB7ZXhlY1BhdGgsIHNpbGVudDogdHJ1ZX0sXG4gICAgICApXG4gICAgKTtcblxuICAgIC8vIFBpcGUgb3V0cHV0IGZyb20gZm9ya2VkIHByb2Nlc3MuIFRoaXMganVzdCBtYWtlcyB0aGluZ3MgZWFzaWVyIHRvIGRlYnVnIGZvciB1cy5cbiAgICBwcm9jZXNzJFxuICAgICAgLmZsYXRNYXBMYXRlc3QocHJvY2VzcyA9PiBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLnN0ZG91dCwgJ2RhdGEnKSlcbiAgICAgIC5zdWJzY3JpYmUoZGF0YSA9PiBjb25zb2xlLmxvZyhkYXRhLnRvU3RyaW5nKCkpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG5cbiAgICB0aGlzLl9jbG9zZWQgPSBwcm9jZXNzJC5mbGF0TWFwKHByb2Nlc3MgPT4gUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ2Nsb3NlJykpXG4gICAgICAuZmlyc3QoKVxuICAgICAgLnRvUHJvbWlzZSgpO1xuXG4gICAgLy8gQSBzdHJlYW0gb2YgbWVzc2FnZXMgd2UncmUgc2VuZGluZyB0byB0aGUgZXhlY3V0b3IuXG4gICAgdGhpcy5faW5wdXQkID0gbmV3IFJ4LlN1YmplY3QoKTtcblxuICAgIC8vIFRoZSBtZXNzYWdlcyB3ZSdyZSByZWNlaXZpbmcgZnJvbSB0aGUgZXhlY3V0b3IuXG4gICAgY29uc3Qgb3V0cHV0JCA9IHByb2Nlc3MkLmZsYXRNYXAocHJvY2VzcyA9PiBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChwcm9jZXNzLCAnbWVzc2FnZScpKTtcblxuICAgIC8vIEVtaXQgdGhlIGV2YWxfYXBwbGljYXRpb25fc2NyaXB0IGV2ZW50IHdoZW4gd2UgZ2V0IHRoZSBtZXNzYWdlIHRoYXQgY29ycmVzcG9uZHMgdG8gaXQuXG4gICAgb3V0cHV0JFxuICAgICAgLmZpbHRlcihtZXNzYWdlID0+IG1lc3NhZ2UucmVwbHlJZCA9PT0gdGhpcy5fZXhlY1NjcmlwdE1lc3NhZ2VJZClcbiAgICAgIC5maXJzdCgpXG4gICAgICAuY29tYmluZUxhdGVzdChwcm9jZXNzJClcbiAgICAgIC5tYXAoKFssIHByb2Nlc3NdKSA9PiBwcm9jZXNzLnBpZClcbiAgICAgIC5zdWJzY3JpYmUocGlkID0+IHtcbiAgICAgICAgZW1pdHRlci5lbWl0KCdldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCcsIHBpZCk7XG4gICAgICB9KTtcblxuICAgIC8vIEZvcndhcmQgdGhlIG91dHB1dCB3ZSBnZXQgZnJvbSB0aGUgcHJvY2VzcyB0byBzdWJzY3JpYmVyc1xuICAgIG91dHB1dCQuc3Vic2NyaWJlKG1lc3NhZ2UgPT4ge1xuICAgICAgb25SZXBseShtZXNzYWdlLnJlcGx5SWQsIG1lc3NhZ2UucmVzdWx0KTtcbiAgICB9KTtcblxuICAgIC8vIEJ1ZmZlciB0aGUgbWVzc2FnZXMgdW50aWwgd2UgaGF2ZSBhIHByb2Nlc3MgdG8gc2VuZCB0aGVtIHRvLCB0aGVuIHNlbmQgdGhlbS5cbiAgICBjb25zdCBidWZmZXJlZE1lc3NhZ2UkID0gdGhpcy5faW5wdXQkLnRha2VVbnRpbChwcm9jZXNzJCkuYnVmZmVyKHByb2Nlc3MkKS5mbGF0TWFwKHggPT4geCk7XG4gICAgY29uc3QgcmVtYWluaW5nTWVzc2FnZXMgPSB0aGlzLl9pbnB1dCQuc2tpcFVudGlsKHByb2Nlc3MkKTtcbiAgICBidWZmZXJlZE1lc3NhZ2UkLmNvbmNhdChyZW1haW5pbmdNZXNzYWdlcylcbiAgICAgIC5jb21iaW5lTGF0ZXN0KHByb2Nlc3MkKVxuICAgICAgLnN1YnNjcmliZSgoW21lc3NhZ2UsIHByb2Nlc3NdKSA9PiB7XG4gICAgICAgIHByb2Nlc3Muc2VuZChtZXNzYWdlKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgYXN5bmMga2lsbCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBLaWxsIHRoZSBwcm9jZXNzIG9uY2Ugd2UgaGF2ZSBvbmUuXG4gICAgdGhpcy5fcHJvY2VzcyQuc3Vic2NyaWJlKHByb2Nlc3MgPT4geyBwcm9jZXNzLmtpbGwoKTsgfSk7XG4gICAgYXdhaXQgdGhpcy5fY2xvc2VkO1xuICB9XG5cbiAgZXhlY3V0ZUFwcGxpY2F0aW9uU2NyaXB0KHNjcmlwdDogc3RyaW5nLCBpbmplY3Q6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICAgIHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQgPSBpZDtcbiAgICB0aGlzLl9pbnB1dCQub25OZXh0KHtcbiAgICAgIGlkLFxuICAgICAgb3A6ICdleGVjdXRlQXBwbGljYXRpb25TY3JpcHQnLFxuICAgICAgZGF0YToge1xuICAgICAgICBzY3JpcHQsXG4gICAgICAgIGluamVjdCxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBleGVjQ2FsbChwYXlsb2FkOiBPYmplY3QsIGlkOiBudW1iZXIpIHtcbiAgICB0aGlzLl9pbnB1dCQub25OZXh0KHtcbiAgICAgIGlkLFxuICAgICAgb3A6ICdjYWxsJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgbWV0aG9kOiBwYXlsb2FkLm1ldGhvZCxcbiAgICAgICAgYXJndW1lbnRzOiBwYXlsb2FkLmFyZ3VtZW50cyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==