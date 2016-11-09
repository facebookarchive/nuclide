'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReactNativeDebuggerInstance = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports


var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('../../../commons-node/event');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../../nuclide-debugger-base');
}

var _DebuggerProxyClient;

function _load_DebuggerProxyClient() {
  return _DebuggerProxyClient = require('./DebuggerProxyClient');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _Session;

function _load_Session() {
  return _Session = require('../../../nuclide-debugger-node-rpc/lib/Session');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PORT = 38913;

/**
 * This class represents a React Native debugging session in Nuclide. Debugging React Native
 * consists of the following:
 *
 * 1. Hijacking React Native JS execution and performing it in a node process. This is the job of
 *    DebuggerProxyClient.
 * 2. Debugging the node process.
 */
let ReactNativeDebuggerInstance = exports.ReactNativeDebuggerInstance = class ReactNativeDebuggerInstance extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerInstanceBase {

  constructor(processInfo, debugPort) {
    super(processInfo);

    let didConnect;
    this._connected = new Promise(resolve => {
      didConnect = resolve;
    });

    const session$ = uiConnection$.combineLatest(pid$).switchMap((_ref) => {
      var _ref2 = _slicedToArray(_ref, 2);

      let ws = _ref2[0],
          pid = _ref2[1];
      return createSessionStream(ws, debugPort);
    }).publish();

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // Tell the user if we can't connect to the debugger UI.
    uiConnection$.subscribe(null, err => {
      atom.notifications.addError('Error connecting to debugger UI.', {
        detail: `Make sure that port ${ PORT } is open.`,
        stack: err.stack,
        dismissable: true
      });

      this.dispose();
    }), pid$.first().subscribe(() => {
      didConnect();
    }),

    // Explicitly manage connection.
    uiConnection$.connect(), session$.connect(), pid$.connect());
  }

  dispose() {
    this._subscriptions.unsubscribe();
  }

  getWebsocketAddress() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this._connected;

      // TODO(natthu): Assign random port instead.
      return `ws=localhost:${ PORT }/`;
    })();
  }

};

/**
 * A stream of PIDs to debug, obtained by connecting to the packager via the DebuggerProxyClient.
 * This stream is shared so that only one client is created when there is more than one subscriber.
 */
// $FlowFixMe(matthewwithanm): Type this.

const pid$ = _rxjsBundlesRxMinJs.Observable.using(() => {
  const client = new (_DebuggerProxyClient || _load_DebuggerProxyClient()).DebuggerProxyClient();
  client.connect();
  return {
    client: client,
    unsubscribe: () => {
      client.disconnect();
    }
  };
}, (_ref3) => {
  let client = _ref3.client;
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(client.onDidEvalApplicationScript.bind(client));
}).publish();

/**
 * Connections from the Chrome UI. There will only be one connection at a time. This stream won't
 * complete unless the connection closes.
 */
// $FlowFixMe(matthewwithanm): Type this.
const uiConnection$ = _rxjsBundlesRxMinJs.Observable.using(() => {
  // TODO(natthu): Assign random port instead.
  const server = new (_ws || _load_ws()).default.Server({ port: PORT });
  return {
    server: server,
    unsubscribe: () => {
      server.close();
    }
  };
}, (_ref4) => {
  let server = _ref4.server;
  return _rxjsBundlesRxMinJs.Observable.merge(_rxjsBundlesRxMinJs.Observable.fromEvent(server, 'error').flatMap(_rxjsBundlesRxMinJs.Observable.throw), _rxjsBundlesRxMinJs.Observable.fromEvent(server, 'connection')).takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(server, 'close'));
}).publish();

function createSessionStream(ws, debugPort) {
  const config = {
    debugPort: debugPort,
    // This makes the node inspector not load all the source files on startup:
    preload: false
  };

  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    // Creating a new Session is actually side-effecty.
    const session = new (_Session || _load_Session()).Session(config, debugPort, ws);
    observer.next(session);
    return () => {
      session.close();
    };
  });
}