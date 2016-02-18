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
    }).first()
    // $FlowIgnore: Not sure how to annotate combineLatest
    .combineLatest(process$).map(function (_ref) {
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
    bufferedMessage$.concat(remainingMessages)
    // $FlowIgnore: Not sure how to annotate combineLatest
    .combineLatest(process$).subscribe(function (_ref3) {
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
//# sourceMappingURL=data:application/json;base64,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QUFDL0IsVUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDbEIsVUFBRSxFQUFGLEVBQUU7QUFDRixVQUFFLEVBQUUsWUFBWTtBQUNoQixZQUFJLEVBQUU7QUFDSixnQkFBTSxFQUFOLE1BQU07QUFDTixnQkFBTSxFQUFOLE1BQU07U0FDUDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFTyxrQkFBQyxPQUFlLEVBQUUsRUFBVSxFQUFFO0FBQ3BDLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQ2xCLFVBQUUsRUFBRixFQUFFO0FBQ0YsVUFBRSxFQUFFLE1BQU07QUFDVixZQUFJLEVBQUU7QUFDSixnQkFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO0FBQ3RCLG1CQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7U0FDN0I7T0FDRixDQUFDLENBQUM7S0FDSjs7O1NBaEZrQixLQUFLOzs7cUJBQUwsS0FBSyIsImZpbGUiOiJDaGlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IHR5cGUge1NlcnZlclJlcGx5Q2FsbGJhY2t9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuaW1wb3J0IHtmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudH0gZnJvbSAnLi4vLi4vY29tbW9ucy9saWIvcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoaWxkIHtcblxuICBfY2xvc2VkOiBQcm9taXNlPG1peGVkPjtcbiAgX2V4ZWNTY3JpcHRNZXNzYWdlSWQ6IG51bWJlcjtcbiAgX3Byb2Nlc3MkOiBSeC5PYnNlcnZhYmxlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPjtcbiAgX2lucHV0JDogUnguU3ViamVjdDxPYmplY3Q+O1xuXG4gIGNvbnN0cnVjdG9yKG9uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2ssIGVtaXR0ZXI6IEV2ZW50RW1pdHRlcikge1xuICAgIHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQgPSAtMTtcblxuICAgIGNvbnN0IHByb2Nlc3MkID0gdGhpcy5fcHJvY2VzcyQgPSBSeC5PYnNlcnZhYmxlLmZyb21Qcm9taXNlKFxuICAgICAgLy8gVE9ETzogVGhlIG5vZGUgbG9jYXRpb24vcGF0aCBuZWVkcyB0byBiZSBtb3JlIGNvbmZpZ3VyYWJsZS4gV2UgbmVlZCB0byBmaWd1cmUgb3V0IGEgd2F5IHRvXG4gICAgICAvLyAgIGhhbmRsZSB0aGlzIGFjcm9zcyB0aGUgYm9hcmQuXG4gICAgICBmb3JrV2l0aEV4ZWNFbnZpcm9ubWVudChwYXRoLmpvaW4oX19kaXJuYW1lLCAnZXhlY3V0b3IuanMnKSwgW10sIHtleGVjUGF0aDogJ25vZGUnfSlcbiAgICApO1xuXG4gICAgdGhpcy5fY2xvc2VkID0gcHJvY2VzcyQuZmxhdE1hcChwcm9jZXNzID0+IFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHByb2Nlc3MsICdjbG9zZScpKVxuICAgICAgLmZpcnN0KClcbiAgICAgIC50b1Byb21pc2UoKTtcblxuICAgIC8vIEEgc3RyZWFtIG9mIG1lc3NhZ2VzIHdlJ3JlIHNlbmRpbmcgdG8gdGhlIGV4ZWN1dG9yLlxuICAgIHRoaXMuX2lucHV0JCA9IG5ldyBSeC5TdWJqZWN0KCk7XG5cbiAgICAvLyBUaGUgbWVzc2FnZXMgd2UncmUgcmVjZWl2aW5nIGZyb20gdGhlIGV4ZWN1dG9yLlxuICAgIGNvbnN0IG91dHB1dCQgPSBwcm9jZXNzJC5mbGF0TWFwKHByb2Nlc3MgPT4gUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQocHJvY2VzcywgJ21lc3NhZ2UnKSk7XG5cbiAgICAvLyBFbWl0IHRoZSBldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCBldmVudCB3aGVuIHdlIGdldCB0aGUgbWVzc2FnZSB0aGF0IGNvcnJlc3BvbmRzIHRvIGl0LlxuICAgIG91dHB1dCRcbiAgICAgIC5maWx0ZXIobWVzc2FnZSA9PiBtZXNzYWdlLnJlcGx5SWQgPT09IHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQpXG4gICAgICAuZmlyc3QoKVxuICAgICAgLy8gJEZsb3dJZ25vcmU6IE5vdCBzdXJlIGhvdyB0byBhbm5vdGF0ZSBjb21iaW5lTGF0ZXN0XG4gICAgICAuY29tYmluZUxhdGVzdChwcm9jZXNzJClcbiAgICAgIC5tYXAoKFssIHByb2Nlc3NdKSA9PiBwcm9jZXNzLnBpZClcbiAgICAgIC5zdWJzY3JpYmUocGlkID0+IHtcbiAgICAgICAgZW1pdHRlci5lbWl0KCdldmFsX2FwcGxpY2F0aW9uX3NjcmlwdCcsIHBpZCk7XG4gICAgICB9KTtcblxuICAgIC8vIEZvcndhcmQgdGhlIG91dHB1dCB3ZSBnZXQgZnJvbSB0aGUgcHJvY2VzcyB0byBzdWJzY3JpYmVyc1xuICAgIG91dHB1dCQuc3Vic2NyaWJlKG1lc3NhZ2UgPT4ge1xuICAgICAgb25SZXBseShtZXNzYWdlLnJlcGx5SWQsIG1lc3NhZ2UucmVzdWx0KTtcbiAgICB9KTtcblxuICAgIC8vIEJ1ZmZlciB0aGUgbWVzc2FnZXMgdW50aWwgd2UgaGF2ZSBhIHByb2Nlc3MgdG8gc2VuZCB0aGVtIHRvLCB0aGVuIHNlbmQgdGhlbS5cbiAgICBjb25zdCBidWZmZXJlZE1lc3NhZ2UkID0gdGhpcy5faW5wdXQkLnRha2VVbnRpbChwcm9jZXNzJCkuYnVmZmVyKHByb2Nlc3MkKS5mbGF0TWFwKHggPT4geCk7XG4gICAgY29uc3QgcmVtYWluaW5nTWVzc2FnZXMgPSB0aGlzLl9pbnB1dCQuc2tpcFVudGlsKHByb2Nlc3MkKTtcbiAgICBidWZmZXJlZE1lc3NhZ2UkLmNvbmNhdChyZW1haW5pbmdNZXNzYWdlcylcbiAgICAgIC8vICRGbG93SWdub3JlOiBOb3Qgc3VyZSBob3cgdG8gYW5ub3RhdGUgY29tYmluZUxhdGVzdFxuICAgICAgLmNvbWJpbmVMYXRlc3QocHJvY2VzcyQpXG4gICAgICAuc3Vic2NyaWJlKChbbWVzc2FnZSwgcHJvY2Vzc10pID0+IHtcbiAgICAgICAgcHJvY2Vzcy5zZW5kKG1lc3NhZ2UpO1xuICAgICAgfSk7XG4gIH1cblxuICBhc3luYyBraWxsKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEtpbGwgdGhlIHByb2Nlc3Mgb25jZSB3ZSBoYXZlIG9uZS5cbiAgICB0aGlzLl9wcm9jZXNzJC5zdWJzY3JpYmUocHJvY2VzcyA9PiB7IHByb2Nlc3Mua2lsbCgpOyB9KTtcbiAgICBhd2FpdCB0aGlzLl9jbG9zZWQ7XG4gIH1cblxuICBleGVjU2NyaXB0KHNjcmlwdDogc3RyaW5nLCBpbmplY3Q6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICAgIHRoaXMuX2V4ZWNTY3JpcHRNZXNzYWdlSWQgPSBpZDtcbiAgICB0aGlzLl9pbnB1dCQub25OZXh0KHtcbiAgICAgIGlkLFxuICAgICAgb3A6ICdldmFsU2NyaXB0JyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc2NyaXB0LFxuICAgICAgICBpbmplY3QsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgZXhlY0NhbGwocGF5bG9hZDogT2JqZWN0LCBpZDogbnVtYmVyKSB7XG4gICAgdGhpcy5faW5wdXQkLm9uTmV4dCh7XG4gICAgICBpZCxcbiAgICAgIG9wOiAnY2FsbCcsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIG1ldGhvZDogcGF5bG9hZC5tZXRob2QsXG4gICAgICAgIGFyZ3VtZW50czogcGF5bG9hZC5hcmd1bWVudHMsXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG59XG4iXX0=