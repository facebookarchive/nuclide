Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../../nuclide-commons');

var _nuclideDebuggerAtom = require('../../../nuclide-debugger-atom');

var _nuclideDebuggerNodeLibSession = require('../../../nuclide-debugger-node/lib/Session');

var _nuclideReactNativeNodeExecutorLibDebuggerProxyClient = require('../../../nuclide-react-native-node-executor/lib/DebuggerProxyClient');

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _ws = require('ws');

var observableFromSubscribeFunction = _nuclideCommons.event.observableFromSubscribeFunction;

/**
 * This class represents a React Native debugging session in Nuclide. Debugging React Native
 * consists of the following:
 *
 * 1. Hijacking React Native JS execution and performing it in a node process. This is the job of
 *    DebuggerProxyClient.
 * 2. Debugging the node process.
 */

var ReactNativeDebuggerInstance = (function (_DebuggerInstance) {
  _inherits(ReactNativeDebuggerInstance, _DebuggerInstance);

  function ReactNativeDebuggerInstance(processInfo, debugPort) {
    var _this = this;

    _classCallCheck(this, ReactNativeDebuggerInstance);

    _get(Object.getPrototypeOf(ReactNativeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);

    // Once we have a connection from Nuclide (Chrome UI) and a pid, create a new debugging session.
    var session$ = uiConnection$.combineLatest(pid$).flatMapLatest(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var ws = _ref2[0];
      var pid = _ref2[1];

      var config = {
        debugPort: debugPort,
        preload: false };

      // This makes the node inspector not load all the source files on startup.
      return _rx2['default'].Observable.create(function (observer) {
        // Creating a new Session is actually side-effecty.
        var session = new _nuclideDebuggerNodeLibSession.Session(config, debugPort, ws);
        observer.onNext(session);
        return _rx2['default'].Disposable.create(function () {
          session.close();
        });
      });
    }).share();

    this._disposables = new _atom.CompositeDisposable(

    // Tell the user if we can't connect to the debugger UI.
    uiConnection$.subscribeOnError(function (err) {
      atom.notifications.addError('Error connecting to debugger UI.', {
        detail: 'Make sure that port 8080 is open.',
        stack: err.stack,
        dismissable: true
      });

      _this.dispose();
    }),

    // Enable debugging in the process whenever we get a new pid.
    // See <https://nodejs.org/api/debugger.html#debugger_advanced_usage> and
    // <https://github.com/node-inspector/node-inspector#windows>
    pid$.subscribe(function (pid) {
      // $FlowIgnore This is an undocumented API. It's an alternative to the UNIX SIGUSR1 signal.
      process._debugProcess(pid);
    }), session$.subscribe());
  }

  /**
   * A stream of PIDs to debug, obtained by connecting to the packager via the DebuggerProxyClient.
   * This stream is shared so that only one client is created when there is more than one subscriber.
   */

  _createClass(ReactNativeDebuggerInstance, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'getWebsocketAddress',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      yield new Promise(function (resolve) {
        var resolved = false;
        var subscription = pid$.first().subscribe(function () {
          resolved = true;
          _this2._disposables.remove(subscription);
          resolve();
        });
        if (!resolved) {
          _this2._disposables.add(subscription);
        }
      });

      // TODO(natthu): Assign random port instead.
      return 'ws=localhost:8080/';
    })
  }]);

  return ReactNativeDebuggerInstance;
})(_nuclideDebuggerAtom.DebuggerInstance);

exports.ReactNativeDebuggerInstance = ReactNativeDebuggerInstance;
var pid$ = _rx2['default'].Observable.using(function () {
  var client = new _nuclideReactNativeNodeExecutorLibDebuggerProxyClient.DebuggerProxyClient();
  client.connect();
  return {
    client: client,
    dispose: function dispose() {
      client.disconnect();
    }
  };
}, function (_ref3) {
  var client = _ref3.client;
  return observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client));
}).share();

/**
 * Connections from the Chrome UI. There will only be one connection at a time. This stream won't
 * complete unless the connection closes.
 */
var uiConnection$ = _rx2['default'].Observable.using(function () {
  // TODO(natthu): Assign random port instead.
  var server = new _ws.Server({ port: 8080 });
  return {
    server: server,
    dispose: function dispose() {
      server.close();
    }
  };
}, function (_ref4) {
  var server = _ref4.server;
  return _rx2['default'].Observable.merge(_rx2['default'].Observable.fromEvent(server, 'close').flatMap(_rx2['default'].Observable['throw']), _rx2['default'].Observable.fromEvent(server, 'error').flatMap(_rx2['default'].Observable['throw']), _rx2['default'].Observable.fromEvent(server, 'connection'));
}).share();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlRGVidWdnZXJJbnN0YW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFXb0MsMEJBQTBCOzttQ0FDVixnQ0FBZ0M7OzZDQUM5RCw0Q0FBNEM7O29FQUczRCxxRUFBcUU7O29CQUMxQyxNQUFNOztrQkFDekIsSUFBSTs7OztrQkFDcUIsSUFBSTs7SUFFckMsK0JBQStCLHlCQUEvQiwrQkFBK0I7Ozs7Ozs7Ozs7O0lBVXpCLDJCQUEyQjtZQUEzQiwyQkFBMkI7O0FBRzNCLFdBSEEsMkJBQTJCLENBRzFCLFdBQWdDLEVBQUUsU0FBaUIsRUFBRTs7OzBCQUh0RCwyQkFBMkI7O0FBSXBDLCtCQUpTLDJCQUEyQiw2Q0FJOUIsV0FBVyxFQUFFOzs7QUFHbkIsUUFBTSxRQUFRLEdBQUcsYUFBYSxDQUMzQixhQUFhLENBQUMsSUFBSSxDQUFDLENBQ25CLGFBQWEsQ0FBQyxVQUFDLElBQVMsRUFBSztpQ0FBZCxJQUFTOztVQUFSLEVBQUU7VUFBRSxHQUFHOztBQUN0QixVQUFNLE1BQU0sR0FBRztBQUNiLGlCQUFTLEVBQVQsU0FBUztBQUNULGVBQU8sRUFBRSxLQUFLLEVBQ2YsQ0FBQzs7O0FBRUYsYUFBTyxnQkFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUSxFQUFJOztBQUV0QyxZQUFNLE9BQU8sR0FBRywyQ0FBWSxNQUFNLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELGdCQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3pCLGVBQU8sZ0JBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFNO0FBQUUsaUJBQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztTQUFFLENBQUMsQ0FBQztPQUN6RCxDQUFDLENBQUM7S0FDSixDQUFDLENBQ0QsS0FBSyxFQUFFLENBQUM7O0FBRVgsUUFBSSxDQUFDLFlBQVksR0FBRzs7O0FBR2xCLGlCQUFhLENBQUMsZ0JB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ZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtldmVudCBhcyBjb21tb25zRXZlbnR9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge0RlYnVnZ2VySW5zdGFuY2UsIERlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQge1Nlc3Npb259IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtZGVidWdnZXItbm9kZS9saWIvU2Vzc2lvbic7XG5pbXBvcnQge1xuICBEZWJ1Z2dlclByb3h5Q2xpZW50LFxufSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLXJlYWN0LW5hdGl2ZS1ub2RlLWV4ZWN1dG9yL2xpYi9EZWJ1Z2dlclByb3h5Q2xpZW50JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IHtTZXJ2ZXIgYXMgV2ViU29ja2V0U2VydmVyfSBmcm9tICd3cyc7XG5cbmNvbnN0IHtvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9ufSA9IGNvbW1vbnNFdmVudDtcblxuLyoqXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgYSBSZWFjdCBOYXRpdmUgZGVidWdnaW5nIHNlc3Npb24gaW4gTnVjbGlkZS4gRGVidWdnaW5nIFJlYWN0IE5hdGl2ZVxuICogY29uc2lzdHMgb2YgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAxLiBIaWphY2tpbmcgUmVhY3QgTmF0aXZlIEpTIGV4ZWN1dGlvbiBhbmQgcGVyZm9ybWluZyBpdCBpbiBhIG5vZGUgcHJvY2Vzcy4gVGhpcyBpcyB0aGUgam9iIG9mXG4gKiAgICBEZWJ1Z2dlclByb3h5Q2xpZW50LlxuICogMi4gRGVidWdnaW5nIHRoZSBub2RlIHByb2Nlc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBSZWFjdE5hdGl2ZURlYnVnZ2VySW5zdGFuY2UgZXh0ZW5kcyBEZWJ1Z2dlckluc3RhbmNlIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcblxuICAgIC8vIE9uY2Ugd2UgaGF2ZSBhIGNvbm5lY3Rpb24gZnJvbSBOdWNsaWRlIChDaHJvbWUgVUkpIGFuZCBhIHBpZCwgY3JlYXRlIGEgbmV3IGRlYnVnZ2luZyBzZXNzaW9uLlxuICAgIGNvbnN0IHNlc3Npb24kID0gdWlDb25uZWN0aW9uJFxuICAgICAgLmNvbWJpbmVMYXRlc3QocGlkJClcbiAgICAgIC5mbGF0TWFwTGF0ZXN0KChbd3MsIHBpZF0pID0+IHtcbiAgICAgICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgICAgIGRlYnVnUG9ydCxcbiAgICAgICAgICBwcmVsb2FkOiBmYWxzZSwgLy8gVGhpcyBtYWtlcyB0aGUgbm9kZSBpbnNwZWN0b3Igbm90IGxvYWQgYWxsIHRoZSBzb3VyY2UgZmlsZXMgb24gc3RhcnR1cC5cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gUnguT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgICAgICAgIC8vIENyZWF0aW5nIGEgbmV3IFNlc3Npb24gaXMgYWN0dWFsbHkgc2lkZS1lZmZlY3R5LlxuICAgICAgICAgIGNvbnN0IHNlc3Npb24gPSBuZXcgU2Vzc2lvbihjb25maWcsIGRlYnVnUG9ydCwgd3MpO1xuICAgICAgICAgIG9ic2VydmVyLm9uTmV4dChzZXNzaW9uKTtcbiAgICAgICAgICByZXR1cm4gUnguRGlzcG9zYWJsZS5jcmVhdGUoKCkgPT4geyBzZXNzaW9uLmNsb3NlKCk7IH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgICAuc2hhcmUoKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG5cbiAgICAgIC8vIFRlbGwgdGhlIHVzZXIgaWYgd2UgY2FuJ3QgY29ubmVjdCB0byB0aGUgZGVidWdnZXIgVUkuXG4gICAgICB1aUNvbm5lY3Rpb24kLnN1YnNjcmliZU9uRXJyb3IoZXJyID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICdFcnJvciBjb25uZWN0aW5nIHRvIGRlYnVnZ2VyIFVJLicsXG4gICAgICAgICAge1xuICAgICAgICAgICAgZGV0YWlsOiAnTWFrZSBzdXJlIHRoYXQgcG9ydCA4MDgwIGlzIG9wZW4uJyxcbiAgICAgICAgICAgIHN0YWNrOiBlcnIuc3RhY2ssXG4gICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgICB9LFxuICAgICAgICApO1xuXG4gICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgfSksXG5cbiAgICAgIC8vIEVuYWJsZSBkZWJ1Z2dpbmcgaW4gdGhlIHByb2Nlc3Mgd2hlbmV2ZXIgd2UgZ2V0IGEgbmV3IHBpZC5cbiAgICAgIC8vIFNlZSA8aHR0cHM6Ly9ub2RlanMub3JnL2FwaS9kZWJ1Z2dlci5odG1sI2RlYnVnZ2VyX2FkdmFuY2VkX3VzYWdlPiBhbmRcbiAgICAgIC8vIDxodHRwczovL2dpdGh1Yi5jb20vbm9kZS1pbnNwZWN0b3Ivbm9kZS1pbnNwZWN0b3Ijd2luZG93cz5cbiAgICAgIHBpZCQuc3Vic2NyaWJlKHBpZCA9PiB7XG4gICAgICAgIC8vICRGbG93SWdub3JlIFRoaXMgaXMgYW4gdW5kb2N1bWVudGVkIEFQSS4gSXQncyBhbiBhbHRlcm5hdGl2ZSB0byB0aGUgVU5JWCBTSUdVU1IxIHNpZ25hbC5cbiAgICAgICAgcHJvY2Vzcy5fZGVidWdQcm9jZXNzKHBpZCk7XG4gICAgICB9KSxcblxuICAgICAgc2Vzc2lvbiQuc3Vic2NyaWJlKCksXG5cbiAgICApO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cblxuICBhc3luYyBnZXRXZWJzb2NrZXRBZGRyZXNzKCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBsZXQgcmVzb2x2ZWQgPSBmYWxzZTtcbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHBpZCQuZmlyc3QoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLnJlbW92ZShzdWJzY3JpcHRpb24pO1xuICAgICAgICByZXNvbHZlKCk7XG4gICAgICB9KTtcbiAgICAgIGlmICghcmVzb2x2ZWQpIHtcbiAgICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuYWRkKHN1YnNjcmlwdGlvbik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBUT0RPKG5hdHRodSk6IEFzc2lnbiByYW5kb20gcG9ydCBpbnN0ZWFkLlxuICAgIHJldHVybiAnd3M9bG9jYWxob3N0OjgwODAvJztcbiAgfVxuXG59XG5cbi8qKlxuICogQSBzdHJlYW0gb2YgUElEcyB0byBkZWJ1Zywgb2J0YWluZWQgYnkgY29ubmVjdGluZyB0byB0aGUgcGFja2FnZXIgdmlhIHRoZSBEZWJ1Z2dlclByb3h5Q2xpZW50LlxuICogVGhpcyBzdHJlYW0gaXMgc2hhcmVkIHNvIHRoYXQgb25seSBvbmUgY2xpZW50IGlzIGNyZWF0ZWQgd2hlbiB0aGVyZSBpcyBtb3JlIHRoYW4gb25lIHN1YnNjcmliZXIuXG4gKi9cbmNvbnN0IHBpZCQgPSBSeC5PYnNlcnZhYmxlLnVzaW5nKFxuICAoKSA9PiB7XG4gICAgY29uc3QgY2xpZW50ID0gbmV3IERlYnVnZ2VyUHJveHlDbGllbnQoKTtcbiAgICBjbGllbnQuY29ubmVjdCgpO1xuICAgIHJldHVybiB7XG4gICAgICBjbGllbnQsXG4gICAgICBkaXNwb3NlOiAoKSA9PiB7IGNsaWVudC5kaXNjb25uZWN0KCk7IH0sXG4gICAgfTtcbiAgfSxcbiAgKHtjbGllbnR9KSA9PiBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKGNsaWVudC5vbkRpZEV2YWxBcHBsaWNhdGlvblNjcmlwdC5iaW5kKGNsaWVudCkpLFxuKVxuLnNoYXJlKCk7XG5cbi8qKlxuICogQ29ubmVjdGlvbnMgZnJvbSB0aGUgQ2hyb21lIFVJLiBUaGVyZSB3aWxsIG9ubHkgYmUgb25lIGNvbm5lY3Rpb24gYXQgYSB0aW1lLiBUaGlzIHN0cmVhbSB3b24ndFxuICogY29tcGxldGUgdW5sZXNzIHRoZSBjb25uZWN0aW9uIGNsb3Nlcy5cbiAqL1xuY29uc3QgdWlDb25uZWN0aW9uJCA9IFJ4Lk9ic2VydmFibGUudXNpbmcoXG4gICgpID0+IHtcbiAgICAvLyBUT0RPKG5hdHRodSk6IEFzc2lnbiByYW5kb20gcG9ydCBpbnN0ZWFkLlxuICAgIGNvbnN0IHNlcnZlciA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoe3BvcnQ6IDgwODB9KTtcbiAgICByZXR1cm4ge1xuICAgICAgc2VydmVyLFxuICAgICAgZGlzcG9zZTogKCkgPT4geyBzZXJ2ZXIuY2xvc2UoKTsgfSxcbiAgICB9O1xuICB9LFxuICAoe3NlcnZlcn0pID0+IChcbiAgICBSeC5PYnNlcnZhYmxlLm1lcmdlKFxuICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2VydmVyLCAnY2xvc2UnKS5mbGF0TWFwKFJ4Lk9ic2VydmFibGUudGhyb3cpLFxuICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2VydmVyLCAnZXJyb3InKS5mbGF0TWFwKFJ4Lk9ic2VydmFibGUudGhyb3cpLFxuICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2VydmVyLCAnY29ubmVjdGlvbicpLFxuICAgIClcbiAgKSxcbilcbi5zaGFyZSgpO1xuIl19