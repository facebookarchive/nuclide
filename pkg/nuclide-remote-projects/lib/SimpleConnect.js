"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connectToServer = connectToServer;

function _client() {
  const data = require("../../../modules/big-dig/src/client");

  _client = function () {
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

function _systemInfo() {
  const data = require("../../../modules/nuclide-commons/system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

function _ServerConnection() {
  const data = require("../../nuclide-remote-connection/lib/ServerConnection");

  _ServerConnection = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
let remoteServerCommand = 'nuclide-fetch-and-start-server'; // default for open-source

try {
  // $FlowFB
  const defaults = require("./fb/config").getConnectionDialogDefaultSettings();

  remoteServerCommand = defaults.remoteServerCommand;
} catch (e) {}

const logger = (0, _log4js().getLogger)('simple-connection');
/**
 * @param host the remote host
 * @param port the ssh port on the remote host
 * @param user the ssh username
 * @param password the password for the user
 * @param onPrompt once the user is prompted, the next callback should be
 *        with the response.
 * @param onConnect called when the connection is ready with the
 *        ServerConnection
 * @param onError called on an error with an Error object
 */

function connectToServer(config) {
  const simpleDelegate = {
    onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
      logger.info('onKeyboardInteractive called');
      const prompt = prompts[0];
      return new Promise(resolve => {
        config.onPrompt(prompt, response => resolve([response]));
      });
    },

    onWillConnect() {
      logger.info('onWillConnect called');
    },

    onDidConnect(remoteConfig) {
      logger.info('onDidConnect called');

      _ServerConnection().ServerConnection.getOrCreate(Object.assign({
        version: 2
      }, remoteConfig)).then(serverConnection => {
        config.onConnect(serverConnection);
      }).catch(error => {
        logger.error(error);
        config.onError(error);
      });
    },

    onError(errorType, error) {
      logger.error(error);
      config.onError(error);
    }

  };
  const sshHandshake = new (_client().SshHandshake)(simpleDelegate);
  const version = (0, _systemInfo().getNuclideVersion)();
  remoteServerCommand = config.remoteServerCommand != null ? config.remoteServerCommand : remoteServerCommand;
  remoteServerCommand += ` --big-dig --version=${version}`;
  const remoteServerPorts = '9093-9090';
  sshHandshake.connect({
    host: config.host,
    sshPort: config.port,
    username: config.user,
    password: config.password,
    pathToPrivateKey: '',
    remoteServer: {
      command: remoteServerCommand
    },
    remoteServerPorts,
    authMethod: 'PASSWORD',
    displayTitle: ''
  });
}