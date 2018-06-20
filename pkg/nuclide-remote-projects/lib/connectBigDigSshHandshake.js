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

import type {
  SshHandshakeErrorType,
  SshConnectionConfiguration,
  RemoteConnectionConfiguration,
} from 'big-dig/src/client/SshHandshake';
import type {
  SshConnectionConfiguration as NuclideSshConnectionConfigurationType,
  SshConnectionDelegate as NuclideSshConnectionDelegateType,
} from '../../nuclide-remote-connection/lib/SshHandshake';

import {SshHandshake} from 'big-dig/src/client/index';
import yargs from 'yargs';
import fs from 'fs-plus';
import {getNuclideVersion} from '../../commons-node/system-info';
import {
  SshHandshake as NuclideSshHandshake,
  RemoteConnection,
} from '../../nuclide-remote-connection';
import {BIG_DIG_VERSION} from '../../nuclide-remote-connection/lib/ServerConnection';

/**
 * Adapts big-dig's SshHandshake to what Nuclide expects.
 * After the migration is complete, we should be able to refactor this away.
 */
export default function connectBigDigSshHandshake(
  connectionConfig: NuclideSshConnectionConfigurationType,
  delegate: NuclideSshConnectionDelegateType,
): SshHandshake {
  const sshHandshake = new SshHandshake({
    onKeyboardInteractive(name, instructions, instructionsLang, prompts) {
      const prompt = prompts[0];
      return new Promise(resolve => {
        switch (prompt.kind) {
          case 'ssh':
          case 'private-key':
            delegate.onKeyboardInteractive(
              name,
              instructions,
              instructionsLang,
              [{prompt: prompt.prompt, echo: prompt.echo}],
              resolve,
            );
            break;
          default:
            // No need to handle update/install for unmanaged startups.
            throw new Error('Unexpected prompt kind');
        }
      });
    },
    onWillConnect(config: SshConnectionConfiguration) {
      delegate.onWillConnect(connectionConfig);
    },
    onDidConnect(
      remoteConfig: RemoteConnectionConfiguration,
      config: SshConnectionConfiguration,
    ) {
      RemoteConnection.findOrCreate({
        ...remoteConfig,
        path: connectionConfig.cwd,
        displayTitle: connectionConfig.displayTitle,
        version: BIG_DIG_VERSION,
      }).then(
        connection => {
          delegate.onDidConnect(connection, connectionConfig);
        },
        err => {
          delegate.onError(
            err.code === 'CERT_NOT_YET_VALID'
              ? NuclideSshHandshake.ErrorType.CERT_NOT_YET_VALID
              : NuclideSshHandshake.ErrorType.SERVER_CANNOT_CONNECT,
            err,
            connectionConfig,
          );
        },
      );
    },
    onError(
      errorType: SshHandshakeErrorType,
      error: Error,
      config: SshConnectionConfiguration,
    ) {
      const nuclideErrorType =
        NuclideSshHandshake.ErrorType[(errorType: any)] ||
        NuclideSshHandshake.ErrorType.UNKNOWN;
      delegate.onError(nuclideErrorType, error, connectionConfig);
    },
  });
  const {
    host,
    sshPort,
    username,
    pathToPrivateKey,
    authMethod,
    password,
  } = connectionConfig;
  let {remoteServerCommand} = connectionConfig;
  // If the user does not specify --port or -p in the remoteServerCommand, then
  // we default to '9093-9090' as the port range. Currently, we do not give the
  // user a way to specify their own port range from the connection dialog.
  // We can straighten this out once we completely cutover to Big Dig.
  let remoteServerPorts = '9093-9090';
  // Add the current Nuclide version, unless explicitly provided.
  let version = getNuclideVersion();
  // We'll only allow one Nuclide server per user - but you can override this.
  let exclusive = 'atom';
  // big-dig doesn't parse extra arguments.
  // We'll try to adapt commonly used ones for now.
  if (remoteServerCommand.includes(' ')) {
    const parsed = yargs.parse(remoteServerCommand);
    remoteServerCommand = parsed._.join(' ');
    if (parsed.version != null) {
      version = parsed.version;
    }
    if (typeof parsed.port === 'number') {
      remoteServerPorts = String(parsed.port);
    }
    if (typeof parsed.p === 'number') {
      remoteServerPorts = String(parsed.p);
    }
    if (typeof parsed.exclusive === 'string') {
      exclusive = parsed.exclusive;
    }
  }

  // We use fs-plus's normalize() function because it will expand the ~, if present.
  const expandedPath = fs.normalize(pathToPrivateKey);

  // Add an extra flag to indicate the use of big-dig.
  remoteServerCommand += ' --big-dig';
  remoteServerCommand += ` --version=${version}`;
  sshHandshake.connect({
    host,
    sshPort,
    username,
    pathToPrivateKey: expandedPath,
    remoteServer: {
      command: remoteServerCommand,
    },
    remoteServerPorts,
    authMethod,
    password,
    exclusive,
  });
  return sshHandshake;
}
