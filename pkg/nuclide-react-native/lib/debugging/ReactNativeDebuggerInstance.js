Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../../commons-node/stream');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../../commons-node/event');
}

var _nuclideDebuggerAtom2;

function _nuclideDebuggerAtom() {
  return _nuclideDebuggerAtom2 = require('../../../nuclide-debugger-atom');
}

var _nuclideReactNativeNodeExecutorLibDebuggerProxyClient2;

function _nuclideReactNativeNodeExecutorLibDebuggerProxyClient() {
  return _nuclideReactNativeNodeExecutorLibDebuggerProxyClient2 = require('../../../nuclide-react-native-node-executor/lib/DebuggerProxyClient');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var PORT = 38913;

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

    var session$ = uiConnection$.combineLatest(pid$).switchMap(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var ws = _ref2[0];
      var pid = _ref2[1];
      return createSessionStream(ws, debugPort);
    }).publish();

    this._subscriptions = new (_commonsNodeStream2 || _commonsNodeStream()).CompositeSubscription(
    // Tell the user if we can't connect to the debugger UI.
    uiConnection$.subscribe(null, function (err) {
      atom.notifications.addError('Error connecting to debugger UI.', {
        detail: 'Make sure that port ' + PORT + ' is open.',
        stack: err.stack,
        dismissable: true
      });

      _this.dispose();
    }), pid$.first().subscribe(function () {
      didConnect();
    }),

    // Explicitly manage connection.
    uiConnection$.connect(), session$.connect(), pid$.connect());
  }

  /**
   * A stream of PIDs to debug, obtained by connecting to the packager via the DebuggerProxyClient.
   * This stream is shared so that only one client is created when there is more than one subscriber.
   */
  // $FlowFixMe(matthewwithanm): Type this.

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
      return 'ws=localhost:' + PORT + '/';
    })
  }]);

  return ReactNativeDebuggerInstance;
})((_nuclideDebuggerAtom2 || _nuclideDebuggerAtom()).DebuggerInstance);

exports.ReactNativeDebuggerInstance = ReactNativeDebuggerInstance;
var pid$ = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.using(function () {
  var client = new (_nuclideReactNativeNodeExecutorLibDebuggerProxyClient2 || _nuclideReactNativeNodeExecutorLibDebuggerProxyClient()).DebuggerProxyClient();
  client.connect();
  return {
    client: client,
    unsubscribe: function unsubscribe() {
      client.disconnect();
    }
  };
}, function (_ref3) {
  var client = _ref3.client;
  return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(client.onDidEvalApplicationScript.bind(client));
}).publish();

/**
 * Connections from the Chrome UI. There will only be one connection at a time. This stream won't
 * complete unless the connection closes.
 */
// $FlowFixMe(matthewwithanm): Type this.
var uiConnection$ = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.using(function () {
  // TODO(natthu): Assign random port instead.
  var server = new (_ws2 || _ws()).default.Server({ port: PORT });
  return {
    server: server,
    unsubscribe: function unsubscribe() {
      server.close();
    }
  };
}, function (_ref4) {
  var server = _ref4.server;
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(server, 'error').flatMap((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.throw), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(server, 'connection')).takeUntil((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(server, 'close'));
}).publish();

function createSessionStream(ws, debugPort) {
  var config = {
    debugPort: debugPort,
    // This makes the node inspector not load all the source files on startup:
    preload: false
  };

  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.create(function (observer) {
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