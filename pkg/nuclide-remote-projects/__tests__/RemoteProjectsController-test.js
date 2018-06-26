'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ConnectionState;

function _load_ConnectionState() {
  return _ConnectionState = _interopRequireDefault(require('../lib/ConnectionState'));
}

var _RemoteProjectsController;

function _load_RemoteProjectsController() {
  return _RemoteProjectsController = require('../lib/RemoteProjectsController');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class MockHeartbeat {
  constructor() {
    this.away = new _rxjsBundlesRxMinJs.BehaviorSubject(false);
  }

  isAway() {
    return this.away.getValue();
  }

  onHeartbeat(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this.away.filter(x => !x).subscribe(callback));
  }

  onHeartbeatError(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this.away.filter(x => x).subscribe(callback));
  }
}

describe('_observeConnectionState', () => {
  it('reflects the state of all connections', () => {
    const connectionSubject = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
    const propStream = [];
    (0, (_RemoteProjectsController || _load_RemoteProjectsController())._observeConnectionState)(connectionSubject).subscribe(props => propStream.push(props));

    const heartbeat1 = new MockHeartbeat();
    const connection1 = {
      getRemoteHostname: () => 'host1',
      getHeartbeat: () => heartbeat1
    };
    connectionSubject.next([connection1]);

    const heartbeat2 = new MockHeartbeat();
    const connection2 = {
      getRemoteHostname: () => 'host2',
      getHeartbeat: () => heartbeat2
    };
    connectionSubject.next([connection1, connection2]);

    heartbeat1.away.next(true);
    heartbeat2.away.next(true);
    heartbeat2.away.next(false);

    connectionSubject.next([]);

    expect(propStream).toEqual([{ connectionStates: new Map() }, { connectionStates: new Map([['host1', (_ConnectionState || _load_ConnectionState()).default.CONNECTED]]) }, {
      connectionStates: new Map([['host1', (_ConnectionState || _load_ConnectionState()).default.CONNECTED], ['host2', (_ConnectionState || _load_ConnectionState()).default.CONNECTED]])
    }, {
      connectionStates: new Map([['host1', (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED], ['host2', (_ConnectionState || _load_ConnectionState()).default.CONNECTED]])
    }, {
      connectionStates: new Map([['host1', (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED], ['host2', (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED]])
    }, {
      connectionStates: new Map([['host1', (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED], ['host2', (_ConnectionState || _load_ConnectionState()).default.CONNECTED]])
    }, { connectionStates: new Map() }]);
  });
});