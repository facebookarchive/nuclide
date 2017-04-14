/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Observable} from 'rxjs';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileVersion} from '../../nuclide-open-files-rpc/lib/rpc-types';
import typeof * as GraphQLServerService from './GraphQLServerService';

// GraphQL-related helpers
import {findGraphQLConfigDir, logger} from './config';

// RPC Process interface and service registry/marshalers
import {RpcProcess} from '../../nuclide-rpc/lib/RpcProcess';
import {ServiceRegistry, loadServicesConfig} from '../../nuclide-rpc';
import {getServerSideMarshalers} from '../../nuclide-marshalers-common';

// Deals with the file event from Atom process
import {FileCache, FileVersionNotifier} from '../../nuclide-open-files-rpc';
import {getBufferAtVersion} from '../../nuclide-open-files-rpc';

// Nuclide-specific utility functions
import {Cache, DISPOSE_VALUE} from '../../commons-node/cache';
import nuclideUri from '../../commons-node/nuclideUri';
import {forkProcess} from '../../commons-node/process';

const GRAPHQL_FILE_EXTENTIONS: Array<string> = [
  '.graphql',
];

let serviceRegistry: ?ServiceRegistry = null;
function getServiceRegistry(): ServiceRegistry {
  if (serviceRegistry == null) {
    serviceRegistry = new ServiceRegistry(
      getServerSideMarshalers,
      loadServicesConfig(nuclideUri.join(__dirname, '..')),
      'graphql-protocol',
    );
  }
  return serviceRegistry;
}

/**
 * GraphQL language service doesn't really depend on a 'process' per se,
 * but having a process-like configuration store that maps fileCache to
 * schema/.graphqlrc config file sounds useful. Also, this process seems
 * useful for setting up operations like 'getBufferAtVersion' to manage
 * Observable streams for Atom file events.
 * Also realized that if GraphQL runtime is built, many functions in this
 * class will be migrated to the runtime.
 */

class GraphQLProcess {
  _fileCache: FileCache;
  _fileSubscription: rxjs$ISubscription;
  _fileVersionNotifier: FileVersionNotifier;
  _process: RpcProcess;
  _configDir: NuclideUri;

  constructor(
    fileCache: FileCache,
    name: string,
    configDir: NuclideUri,
    processStream: Observable<child_process$ChildProcess>,
  ) {
    this._fileCache = fileCache;
    this._fileVersionNotifier = new FileVersionNotifier();
    this._configDir = configDir;
    this._process = new RpcProcess(
      'GraphQLServer',
      getServiceRegistry(),
      processStream,
    );
    this.getService();

    this._fileSubscription = fileCache.observeFileEvents()
      .filter(fileEvent => {
        const fileExtension = nuclideUri.extname(
          fileEvent.fileVersion.filePath,
        );
        return GRAPHQL_FILE_EXTENTIONS.indexOf(fileExtension) !== -1;
      })
      .subscribe(fileEvent => {
        this._fileVersionNotifier.onEvent(fileEvent);
      });

    this._process.observeExitCode().subscribe(() => this.dispose());
  }

  getService(): Promise<GraphQLServerService> {
    if (this._process.isDisposed()) {
      throw new Error('GraphQLServerService disposed already');
    }
    return this._process.getService('GraphQLServerService');
  }

  async getDiagnostics(query: string, filePath: NuclideUri) {
    return (await this.getService()).getDiagnostics(query, filePath);
  }

  async getDefinition(
    query: string,
    position: atom$Point,
    filePath: NuclideUri,
  ) {
    return (await this.getService()).getDefinition(query, position, filePath);
  }

  async getAutocompleteSuggestions(
    query: string,
    position: atom$Point,
    filePath: NuclideUri,
  ) {
    return (await this.getService()).getAutocompleteSuggestions(
      query,
      position,
      filePath,
    );
  }

  async getBufferAtVersion(
    fileVersion: FileVersion,
  ): Promise<?simpleTextBuffer$TextBuffer> {
    const buffer = await getBufferAtVersion(fileVersion);
    if (!(await this._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
      return null;
    }
    return buffer != null &&
      buffer.changeCount === fileVersion.version ? buffer : null;
  }

  dispose(): void {
    logger.logTrace('Cleaning up GraphQL artifacts');
    this._process.getService('GraphQLServerService').then(service => {
      // Atempt to send disconnect message before shutting down connection
      try {
        logger.logTrace('Attempting to disconnect cleanly from GraphQLProcess');
        service.disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        logger.logError('GraphQL Process died before disconnect() could be sent.');
      }
    });
    this._process.dispose();
    this._fileVersionNotifier.dispose();
    this._fileSubscription.unsubscribe();
    if (processes.has(this._fileCache)) {
      processes.get(this._fileCache).delete(this._configDir);
    }
  }
}

const processes: Cache<FileCache, Cache<NuclideUri, GraphQLProcess>>
  = new Cache(
    fileCache => new Cache(
      graphqlRoot => createGraphQLProcess(fileCache, graphqlRoot),
      process => {
        process.dispose();
      }),
    DISPOSE_VALUE);

export async function getGraphQLProcess(
  fileCache: FileCache,
  filePath: string,
): Promise<?GraphQLProcess> {
  const configDir = await findGraphQLConfigDir(filePath);
  if (configDir == null) {
    return null;
  }

  const processCache = processes.get(fileCache);
  return processCache.get(configDir);
}

function createGraphQLProcess(
  fileCache: FileCache,
  configDir: string,
): GraphQLProcess {
  const processStream = forkProcess(
    require.resolve(
      '../../nuclide-graphql-language-service/bin/graphql.js',
    ),
    ['server', `-c ${configDir}`],
    {silent: true},
  );

  return new GraphQLProcess(
    fileCache,
    `GraphQLProcess-${configDir}`,
    configDir,
    processStream,
  );
}
