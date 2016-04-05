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

    var didConnect = undefined;
    this._connected = new Promise(function (resolve) {
      didConnect = resolve;
    });

    var session$ = _rx2['default'].Observable.create(function (observer) {
      return(
        // `Session` is particular about what order everything is closed in, so we manage it carefully
        // here.
        new _atom.CompositeDisposable(uiConnection$.combineLatest(pid$).flatMapLatest(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var ws = _ref2[0];
          var pid = _ref2[1];
          return createSessionStream(ws, debugPort);
        }).subscribe(observer), uiConnection$.connect(), pid$.connect())
      );
    });

    this._disposables = new _atom.CompositeDisposable(
    // Tell the user if we can't connect to the debugger UI.
    uiConnection$.subscribeOnError(function (err) {
      atom.notifications.addError('Error connecting to debugger UI.', {
        detail: 'Make sure that port 8080 is open.',
        stack: err.stack,
        dismissable: true
      });

      _this.dispose();
    }), pid$.first().subscribe(function () {
      didConnect();
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
      yield this._connected;

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
}).publish();

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
  return _rx2['default'].Observable.merge(_rx2['default'].Observable.fromEvent(server, 'error').flatMap(_rx2['default'].Observable['throw']), _rx2['default'].Observable.fromEvent(server, 'connection')).takeUntil(_rx2['default'].Observable.fromEvent(server, 'close'));
}).publish();

function createSessionStream(ws, debugPort) {
  var config = {
    debugPort: debugPort,
    // This makes the node inspector not load all the source files on startup:
    preload: false
  };

  return _rx2['default'].Observable.create(function (observer) {
    // Creating a new Session is actually side-effecty.

    var _require = require('../../../nuclide-debugger-node/lib/Session');

    var Session = _require.Session;

    var session = new Session(config, debugPort, ws);
    observer.onNext(session);
    return new _atom.Disposable(function () {
      session.close();
    });
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlRGVidWdnZXJJbnN0YW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFXb0MsMEJBQTBCOzttQ0FDVixnQ0FBZ0M7O29FQUc3RSxxRUFBcUU7O29CQUM5QixNQUFNOztrQkFDckMsSUFBSTs7OztrQkFDcUIsSUFBSTs7SUFHckMsK0JBQStCLHlCQUEvQiwrQkFBK0I7Ozs7Ozs7Ozs7O0lBVXpCLDJCQUEyQjtZQUEzQiwyQkFBMkI7O0FBSTNCLFdBSkEsMkJBQTJCLENBSTFCLFdBQWdDLEVBQUUsU0FBaUIsRUFBRTs7OzBCQUp0RCwyQkFBMkI7O0FBS3BDLCtCQUxTLDJCQUEyQiw2Q0FLOUIsV0FBVyxFQUFFOztBQUVuQixRQUFJLFVBQVUsWUFBQSxDQUFDO0FBQ2YsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUFFLGdCQUFVLEdBQUcsT0FBTyxDQUFDO0tBQUUsQ0FBQyxDQUFDOztBQUVwRSxRQUFNLFFBQVEsR0FBRyxnQkFBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsUUFBUTs7OztBQUc1QyxzQ0FDRSxhQUFhLENBQ1YsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUNuQixhQUFhLENBQUMsVUFBQyxJQUFTO3FDQUFULElBQVM7O2NBQVIsRUFBRTtjQUFFLEdBQUc7aUJBQU0sbUJBQW1CLENBQUMsRUFBRSxFQUFFLFNBQVMsQ0FBQztTQUFBLENBQUMsQ0FDaEUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUN0QixhQUFhLENBQUMsT0FBTyxFQUFFLEVBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FDZjs7S0FDRixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFlBQVksR0FBRzs7QUFFbEIsaUJBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNwQyxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsa0NBQWtD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dCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2V2ZW50IGFzIGNvbW1vbnNFdmVudH0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7RGVidWdnZXJJbnN0YW5jZSwgRGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCB7XG4gIERlYnVnZ2VyUHJveHlDbGllbnQsXG59IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtcmVhY3QtbmF0aXZlLW5vZGUtZXhlY3V0b3IvbGliL0RlYnVnZ2VyUHJveHlDbGllbnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5pbXBvcnQge1NlcnZlciBhcyBXZWJTb2NrZXRTZXJ2ZXJ9IGZyb20gJ3dzJztcbmltcG9ydCB0eXBlIHtTZXNzaW9uIGFzIFNlc3Npb25UeXBlfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWRlYnVnZ2VyLW5vZGUvbGliL1Nlc3Npb24nO1xuXG5jb25zdCB7b2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbn0gPSBjb21tb25zRXZlbnQ7XG5cbi8qKlxuICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgUmVhY3QgTmF0aXZlIGRlYnVnZ2luZyBzZXNzaW9uIGluIE51Y2xpZGUuIERlYnVnZ2luZyBSZWFjdCBOYXRpdmVcbiAqIGNvbnNpc3RzIG9mIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogMS4gSGlqYWNraW5nIFJlYWN0IE5hdGl2ZSBKUyBleGVjdXRpb24gYW5kIHBlcmZvcm1pbmcgaXQgaW4gYSBub2RlIHByb2Nlc3MuIFRoaXMgaXMgdGhlIGpvYiBvZlxuICogICAgRGVidWdnZXJQcm94eUNsaWVudC5cbiAqIDIuIERlYnVnZ2luZyB0aGUgbm9kZSBwcm9jZXNzLlxuICovXG5leHBvcnQgY2xhc3MgUmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2Nvbm5lY3RlZDogUHJvbWlzZTx2b2lkPjtcblxuICBjb25zdHJ1Y3Rvcihwcm9jZXNzSW5mbzogRGVidWdnZXJQcm9jZXNzSW5mbywgZGVidWdQb3J0OiBudW1iZXIpIHtcbiAgICBzdXBlcihwcm9jZXNzSW5mbyk7XG5cbiAgICBsZXQgZGlkQ29ubmVjdDtcbiAgICB0aGlzLl9jb25uZWN0ZWQgPSBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgZGlkQ29ubmVjdCA9IHJlc29sdmU7IH0pO1xuXG4gICAgY29uc3Qgc2Vzc2lvbiQgPSBSeC5PYnNlcnZhYmxlLmNyZWF0ZShvYnNlcnZlciA9PiAoXG4gICAgICAvLyBgU2Vzc2lvbmAgaXMgcGFydGljdWxhciBhYm91dCB3aGF0IG9yZGVyIGV2ZXJ5dGhpbmcgaXMgY2xvc2VkIGluLCBzbyB3ZSBtYW5hZ2UgaXQgY2FyZWZ1bGx5XG4gICAgICAvLyBoZXJlLlxuICAgICAgbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAgIHVpQ29ubmVjdGlvbiRcbiAgICAgICAgICAuY29tYmluZUxhdGVzdChwaWQkKVxuICAgICAgICAgIC5mbGF0TWFwTGF0ZXN0KChbd3MsIHBpZF0pID0+IGNyZWF0ZVNlc3Npb25TdHJlYW0od3MsIGRlYnVnUG9ydCkpXG4gICAgICAgICAgLnN1YnNjcmliZShvYnNlcnZlciksXG4gICAgICAgIHVpQ29ubmVjdGlvbiQuY29ubmVjdCgpLFxuICAgICAgICBwaWQkLmNvbm5lY3QoKSxcbiAgICAgIClcbiAgICApKTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICAvLyBUZWxsIHRoZSB1c2VyIGlmIHdlIGNhbid0IGNvbm5lY3QgdG8gdGhlIGRlYnVnZ2VyIFVJLlxuICAgICAgdWlDb25uZWN0aW9uJC5zdWJzY3JpYmVPbkVycm9yKGVyciA9PiB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAnRXJyb3IgY29ubmVjdGluZyB0byBkZWJ1Z2dlciBVSS4nLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGRldGFpbDogJ01ha2Ugc3VyZSB0aGF0IHBvcnQgODA4MCBpcyBvcGVuLicsXG4gICAgICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgfSxcbiAgICAgICAgKTtcblxuICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgIH0pLFxuXG4gICAgICBwaWQkLmZpcnN0KCkuc3Vic2NyaWJlKCgpID0+IHsgZGlkQ29ubmVjdCgpOyB9KSxcblxuICAgICAgc2Vzc2lvbiQuc3Vic2NyaWJlKCksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbiAgYXN5bmMgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3RlZDtcblxuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgcmV0dXJuICd3cz1sb2NhbGhvc3Q6ODA4MC8nO1xuICB9XG5cbn1cblxuLyoqXG4gKiBBIHN0cmVhbSBvZiBQSURzIHRvIGRlYnVnLCBvYnRhaW5lZCBieSBjb25uZWN0aW5nIHRvIHRoZSBwYWNrYWdlciB2aWEgdGhlIERlYnVnZ2VyUHJveHlDbGllbnQuXG4gKiBUaGlzIHN0cmVhbSBpcyBzaGFyZWQgc28gdGhhdCBvbmx5IG9uZSBjbGllbnQgaXMgY3JlYXRlZCB3aGVuIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgc3Vic2NyaWJlci5cbiAqL1xuY29uc3QgcGlkJCA9IFJ4Lk9ic2VydmFibGUudXNpbmcoXG4gICgpID0+IHtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGVidWdnZXJQcm94eUNsaWVudCgpO1xuICAgIGNsaWVudC5jb25uZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsaWVudCxcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHsgY2xpZW50LmRpc2Nvbm5lY3QoKTsgfSxcbiAgICB9O1xuICB9LFxuICAoe2NsaWVudH0pID0+IG9ic2VydmFibGVGcm9tU3Vic2NyaWJlRnVuY3Rpb24oY2xpZW50Lm9uRGlkRXZhbEFwcGxpY2F0aW9uU2NyaXB0LmJpbmQoY2xpZW50KSksXG4pXG4ucHVibGlzaCgpO1xuXG4vKipcbiAqIENvbm5lY3Rpb25zIGZyb20gdGhlIENocm9tZSBVSS4gVGhlcmUgd2lsbCBvbmx5IGJlIG9uZSBjb25uZWN0aW9uIGF0IGEgdGltZS4gVGhpcyBzdHJlYW0gd29uJ3RcbiAqIGNvbXBsZXRlIHVubGVzcyB0aGUgY29ubmVjdGlvbiBjbG9zZXMuXG4gKi9cbmNvbnN0IHVpQ29ubmVjdGlvbiQgPSBSeC5PYnNlcnZhYmxlLnVzaW5nKFxuICAoKSA9PiB7XG4gICAgLy8gVE9ETyhuYXR0aHUpOiBBc3NpZ24gcmFuZG9tIHBvcnQgaW5zdGVhZC5cbiAgICBjb25zdCBzZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtwb3J0OiA4MDgwfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNlcnZlcixcbiAgICAgIGRpc3Bvc2U6ICgpID0+IHsgc2VydmVyLmNsb3NlKCk7IH0sXG4gICAgfTtcbiAgfSxcbiAgKHtzZXJ2ZXJ9KSA9PiAoXG4gICAgUnguT2JzZXJ2YWJsZS5tZXJnZShcbiAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHNlcnZlciwgJ2Vycm9yJykuZmxhdE1hcChSeC5PYnNlcnZhYmxlLnRocm93KSxcbiAgICAgIFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHNlcnZlciwgJ2Nvbm5lY3Rpb24nKSxcbiAgICApXG4gICAgICAudGFrZVVudGlsKFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KHNlcnZlciwgJ2Nsb3NlJykpXG4gICksXG4pXG4ucHVibGlzaCgpO1xuXG5mdW5jdGlvbiBjcmVhdGVTZXNzaW9uU3RyZWFtKHdzOiBXZWJTb2NrZXQsIGRlYnVnUG9ydDogbnVtYmVyKTogUnguT2JzZXJ2YWJsZTxTZXNzaW9uVHlwZT4ge1xuICBjb25zdCBjb25maWcgPSB7XG4gICAgZGVidWdQb3J0LFxuICAgIC8vIFRoaXMgbWFrZXMgdGhlIG5vZGUgaW5zcGVjdG9yIG5vdCBsb2FkIGFsbCB0aGUgc291cmNlIGZpbGVzIG9uIHN0YXJ0dXA6XG4gICAgcHJlbG9hZDogZmFsc2UsXG4gIH07XG5cbiAgcmV0dXJuIFJ4Lk9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IHtcbiAgICAvLyBDcmVhdGluZyBhIG5ldyBTZXNzaW9uIGlzIGFjdHVhbGx5IHNpZGUtZWZmZWN0eS5cbiAgICBjb25zdCB7U2Vzc2lvbn0gPSByZXF1aXJlKCcuLi8uLi8uLi9udWNsaWRlLWRlYnVnZ2VyLW5vZGUvbGliL1Nlc3Npb24nKTtcbiAgICBjb25zdCBzZXNzaW9uID0gbmV3IFNlc3Npb24oY29uZmlnLCBkZWJ1Z1BvcnQsIHdzKTtcbiAgICBvYnNlcnZlci5vbk5leHQoc2Vzc2lvbik7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgc2Vzc2lvbi5jbG9zZSgpOyB9KTtcbiAgfSk7XG59XG4iXX0=