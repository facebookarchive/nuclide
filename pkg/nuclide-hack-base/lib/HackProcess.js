'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessMaker} from '../../commons-node/RpcProcess';

import {asyncExecute, safeSpawn} from '../../commons-node/process';
import RpcProcess from '../../commons-node/RpcProcess';
import {getHackCommand, findHackConfigDir} from './hack-config';
import {ServiceRegistry} from '../../nuclide-rpc';

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

import {logger} from './hack-config';

function getServiceRegistry(): ServiceRegistry {
  throw new Error('TODO');
}

class HackProcess extends RpcProcess {
  _hhconfigPath: string;

  constructor(name: string, createProcess: ProcessMaker, hhconfigPath: string) {
    super(name, getServiceRegistry(), createProcess);
    this._hhconfigPath = hhconfigPath;
  }

  getRoot(): string {
    return this._hhconfigPath;
  }

  dispose(): void {
    super.dispose();
    processes.delete(this._hhconfigPath);
  }
}

// Maps hack config dir to HackProcess
const processes: Map<string, Promise<?HackProcess>> = new Map();

async function getHackProcess(filePath: string): Promise<?HackProcess> {
  const command = await getHackCommand();
  if (command === '') {
    return null;
  }

  const configDir = await findHackConfigDir(filePath);
  if (configDir == null) {
    return null;
  }

  let hackProcess = processes.get(configDir);
  if (hackProcess == null) {
    hackProcess = createHackProcess(command, configDir);
    processes.set(configDir, hackProcess);
    hackProcess.then(result => {
      // If we fail to connect to hack, then retry on next request.
      if (result == null) {
        processes.delete(configDir);
      }
    });
  }
  return hackProcess;
}

async function createHackProcess(command: string, configDir: string): Promise<?HackProcess> {
  logger.logInfo(`Creating new hack connection for ${configDir}: ${command}`);
  logger.logInfo(`Current PATH: ${process.env.PATH}`);
  const startServerResult = await asyncExecute(command, ['start', configDir]);
  logger.logInfo(
    `Hack connection start server results:\n${JSON.stringify(startServerResult, null, 2)}\n`);
  if (startServerResult.exitCode !== 0 &&
      startServerResult.exitCode !== HACK_SERVER_ALREADY_EXISTS_EXIT_CODE) {
    return null;
  }
  const createProcess = () => safeSpawn(command, ['ide', configDir]);
  return new HackProcess(`HackProcess-${configDir}`, createProcess, configDir);
}

/**
 * Executes hh_client with proper arguments returning the result string or json object.
 */
export async function callHHClientUsingProcess(
 args: Array<any>,
 processInput: ?string,
 filePath: string): Promise<?{hackRoot: string; result: string | Object}> {

  const hackProcess: ?HackProcess = await getHackProcess(filePath);
  if (hackProcess == null) {
    return null;
  }

  if (processInput != null) {
    args.push(processInput);
  }
  // TODO: This needs to be reworked
  throw new Error('TODO');
}
