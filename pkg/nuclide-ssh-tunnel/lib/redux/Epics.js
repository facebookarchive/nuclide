"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribeToTunnelEpic = subscribeToTunnelEpic;
exports.unsubscribeFromTunnelEpic = unsubscribeFromTunnelEpic;
exports.requestTunnelEpic = requestTunnelEpic;
exports.openTunnelEpic = openTunnelEpic;
exports.closeTunnelEpic = closeTunnelEpic;

function _Normalization() {
  const data = require("../Normalization");

  _Normalization = function () {
    return data;
  };

  return data;
}

function _Whitelist() {
  const data = require("../Whitelist");

  _Whitelist = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _Tunnel() {
  const data = require("../../../nuclide-socket-rpc/lib/Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireDefault(require("../../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const logger = (0, _log4js().getLogger)('nuclide-ssh-tunnel');

function subscribeToTunnelEpic(actions, store) {
  return actions.ofType(Actions().SUBSCRIBE_TO_TUNNEL).mergeMap(async action => {
    if (!(action.type === Actions().SUBSCRIBE_TO_TUNNEL)) {
      throw new Error("Invariant violation: \"action.type === Actions.SUBSCRIBE_TO_TUNNEL\"");
    }

    const {
      onOpen,
      subscription,
      tunnel
    } = action.payload;
    const {
      tunnels
    } = store.getState();
    const activeTunnel = tunnels.get(tunnel);

    if (!activeTunnel) {
      throw new Error("Invariant violation: \"activeTunnel\"");
    }

    if (activeTunnel.subscriptions.count() > 1) {
      const friendlyString = `${(0, _Tunnel().tunnelDescription)(tunnel)} (${subscription.description})`;
      store.getState().consoleOutput.next({
        text: `Reusing tunnel: ${friendlyString}`,
        level: 'info'
      });
      onOpen(null);
      return null;
    }

    return Actions().requestTunnel(subscription.description, tunnel, onOpen, subscription.onTunnelClose);
  }).mergeMap(action => {
    if (action == null) {
      return _RxMin.Observable.empty();
    } else {
      return _RxMin.Observable.of(action);
    }
  });
}

function unsubscribeFromTunnelEpic(actions, store) {
  return actions.ofType(Actions().UNSUBSCRIBE_FROM_TUNNEL).mergeMap(async action => {
    if (!(action.type === Actions().UNSUBSCRIBE_FROM_TUNNEL)) {
      throw new Error("Invariant violation: \"action.type === Actions.UNSUBSCRIBE_FROM_TUNNEL\"");
    }

    const {
      subscription,
      tunnel
    } = action.payload;
    const {
      tunnels
    } = store.getState();
    const activeTunnel = tunnels.get(tunnel);

    if (activeTunnel == null || activeTunnel.error != null || activeTunnel.state === 'initializing') {
      // We want to show the tunnel error message only once, not for every subscription.
      return null;
    }

    const friendlyString = `${(0, _Tunnel().tunnelDescription)(tunnel)} (${subscription.description})`;

    if (activeTunnel.subscriptions.count() > 0) {
      store.getState().consoleOutput.next({
        text: `Stopped reusing tunnel: ${friendlyString}`,
        level: 'info'
      }); // Don't close the tunnel just yet, there are other subscribers.

      return null;
    } else {
      store.getState().consoleOutput.next({
        text: `Closed tunnel: ${friendlyString}`,
        level: 'info'
      });
    }

    if (activeTunnel.state === 'closing') {
      return null;
    }

    return Actions().closeTunnel(tunnel, null);
  }).mergeMap(action => {
    if (action == null) {
      return _RxMin.Observable.empty();
    } else {
      return _RxMin.Observable.of(action);
    }
  });
}

function requestTunnelEpic(actions, store) {
  return actions.ofType(Actions().REQUEST_TUNNEL).mergeMap(async action => {
    if (!(action.type === Actions().REQUEST_TUNNEL)) {
      throw new Error("Invariant violation: \"action.type === Actions.REQUEST_TUNNEL\"");
    }

    const {
      tunnel,
      onOpen
    } = action.payload;
    const {
      from,
      to
    } = tunnel;
    const [useBigDigTunnel, isValidated] = await Promise.all([(0, _passesGK().default)('nuclide_big_dig_tunnel'), (0, _Whitelist().validateTunnel)(tunnel)]);

    if (!isValidated) {
      onOpen(new Error(`Trying to open a tunnel on a non-whitelisted port: ${to.port}\n\n` + 'Contact the Nuclide team if you would like this port to be available.'));
      return null;
    }

    const remoteTunnelHost = from.host === 'localhost' ? to : from;
    const localTunnelHost = from.host === 'localhost' ? from : to;
    const isReverse = from.host !== 'localhost';
    const useIPv4 = to.family === 4;
    const fromService = (0, _Normalization().getSocketServiceByHost)(from.host);
    const toService = (0, _Normalization().getSocketServiceByHost)(to.host);
    const bigDigClient = (0, _nuclideRemoteConnection().getBigDigClientByNuclideUri)(remoteTunnelHost.host);
    let clientCount = 0;
    const connectionFactory = await toService.getConnectionFactory();
    let subscription;
    let newTunnelPromise;
    let isTunnelOpen = false;

    const open = () => {
      if (!useBigDigTunnel) {
        const events = fromService.createTunnel(tunnel, connectionFactory);
        subscription = events.refCount().subscribe({
          next: event => {
            if (event.type === 'server_started') {
              const state = store.getState();
              const activeTunnel = state.tunnels.get(tunnel);

              if (!activeTunnel) {
                throw new Error("Invariant violation: \"activeTunnel\"");
              }

              const friendlyString = `${(0, _Tunnel().tunnelDescription)(tunnel)} (${activeTunnel.subscriptions.map(s => s.description).join(', ')})`;
              state.consoleOutput.next({
                text: `Opened tunnel: ${friendlyString}`,
                level: 'info'
              });
              isTunnelOpen = true;
              store.dispatch(Actions().setTunnelState(tunnel, 'ready'));
              onOpen();
            } else if (event.type === 'client_connected') {
              clientCount++;
              store.dispatch(Actions().setTunnelState(tunnel, 'active'));
            } else if (event.type === 'client_disconnected') {
              clientCount--;

              if (clientCount === 0) {
                store.dispatch(Actions().setTunnelState(tunnel, 'ready'));
              }
            }
          },
          error: error => {
            if (!isTunnelOpen) {
              onOpen(error);
            }

            store.dispatch(Actions().closeTunnel(tunnel, error));
          }
        });
      } else {
        logger.info(`using Big Dig to create a tunnel: ${localTunnelHost.port}<=>${remoteTunnelHost.port}`);
        newTunnelPromise = bigDigClient.createTunnel(localTunnelHost.port, remoteTunnelHost.port, isReverse, useIPv4).catch(error => {
          onOpen(error);
          store.dispatch(Actions().closeTunnel(tunnel, error));
          throw error;
        });
        newTunnelPromise.then(newTunnel => {
          newTunnel.on('error', error => {
            logger.error('error from tunnel: ', error);
            store.dispatch(Actions().closeTunnel(tunnel, error));
          });
          store.dispatch(Actions().setTunnelState(tunnel, 'ready'));
          onOpen();
          const friendlyString = `${(0, _Tunnel().tunnelDescription)(tunnel)}`;
          const state = store.getState();
          state.consoleOutput.next({
            text: `Opened tunnel: ${friendlyString}`,
            level: 'info'
          });
        });
      }
    };

    let close;

    if (!useBigDigTunnel) {
      close = () => subscription.unsubscribe();
    } else {
      close = () => {
        newTunnelPromise.then(newTunnel => newTunnel.close()).catch(e => {
          logger.error('Tunnel error on close: ', e);
        });
      };
    }

    return Actions().openTunnel(tunnel, open, close);
  }).mergeMap(action => {
    if (action == null) {
      return _RxMin.Observable.empty();
    } else {
      return _RxMin.Observable.of(action);
    }
  });
}

function openTunnelEpic(actions, store) {
  return actions.ofType(Actions().OPEN_TUNNEL).do(action => {
    if (!(action.type === Actions().OPEN_TUNNEL)) {
      throw new Error("Invariant violation: \"action.type === Actions.OPEN_TUNNEL\"");
    }

    action.payload.open();
  }).ignoreElements();
}

function closeTunnelEpic(actions, store) {
  return actions.ofType(Actions().CLOSE_TUNNEL).map(action => {
    if (!(action.type === Actions().CLOSE_TUNNEL)) {
      throw new Error("Invariant violation: \"action.type === Actions.CLOSE_TUNNEL\"");
    }

    const {
      tunnels
    } = store.getState();
    const {
      error,
      tunnel
    } = action.payload;
    const activeTunnel = tunnels.get(tunnel);

    if (activeTunnel != null) {
      if (activeTunnel.close != null) {
        activeTunnel.close(error);
      }

      activeTunnel.subscriptions.forEach(s => s.onTunnelClose(error));

      if (error != null) {
        const friendlyString = `${(0, _Tunnel().tunnelDescription)(tunnel)} (${activeTunnel.subscriptions.map(s => s.description).join(', ')})`;
        store.getState().consoleOutput.next({
          text: `Tunnel error: ${friendlyString}\n${error.message}`,
          level: 'error'
        });
      }
    }

    return Actions().deleteTunnel(tunnel);
  });
}