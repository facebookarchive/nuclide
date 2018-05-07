/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Connection, ConnectionFactory} from './Connection';
import type {ResolvedTunnel, SocketEvent, IRemoteSocket} from './types.js';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {getLogger} from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {ConnectableObservable, Observable} from 'rxjs';

import net from 'net';

const LOG_DELTA = 500000; // log for every half megabyte of transferred data
const DEBUG_VERBOSE = false;

export function createTunnel(
  t: ResolvedTunnel,
  cf: ConnectionFactory,
): ConnectableObservable<SocketEvent> {
  const logStatsIfNecessary = getStatLogger(LOG_DELTA);
  let bytesReceived: number = 0;
  let bytesWritten: number = 0;

  return Observable.create(observer => {
    const tunnel = t;
    trace(`Tunnel: creating tunnel -- ${tunnelDescription(tunnel)}`);

    const {port, family} = tunnel.from;
    const connections: Map<number, Promise<Connection>> = new Map();

    // set up server to start listening for connections
    // on client_connected
    const listener: net.Server = net.createServer(async socket => {
      const clientPort = socket.remotePort;

      if (DEBUG_VERBOSE) {
        trace('Tunnel: client connected on remote port ' + clientPort);
      }
      observer.next({type: 'client_connected', clientPort});

      // create outgoing connection using connection factory
      const localSocket = new LocalSocket(socket);
      localSocket.onWrite(count => {
        bytesWritten += count;
        if (DEBUG_VERBOSE) {
          logStatsIfNecessary(bytesWritten, bytesReceived);
        }
      });
      const remoteSocket = new RemoteSocket(localSocket);
      const connectionPromise = cf.createConnection(tunnel.to, remoteSocket);
      connections.set(clientPort, connectionPromise);

      // set up socket listeners
      socket.on('timeout', () => {
        trace(`Tunnel: timeout (port: ${clientPort}, ${this.toString()})`);
      });

      if (DEBUG_VERBOSE) {
        socket.on('end', () => {
          trace(
            `Tunnel: end (port: ${clientPort}, ${tunnelDescription(tunnel)})`,
          );
        });
      }

      socket.on('error', err => {
        trace(
          `Tunnel: error (port: ${clientPort}, ${tunnelDescription(tunnel)})`,
        );
        trace(`Tunnel: error (server: ${port}, client: ${clientPort}): ${err}`);
        socket.destroy(err);
      });

      // on data from incoming client
      // write data to the outgoing connection
      socket.on('data', data => {
        connectionPromise.then(connection => {
          connection.write(data);
          bytesReceived += data.length;
          logStatsIfNecessary(bytesWritten, bytesReceived);
        });
      });

      socket.on('close', () => {
        // on client_disconnect remove and dispose the connection
        if (DEBUG_VERBOSE) {
          trace(
            `Tunnel: close (port: ${clientPort}, ${tunnelDescription(tunnel)})`,
          );
        }
        connectionPromise.then(connection => {
          connection.dispose();
          connections.delete(clientPort);
        });
        observer.next({type: 'client_disconnected', clientPort});
      });
    });

    listener.on('error', err => {
      trace(`Tunnel: error listening on port ${port}): ${err}`);
      observer.error(err);
    });

    listener.listen({host: family === 6 ? '::' : '0.0.0.0', port}, () => {
      trace('Tunnel: server listening on port ' + port);
      observer.next({type: 'server_started'});
    });

    return () => {
      trace(`Tunnel: shutting down tunnel ${tunnelDescription(tunnel)}`);
      connections.forEach(connectionPromise =>
        connectionPromise.then(conn => {
          conn.dispose();
        }),
      );
      connections.clear();
      cf.dispose();
      listener.close();
    };
  }).publish();
}

export function tunnelDescription(tunnel: ResolvedTunnel) {
  return `${shortenHostname(tunnel.from.host)}:${
    tunnel.from.port
  }->${shortenHostname(tunnel.to.host)}:${tunnel.to.port}`;
}

export function shortenHostname(host: NuclideUri): string {
  let result = host;
  if (nuclideUri.isRemote(result)) {
    result = nuclideUri.getHostname(result);
  }
  if (result.endsWith('.facebook.com')) {
    result = result.slice(0, result.length - '.facebook.com'.length);
  }
  if (result.startsWith('our.')) {
    result = result.slice('our.'.length, result.length);
  }
  if (result.startsWith('twsvcscm.')) {
    result = result.slice('twsvcscm.'.length, result.length);
  }
  return result;
}

class LocalSocket {
  _socket: net.Socket;
  _writeListener: (byteCount: number) => void;

  constructor(socket: net.Socket) {
    this._socket = socket;
    this._writeListener = (byteCount: number) => {};
  }

  onWrite(listener: (byteCount: number) => void) {
    this._writeListener = listener;
  }

  write(data: Buffer): void {
    this._socket.write(data);
    this._writeListener(data.length);
  }

  end(): void {
    this._socket.end();
  }
}

export class RemoteSocket implements IRemoteSocket {
  _socket: LocalSocket | net.Socket;

  constructor(socket: LocalSocket | net.Socket) {
    this._socket = socket;
  }

  write(data: Buffer): void {
    this._socket.write(data);
  }

  dispose(): void {
    this._socket.end();
  }
}

function getStatLogger(delta): (number, number) => void {
  let lastLoggedBytes: number = 0;
  return (bytesWritten: number, bytesReceived: number): void => {
    const totalBytes = bytesWritten + bytesReceived;
    if (totalBytes > lastLoggedBytes + delta) {
      lastLoggedBytes = totalBytes;
      logStats(bytesWritten, bytesReceived, totalBytes);
    }
  };
}

function logStats(
  bytesWritten: number,
  bytesReceived: number,
  totalBytes: number,
): void {
  trace(
    `Tunnel: ${totalBytes} bytes transferred; ${bytesWritten} written, ${bytesReceived} received`,
  );
}

function trace(message: string) {
  getLogger('SocketService').trace(message);
}
