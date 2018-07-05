/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {DebugConfigurationWithBigDig} from './types';
import type {DebuggerConfig} from 'big-dig-vscode-server/Protocol';
import type {DebugConfigurationProvider} from 'vscode';
import type {Server} from '../remote/Server';

import * as vscode from 'vscode';
import {BigDigDebugServer} from './BigDigDebugServer';
import {getLogger} from 'log4js';
import {arrayFlatten} from 'nuclide-commons/collection';

import {getServers} from '../remote';

const logger = getLogger('big-dig-debug-provider');

type ServerWithConfig = {
  server: Server,
  config: DebugConfigurationWithBigDig,
};

export class BigDigDebugConfigurationProvider
  implements DebugConfigurationProvider {
  _debugServers: Array<BigDigDebugServer>;

  /**
   * @param servers Iterable that can iterate the current set of remote servers.
   *   As such, the results of an iteration should not be cached so they do not
   *   go stale.
   */
  constructor() {
    this._debugServers = [];
  }

  /**
   * This method does not appear to be called unless `onDebug` is listed
   * explicitly in the activationEvents for this extension. I tried this after
   * reading through https://github.com/Microsoft/vscode/issues/43113, but we
   * may need a separate issue for this.
   */
  async provideDebugConfigurations(
    folder: ?vscode.WorkspaceFolder,
    token: ?vscode.CancellationToken,
  ): vscode.ProviderResult<Array<vscode.DebugConfiguration>> {
    logger.info(
      `provideDebugConfigurations(${String(folder)}, ${String(token)})`,
    );
    const configurations = await fetchDebuggerConfigurations();
    logger.info(
      `returning configurations: ${JSON.stringify(configurations, null, 2)}`,
    );
    return ((configurations: any): Array<vscode.DebugConfiguration>);
  }

  async resolveDebugConfiguration(
    folder: ?vscode.WorkspaceFolder,
    config: vscode.DebugConfiguration,
    token: ?vscode.CancellationToken,
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    logger.info(`resolveDebugConfiguration(${JSON.stringify(config)})`);
    let debugServer;
    // Apparently this field may be unset if launch.json is missing or
    // empty (or if VS Code has a bug reading launch.json because it is a remote
    // file).
    // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
    if (config.bigdig == null) {
      logger.error(`No "bigdig" property on config: ${JSON.stringify(config)}`);
      debugServer = await createSomeBigDigDebugServer();
    } else {
      debugServer = await this._findOrCreateDebugServerForConfig(config);
    }

    if (debugServer != null) {
      const fullConfig = debugServer.getConfig();
      logger.info(`Returning DebugConfiguration ${JSON.stringify(fullConfig)}`);
      return fullConfig;
    } else {
      logger.info('Could not find a corresponding DebugConfiguration.');
      return null;
    }
  }

  async _findOrCreateDebugServerForConfig(
    config: vscode.DebugConfiguration,
  ): Promise<BigDigDebugServer> {
    throw new Error(
      '_findOrCreateDebugServerForConfig() not implemented because ' +
        "VS Code isn't giving us non-empty configs yet, anyway.",
    );
  }

  dispose() {
    this._debugServers.forEach(server => server.dispose());
    this._debugServers.length = 0;
  }
}

/**
 * Fetches all debugger configurations for all remote root folders.
 */
async function fetchDebuggerConfigurations(): Promise<Array<ServerWithConfig>> {
  const {workspaceFolders} = vscode.workspace;
  if (workspaceFolders == null) {
    return [];
  }

  const authorityToFolders: Map<string, Array<vscode.Uri>> = new Map();
  for (const folder of workspaceFolders) {
    const {uri} = folder;
    if (uri.scheme !== 'big-dig') {
      continue;
    }

    const {authority} = uri;
    let folders = authorityToFolders.get(authority);
    if (folders == null) {
      folders = [];
      authorityToFolders.set(authority, folders);
    }
    folders.push(uri);
  }

  const listOfConfigurationLists = await Promise.all(
    getServers().map(
      async (server): Promise<Array<ServerWithConfig>> => {
        const folders = authorityToFolders.get(server.getAddress());
        if (folders == null) {
          return [];
        }

        const configurationsForFoldersOnServer = await Promise.all(
          folders.map(uri =>
            fetchDebuggerConfigurationsForDirectory(uri.path, server),
          ),
        );
        return arrayFlatten(configurationsForFoldersOnServer);
      },
    ),
  );
  return arrayFlatten(listOfConfigurationLists);
}

/**
 * Fetches the debugger configurations for a specific directory on a remote
 * machine.
 */
async function fetchDebuggerConfigurationsForDirectory(
  directory: string,
  server: Server,
): Promise<Array<ServerWithConfig>> {
  const connection = await server.connect();
  const debuggerList = await connection.debuggerList(directory);
  return Object.entries(debuggerList.debuggerConfigs).map(entry => {
    const [name, _config] = entry;
    const config: DebuggerConfig = (_config: any);
    // $FlowIssue: I have no idea what Flow is complaining about.
    const debugConfiguration: DebugConfigurationWithBigDig = {
      type: 'big-dig',
      name: `${name} Remote Debugger (${server.getAddress()})`,
      hostname: server.getAddress(),
      request: config.request,

      // Properties that are not part of the vscode.DebugConfiguration
      // interface.
      bigdig: config,
    };
    return {server, config: debugConfiguration};
  });
}

/**
 * This is called when the vscode.DebugConfiguration that was requested is
 * empty. Because we have no information to go on, we just use the first config
 * that we find to create the BigDigDebugServer.
 */
async function createSomeBigDigDebugServer(): Promise<?BigDigDebugServer> {
  const configurations = await fetchDebuggerConfigurations();
  if (configurations.length === 0) {
    return null;
  } else {
    const {server, config} = configurations[0];
    const connectionWrapper = await server.connect();
    return new BigDigDebugServer(connectionWrapper, config);
  }
}
