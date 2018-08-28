"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigDebugConfigurationProvider = void 0;

function vscode() {
  const data = _interopRequireWildcard(require("vscode"));

  vscode = function () {
    return data;
  };

  return data;
}

function _BigDigDebugServer() {
  const data = require("./BigDigDebugServer");

  _BigDigDebugServer = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _remote() {
  const data = require("../remote");

  _remote = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('big-dig-debug-provider');

class BigDigDebugConfigurationProvider {
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


  async provideDebugConfigurations(folder, token) {
    logger.info(`provideDebugConfigurations(${String(folder)}, ${String(token)})`);
    const configurations = await fetchDebuggerConfigurations();
    logger.info(`returning configurations: ${JSON.stringify(configurations, null, 2)}`);
    return configurations;
  }

  async resolveDebugConfiguration(folder, config, token) {
    logger.info(`resolveDebugConfiguration(${JSON.stringify(config)})`);
    let debugServer; // Apparently this field may be unset if launch.json is missing or
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

  async _findOrCreateDebugServerForConfig(config) {
    throw new Error('_findOrCreateDebugServerForConfig() not implemented because ' + "VS Code isn't giving us non-empty configs yet, anyway.");
  }

  dispose() {
    this._debugServers.forEach(server => server.dispose());

    this._debugServers.length = 0;
  }

}
/**
 * Fetches all debugger configurations for all remote root folders.
 */


exports.BigDigDebugConfigurationProvider = BigDigDebugConfigurationProvider;

async function fetchDebuggerConfigurations() {
  const {
    workspaceFolders
  } = vscode().workspace;

  if (workspaceFolders == null) {
    return [];
  }

  const authorityToFolders = new Map();

  for (const folder of workspaceFolders) {
    const {
      uri
    } = folder;

    if (uri.scheme !== 'big-dig') {
      continue;
    }

    const {
      authority
    } = uri;
    let folders = authorityToFolders.get(authority);

    if (folders == null) {
      folders = [];
      authorityToFolders.set(authority, folders);
    }

    folders.push(uri);
  }

  const listOfConfigurationLists = await Promise.all((0, _remote().getServers)().map(async server => {
    const folders = authorityToFolders.get(server.getAddress());

    if (folders == null) {
      return [];
    }

    const configurationsForFoldersOnServer = await Promise.all(folders.map(uri => fetchDebuggerConfigurationsForDirectory(uri.path, server)));
    return (0, _collection().arrayFlatten)(configurationsForFoldersOnServer);
  }));
  return (0, _collection().arrayFlatten)(listOfConfigurationLists);
}
/**
 * Fetches the debugger configurations for a specific directory on a remote
 * machine.
 */


async function fetchDebuggerConfigurationsForDirectory(directory, server) {
  const connection = await server.connect();
  const debuggerList = await connection.debuggerList(directory);
  return Object.entries(debuggerList.debuggerConfigs).map(entry => {
    const [name, _config] = entry;
    const config = _config; // $FlowIssue: I have no idea what Flow is complaining about.

    const debugConfiguration = {
      type: 'big-dig',
      name: `${name} Remote Debugger (${server.getAddress()})`,
      hostname: server.getAddress(),
      request: config.request,
      // Properties that are not part of the vscode.DebugConfiguration
      // interface.
      bigdig: config
    };
    return {
      server,
      config: debugConfiguration
    };
  });
}
/**
 * This is called when the vscode.DebugConfiguration that was requested is
 * empty. Because we have no information to go on, we just use the first config
 * that we find to create the BigDigDebugServer.
 */


async function createSomeBigDigDebugServer() {
  const configurations = await fetchDebuggerConfigurations();

  if (configurations.length === 0) {
    return null;
  } else {
    const {
      server,
      config
    } = configurations[0];
    const connectionWrapper = await server.connect();
    return new (_BigDigDebugServer().BigDigDebugServer)(connectionWrapper, config);
  }
}