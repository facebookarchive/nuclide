'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  safeSpawn,
  observeStream,
  asyncExecute,
} from '../../nuclide-commons';
import {getHackCommand, findHackConfigDir} from './hack-config';
import {StreamTransport, HackRpc} from './HackRpc';

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

const logger = require('../../nuclide-logging').getLogger();

class HackConnection {
  _hhconfigPath: string;
  _process: ?child_process$ChildProcess;
  _rpc: ?HackRpc;

  constructor(hhconfigPath: string, process: child_process$ChildProcess) {
    this._hhconfigPath = hhconfigPath;
    this._process = process;
    this._rpc = new HackRpc(new StreamTransport(process.stdin, process.stdout));

    process.on('exit', (code, signal) => {
      logger.info(`Hack ide process exited with ${code}, ${signal}`);
      this._process = null;
      this.dispose();
    });
  }

  call(args: Array<any>): Promise<string | Object> {
    if (this._rpc == null) {
      throw new Error('Attempting to call on disposed hack connection.');
    }
    return this._rpc.call(args);
  }

  getRoot(): string {
    return this._hhconfigPath;
  }

  dispose(): void {
    logger.info(`Disposing hack connection ${this._hhconfigPath}`);
    if (this._rpc != null) {
      this._rpc.dispose();
      connections.delete(this._hhconfigPath);
      if (this._process != null) {
        this._process.kill();
        this._process = null;
      }
    }
  }

  isDisposed(): boolean {
    return this._rpc == null;
  }
}

// Maps hack config dir to HackConnection
const connections: Map<string, Promise<?HackConnection>> = new Map();

async function getHackConnection(filePath: string): Promise<?HackConnection> {
  const command = await getHackCommand();
  if (command === '') {
    return null;
  }

  const configDir = await findHackConfigDir(filePath);
  if (configDir == null) {
    return null;
  }

  let connection = connections.get(configDir);
  if (connection == null) {
    connection = createConnection(command, configDir);
    connections.set(configDir, connection);
    connection.then(result => {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        connections.delete(configDir);
      }
    });
  }
  return connection;
}

async function createConnection(command: string, configDir: string): Promise<?HackConnection> {
  logger.info(`Creating new hack connection for ${configDir}: ${command}`);
  logger.info(`Current PATH: ${process.env.PATH}`);
  const startServerResult = await asyncExecute(command, ['start', configDir]);
  logger.info(
    `Hack connection start server results:\n${JSON.stringify(startServerResult, null, 2)}\n`);
  if (startServerResult.exitCode !== 0 &&
      startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  const childProcess = await safeSpawn(command, ['ide', configDir]);
  observeStream(childProcess.stdout).subscribe(text => {
    logger.info(`Hack ide stdout: ${text}`);
  });
  observeStream(childProcess.stderr).subscribe(text => {
    logger.info(`Hack ide stderr: ${text}`);
  });
  return new HackConnection(configDir, childProcess);
}

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
export async function callHHClientUsingConnection(
 args: Array<any>,
 processInput: ?string,
 filePath: string): Promise<?{hackRoot: string; result: string | Object}> {

  const connection: ?HackConnection = await getHackConnection(filePath);
  if (connection == null) {
    return null;
  }

  if (processInput != null) {
    args.push(processInput);
  }
  const result = await connection.call(args);
  return {
    hackRoot: connection.getRoot(),
    result,
  };
}
