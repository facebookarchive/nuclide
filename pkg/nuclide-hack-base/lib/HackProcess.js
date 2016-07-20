'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackConnectionService from './HackConnectionService';
import type {ProcessMaker} from '../../commons-node/RpcProcess';

import nuclideUri from '../../nuclide-remote-uri';
import {asyncExecute, safeSpawn} from '../../commons-node/process';
import {maybeToString} from '../../commons-node/string';
import RpcProcess from '../../commons-node/RpcProcess';
import {getHackCommand, findHackConfigDir} from './hack-config';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import invariant from 'assert';

// From https://reviews.facebook.net/diffusion/HHVM/browse/master/hphp/hack/src/utils/exit_status.ml
const HACK_SERVER_ALREADY_EXISTS_EXIT_CODE = 77;

import {logger} from './hack-config';

let serviceRegistry: ?ServiceRegistry = null;

function getServiceRegistry(): ServiceRegistry {
  if (serviceRegistry == null) {
    serviceRegistry = ServiceRegistry.createLocal(
      loadServicesConfig(nuclideUri.join(__dirname, '..')),
    );
  }
  return serviceRegistry;
}

function logMessage(direction: string, message: string): void {
  logger.logInfo(`Hack Connection message ${direction}: '${message}'`);
}

class HackProcess extends RpcProcess {
  _hhconfigPath: string;

  constructor(name: string, createProcess: ProcessMaker, hhconfigPath: string) {
    super(name, getServiceRegistry(), createProcess, logMessage);
    this._hhconfigPath = hhconfigPath;
  }

  getRoot(): string {
    return this._hhconfigPath;
  }

  getConnectionService(): Promise<HackConnectionService> {
    invariant(!this.isDisposed(), 'getService called on disposed hackProcess');
    return this.getService('HackConnectionService');
  }

  dispose(): void {
    this._dispose();
  }

  async _dispose(): Promise<void> {
    processes.delete(this._hhconfigPath);
    // Atempt to send disconnect message
    try {
      (await this.getConnectionService()).disconnect();
    } catch (e) {
      logger.logError('Error disconnecting from Hack connection.');
    }
    super.dispose();
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
  return await hackProcess;
}

async function createHackProcess(command: string, configDir: string): Promise<?HackProcess> {
  logger.logInfo(`Creating new hack connection for ${configDir}: ${command}`);
  logger.logInfo(`Current PATH: ${maybeToString(process.env.PATH)}`);
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

export async function getHackConnectionService(filePath: string): Promise<?HackConnectionService> {
  const process = await getHackProcess(filePath);
  if (process == null) {
    return null;
  }
  return process.getConnectionService();
}
