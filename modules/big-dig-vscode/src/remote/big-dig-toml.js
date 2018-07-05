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

import type {ConnectionWrapper} from '../ConnectionWrapper';
import type {LspConfig} from 'big-dig-vscode-server/Protocol';

import * as vscode from 'vscode';
import * as pathModule from 'path';
import {getLogger} from 'log4js';

import {onEachFilesystem} from './index';
import {RemoteFileSystem} from '../RemoteFileSystem';
import {createLsp} from '../LspProxy';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

const logger = getLogger('LSP');

/**
 * Finds the appropriate .bigdig.toml for the remote file system, parses it,
 * and kicks off the process to start each LSP in the config. These are wrapped
 * up in a single Disposable so that they can all be torn down when the
 * connection is closed.
 */
export function startBigDigTomlServices(): IDisposable {
  return onEachFilesystem(fs =>
    fs
      .getServer()
      .onEachConnection(conn => createServicesForConnection(fs, conn)),
  );
}

async function createServicesForConnection(
  filesystem: RemoteFileSystem,
  conn: ConnectionWrapper,
): Promise<IDisposable> {
  // Make sure we don't process the same config file more than once.
  const tomlFiles = new Set();

  const cleanups = await Promise.all(
    filesystem.getWorkspaceFolders().map(async folder => {
      const path = filesystem.uriToPath(folder.uri);
      // For now, automatically start all LSPs in .bigdig.toml. Going forward,
      // we should probably wait until a file matching the DocumentSelector is
      // opened, prompt to install suggested extensions, etc.
      const {configFile, lspConfigs} = await conn.lspList(path);

      // Do not process the same config file more than once.
      if (configFile == null || tomlFiles.has(configFile)) {
        return null;
      }

      tomlFiles.add(configFile);
      logger.info(`.bigdig.toml was found at ${configFile}.`);

      return createServicesForFolder(filesystem, conn, configFile, lspConfigs);
    }),
  );

  return new vscode.Disposable.from(...cleanups.filter(Boolean));
}

async function createServicesForFolder(
  filesystem: RemoteFileSystem,
  conn: ConnectionWrapper,
  configFile: string,
  lspConfigs: {[name: string]: LspConfig},
): Promise<IDisposable> {
  const cleanup = new UniversalDisposable();

  for (const [name, configAsMixed] of Object.entries(lspConfigs)) {
    const config: LspConfig = (configAsMixed: any);

    const rootPath =
      config.rootPath != null
        ? config.rootPath
        : pathModule.dirname(configFile);

    const options = {
      name,
      language: config.language,
      outputChannelName: `${name} LSP`,
      command: config.command,
      args: config.args,
      encoding: 'utf8',
    };

    // eslint-disable-next-line no-await-in-loop
    cleanup.add(await createLsp(options, filesystem, rootPath, conn));
    logger.info(`Added an LSP for ${name}.`);
  }

  return cleanup;
}
