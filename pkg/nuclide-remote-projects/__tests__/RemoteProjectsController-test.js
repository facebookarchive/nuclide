"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _ConnectionState() {
  const data = _interopRequireDefault(require("../lib/ConnectionState"));

  _ConnectionState = function () {
    return data;
  };

  return data;
}

function _RemoteProjectsController() {
  const data = require("../lib/RemoteProjectsController");

  _RemoteProjectsController = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
class MockHeartbeat {
  constructor() {
    this.away = new _RxMin.BehaviorSubject(false);
  }

  isAway() {
    return this.away.getValue();
  }

  onHeartbeat(callback) {
    return new (_UniversalDisposable().default)(this.away.filter(x => !x).subscribe(callback));
  }

  onHeartbeatError(callback) {
    return new (_UniversalDisposable().default)(this.away.filter(x => x).subscribe(callback));
  }

}

describe('_observeConnectionState', () => {
  it('reflects the state of all connections', () => {
    const connectionSubject = new _RxMin.BehaviorSubject([]);
    const propStream = [];
    (0, _RemoteProjectsController()._observeConnectionState)(connectionSubject).subscribe(props => propStream.push(props));
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
    expect(propStream).toEqual([{
      connectionStates: new Map()
    }, {
      connectionStates: new Map([['host1', _ConnectionState().default.CONNECTED]])
    }, {
      connectionStates: new Map([['host1', _ConnectionState().default.CONNECTED], ['host2', _ConnectionState().default.CONNECTED]])
    }, {
      connectionStates: new Map([['host1', _ConnectionState().default.DISCONNECTED], ['host2', _ConnectionState().default.CONNECTED]])
    }, {
      connectionStates: new Map([['host1', _ConnectionState().default.DISCONNECTED], ['host2', _ConnectionState().default.DISCONNECTED]])
    }, {
      connectionStates: new Map([['host1', _ConnectionState().default.DISCONNECTED], ['host2', _ConnectionState().default.CONNECTED]])
    }, {
      connectionStates: new Map()
    }]);
  });
});