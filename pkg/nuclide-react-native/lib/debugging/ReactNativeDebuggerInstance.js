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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

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
    _classCallCheck(this, ReactNativeDebuggerInstance);

    _get(Object.getPrototypeOf(ReactNativeDebuggerInstance.prototype), 'constructor', this).call(this, processInfo);

    var didConnect = undefined;
    this._connected = new Promise(function (resolve) {
      didConnect = resolve;
    });

    var session$ = _reactivexRxjs2['default'].Observable.create(function (observer) {
      return(
        // `Session` is particular about what order everything is closed in, so we manage it carefully
        // here.
        new _nuclideCommons.CompositeSubscription(uiConnection$.combineLatest(pid$).switchMap(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2);

          var ws = _ref2[0];
          var pid = _ref2[1];
          return createSessionStream(ws, debugPort);
        }).subscribe(observer), uiConnection$.connect(), pid$.connect())
      );
    });

    this._subscriptions = new _nuclideCommons.CompositeSubscription(
    // Tell the user if we can't connect to the debugger UI.
    // $FlowIssue: Flow has a problem with us not returning from the error handler for some reason
    uiConnection$.subscribe({
      error: function error(err) {
        atom.notifications.addError('Error connecting to debugger UI.', {
          detail: 'Make sure that port 8080 is open.',
          stack: err.stack,
          dismissable: true
        });

        this.dispose();
      }
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
      this._subscriptions.unsubscribe();
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
var pid$ = _reactivexRxjs2['default'].Observable.using(function () {
  var client = new _nuclideReactNativeNodeExecutorLibDebuggerProxyClient.DebuggerProxyClient();
  client.connect();
  return {
    client: client,
    unsubscribe: function unsubscribe() {
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
var uiConnection$ = _reactivexRxjs2['default'].Observable.using(function () {
  // TODO(natthu): Assign random port instead.
  var server = new _ws.Server({ port: 8080 });
  return {
    server: server,
    unsubscribe: function unsubscribe() {
      server.close();
    }
  };
}, function (_ref4) {
  var server = _ref4.server;
  return _reactivexRxjs2['default'].Observable.merge(_reactivexRxjs2['default'].Observable.fromEvent(server, 'error').flatMap(_reactivexRxjs2['default'].Observable['throw']), _reactivexRxjs2['default'].Observable.fromEvent(server, 'connection')).takeUntil(_reactivexRxjs2['default'].Observable.fromEvent(server, 'close'));
}).publish();

function createSessionStream(ws, debugPort) {
  var config = {
    debugPort: debugPort,
    // This makes the node inspector not load all the source files on startup:
    preload: false
  };

  return _reactivexRxjs2['default'].Observable.create(function (observer) {
    // Creating a new Session is actually side-effecty.

    var _require = require('../../../nuclide-debugger-node/lib/Session');

    var Session = _require.Session;

    var session = new Session(config, debugPort, ws);
    observer.next(session);
    return function () {
      session.close();
    };
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlRGVidWdnZXJJbnN0YW5jZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFXMkQsMEJBQTBCOzttQ0FDakMsZ0NBQWdDOztvRUFHN0UscUVBQXFFOzs2QkFDN0QsaUJBQWlCOzs7O2tCQUNRLElBQUk7O0lBR3JDLCtCQUErQix5QkFBL0IsK0JBQStCOzs7Ozs7Ozs7OztJQVV6QiwyQkFBMkI7WUFBM0IsMkJBQTJCOztBQUkzQixXQUpBLDJCQUEyQixDQUkxQixXQUFnQyxFQUFFLFNBQWlCLEVBQUU7MEJBSnRELDJCQUEyQjs7QUFLcEMsK0JBTFMsMkJBQTJCLDZDQUs5QixXQUFXLEVBQUU7O0FBRW5CLFFBQUksVUFBVSxZQUFBLENBQUM7QUFDZixRQUFJLENBQUMsVUFBVSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJO0FBQUUsZ0JBQVUsR0FBRyxPQUFPLENBQUM7S0FBRSxDQUFDLENBQUM7O0FBRXBFLFFBQU0sUUFBUSxHQUFHLDJCQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxRQUFROzs7O0FBRzVDLGtEQUNFLGFBQWEsQ0FDVixhQUFhLENBQUMsSUFBSSxDQUFDLENBQ25CLFNBQVMsQ0FBQyxVQUFDLElBQVM7cUNBQVQsSUFBUzs7Y0FBUixFQUFFO2NBQUUsR0FBRztpQkFBTSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDO1NBQUEsQ0FBQyxDQUM1RCxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQ3RCLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFDdkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUNmOztLQUNGLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsY0FBYyxHQUFHOzs7QUFHcEIsaUJBQWEsQ0FBQyxTQUFTLENBQUM7QUFDdEIsV0FBSyxFQUFBLGVBQUMsR0FBRyxFQUFFO0FBQ1QsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLGtDQUFr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bnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVTdWJzY3JpcHRpb24sIGV2ZW50IGFzIGNvbW1vbnNFdmVudH0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7RGVidWdnZXJJbnN0YW5jZSwgRGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCB7XG4gIERlYnVnZ2VyUHJveHlDbGllbnQsXG59IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtcmVhY3QtbmF0aXZlLW5vZGUtZXhlY3V0b3IvbGliL0RlYnVnZ2VyUHJveHlDbGllbnQnO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5pbXBvcnQge1NlcnZlciBhcyBXZWJTb2NrZXRTZXJ2ZXJ9IGZyb20gJ3dzJztcbmltcG9ydCB0eXBlIHtTZXNzaW9uIGFzIFNlc3Npb25UeXBlfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWRlYnVnZ2VyLW5vZGUvbGliL1Nlc3Npb24nO1xuXG5jb25zdCB7b2JzZXJ2YWJsZUZyb21TdWJzY3JpYmVGdW5jdGlvbn0gPSBjb21tb25zRXZlbnQ7XG5cbi8qKlxuICogVGhpcyBjbGFzcyByZXByZXNlbnRzIGEgUmVhY3QgTmF0aXZlIGRlYnVnZ2luZyBzZXNzaW9uIGluIE51Y2xpZGUuIERlYnVnZ2luZyBSZWFjdCBOYXRpdmVcbiAqIGNvbnNpc3RzIG9mIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogMS4gSGlqYWNraW5nIFJlYWN0IE5hdGl2ZSBKUyBleGVjdXRpb24gYW5kIHBlcmZvcm1pbmcgaXQgaW4gYSBub2RlIHByb2Nlc3MuIFRoaXMgaXMgdGhlIGpvYiBvZlxuICogICAgRGVidWdnZXJQcm94eUNsaWVudC5cbiAqIDIuIERlYnVnZ2luZyB0aGUgbm9kZSBwcm9jZXNzLlxuICovXG5leHBvcnQgY2xhc3MgUmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlIGV4dGVuZHMgRGVidWdnZXJJbnN0YW5jZSB7XG4gIF9zdWJzY3JpcHRpb25zOiByeCRJU3Vic2NyaXB0aW9uO1xuICBfY29ubmVjdGVkOiBQcm9taXNlPHZvaWQ+O1xuXG4gIGNvbnN0cnVjdG9yKHByb2Nlc3NJbmZvOiBEZWJ1Z2dlclByb2Nlc3NJbmZvLCBkZWJ1Z1BvcnQ6IG51bWJlcikge1xuICAgIHN1cGVyKHByb2Nlc3NJbmZvKTtcblxuICAgIGxldCBkaWRDb25uZWN0O1xuICAgIHRoaXMuX2Nvbm5lY3RlZCA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyBkaWRDb25uZWN0ID0gcmVzb2x2ZTsgfSk7XG5cbiAgICBjb25zdCBzZXNzaW9uJCA9IFJ4Lk9ic2VydmFibGUuY3JlYXRlKG9ic2VydmVyID0+IChcbiAgICAgIC8vIGBTZXNzaW9uYCBpcyBwYXJ0aWN1bGFyIGFib3V0IHdoYXQgb3JkZXIgZXZlcnl0aGluZyBpcyBjbG9zZWQgaW4sIHNvIHdlIG1hbmFnZSBpdCBjYXJlZnVsbHlcbiAgICAgIC8vIGhlcmUuXG4gICAgICBuZXcgQ29tcG9zaXRlU3Vic2NyaXB0aW9uKFxuICAgICAgICB1aUNvbm5lY3Rpb24kXG4gICAgICAgICAgLmNvbWJpbmVMYXRlc3QocGlkJClcbiAgICAgICAgICAuc3dpdGNoTWFwKChbd3MsIHBpZF0pID0+IGNyZWF0ZVNlc3Npb25TdHJlYW0od3MsIGRlYnVnUG9ydCkpXG4gICAgICAgICAgLnN1YnNjcmliZShvYnNlcnZlciksXG4gICAgICAgIHVpQ29ubmVjdGlvbiQuY29ubmVjdCgpLFxuICAgICAgICBwaWQkLmNvbm5lY3QoKSxcbiAgICAgIClcbiAgICApKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlU3Vic2NyaXB0aW9uKFxuICAgICAgLy8gVGVsbCB0aGUgdXNlciBpZiB3ZSBjYW4ndCBjb25uZWN0IHRvIHRoZSBkZWJ1Z2dlciBVSS5cbiAgICAgIC8vICRGbG93SXNzdWU6IEZsb3cgaGFzIGEgcHJvYmxlbSB3aXRoIHVzIG5vdCByZXR1cm5pbmcgZnJvbSB0aGUgZXJyb3IgaGFuZGxlciBmb3Igc29tZSByZWFzb25cbiAgICAgIHVpQ29ubmVjdGlvbiQuc3Vic2NyaWJlKHtcbiAgICAgICAgZXJyb3IoZXJyKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgJ0Vycm9yIGNvbm5lY3RpbmcgdG8gZGVidWdnZXIgVUkuJyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZGV0YWlsOiAnTWFrZSBzdXJlIHRoYXQgcG9ydCA4MDgwIGlzIG9wZW4uJyxcbiAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICk7XG5cbiAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuXG4gICAgICBwaWQkLmZpcnN0KCkuc3Vic2NyaWJlKCgpID0+IHsgZGlkQ29ubmVjdCgpOyB9KSxcblxuICAgICAgc2Vzc2lvbiQuc3Vic2NyaWJlKCksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgYXN5bmMgZ2V0V2Vic29ja2V0QWRkcmVzcygpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGF3YWl0IHRoaXMuX2Nvbm5lY3RlZDtcblxuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgcmV0dXJuICd3cz1sb2NhbGhvc3Q6ODA4MC8nO1xuICB9XG5cbn1cblxuLyoqXG4gKiBBIHN0cmVhbSBvZiBQSURzIHRvIGRlYnVnLCBvYnRhaW5lZCBieSBjb25uZWN0aW5nIHRvIHRoZSBwYWNrYWdlciB2aWEgdGhlIERlYnVnZ2VyUHJveHlDbGllbnQuXG4gKiBUaGlzIHN0cmVhbSBpcyBzaGFyZWQgc28gdGhhdCBvbmx5IG9uZSBjbGllbnQgaXMgY3JlYXRlZCB3aGVuIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgc3Vic2NyaWJlci5cbiAqL1xuY29uc3QgcGlkJCA9IFJ4Lk9ic2VydmFibGUudXNpbmcoXG4gICgpID0+IHtcbiAgICBjb25zdCBjbGllbnQgPSBuZXcgRGVidWdnZXJQcm94eUNsaWVudCgpO1xuICAgIGNsaWVudC5jb25uZWN0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNsaWVudCxcbiAgICAgIHVuc3Vic2NyaWJlOiAoKSA9PiB7IGNsaWVudC5kaXNjb25uZWN0KCk7IH0sXG4gICAgfTtcbiAgfSxcbiAgKHtjbGllbnR9KSA9PiBvYnNlcnZhYmxlRnJvbVN1YnNjcmliZUZ1bmN0aW9uKGNsaWVudC5vbkRpZEV2YWxBcHBsaWNhdGlvblNjcmlwdC5iaW5kKGNsaWVudCkpLFxuKVxuLnB1Ymxpc2goKTtcblxuLyoqXG4gKiBDb25uZWN0aW9ucyBmcm9tIHRoZSBDaHJvbWUgVUkuIFRoZXJlIHdpbGwgb25seSBiZSBvbmUgY29ubmVjdGlvbiBhdCBhIHRpbWUuIFRoaXMgc3RyZWFtIHdvbid0XG4gKiBjb21wbGV0ZSB1bmxlc3MgdGhlIGNvbm5lY3Rpb24gY2xvc2VzLlxuICovXG5jb25zdCB1aUNvbm5lY3Rpb24kID0gUnguT2JzZXJ2YWJsZS51c2luZyhcbiAgKCkgPT4ge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQXNzaWduIHJhbmRvbSBwb3J0IGluc3RlYWQuXG4gICAgY29uc3Qgc2VydmVyID0gbmV3IFdlYlNvY2tldFNlcnZlcih7cG9ydDogODA4MH0pO1xuICAgIHJldHVybiB7XG4gICAgICBzZXJ2ZXIsXG4gICAgICB1bnN1YnNjcmliZTogKCkgPT4geyBzZXJ2ZXIuY2xvc2UoKTsgfSxcbiAgICB9O1xuICB9LFxuICAoe3NlcnZlcn0pID0+IChcbiAgICBSeC5PYnNlcnZhYmxlLm1lcmdlKFxuICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2VydmVyLCAnZXJyb3InKS5mbGF0TWFwKFJ4Lk9ic2VydmFibGUudGhyb3cpLFxuICAgICAgUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2VydmVyLCAnY29ubmVjdGlvbicpLFxuICAgIClcbiAgICAgIC50YWtlVW50aWwoUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoc2VydmVyLCAnY2xvc2UnKSlcbiAgKSxcbilcbi5wdWJsaXNoKCk7XG5cbmZ1bmN0aW9uIGNyZWF0ZVNlc3Npb25TdHJlYW0od3M6IFdlYlNvY2tldCwgZGVidWdQb3J0OiBudW1iZXIpOiBSeC5PYnNlcnZhYmxlPFNlc3Npb25UeXBlPiB7XG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBkZWJ1Z1BvcnQsXG4gICAgLy8gVGhpcyBtYWtlcyB0aGUgbm9kZSBpbnNwZWN0b3Igbm90IGxvYWQgYWxsIHRoZSBzb3VyY2UgZmlsZXMgb24gc3RhcnR1cDpcbiAgICBwcmVsb2FkOiBmYWxzZSxcbiAgfTtcblxuICByZXR1cm4gUnguT2JzZXJ2YWJsZS5jcmVhdGUob2JzZXJ2ZXIgPT4ge1xuICAgIC8vIENyZWF0aW5nIGEgbmV3IFNlc3Npb24gaXMgYWN0dWFsbHkgc2lkZS1lZmZlY3R5LlxuICAgIGNvbnN0IHtTZXNzaW9ufSA9IHJlcXVpcmUoJy4uLy4uLy4uL251Y2xpZGUtZGVidWdnZXItbm9kZS9saWIvU2Vzc2lvbicpO1xuICAgIGNvbnN0IHNlc3Npb24gPSBuZXcgU2Vzc2lvbihjb25maWcsIGRlYnVnUG9ydCwgd3MpO1xuICAgIG9ic2VydmVyLm5leHQoc2Vzc2lvbik7XG4gICAgcmV0dXJuICgpID0+IHsgc2Vzc2lvbi5jbG9zZSgpOyB9O1xuICB9KTtcbn1cbiJdfQ==