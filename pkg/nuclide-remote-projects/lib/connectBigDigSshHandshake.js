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
import {shellParse} from 'nuclide-commons/string';
import {getNuclideVersion} from '../../commons-node/system-info';
import {
  SshHandshake as NuclideSshHandshake,
  RemoteConnection,
} from '../../nuclide-remote-connection';

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
            throw Error('Unexpected prompt kind');
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
        cwd: connectionConfig.cwd,
        displayTitle: connectionConfig.displayTitle,
        // TODO(T25637185): Get family from SshHandshake
        version: 2,
      }).then(
        connection => {
          delegate.onDidConnect(connection, connectionConfig);
        },
        err => {
          delegate.onError(
            NuclideSshHandshake.ErrorType.SERVER_CANNOT_CONNECT,
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
  // TODO(T25636858): Have the server auto-detect FB-friendly ports
  let remoteServerPort = 9091;
  let {remoteServerCommand} = connectionConfig;
  // big-dig doesn't parse extra arguments.
  // We'll try to adapt commonly used ones for now.
  if (remoteServerCommand.includes(' ')) {
    const argv = shellParse(remoteServerCommand);
    remoteServerCommand = argv[0];
    for (let i = 1; i < argv.length - 1; i++) {
      if (argv[i] === '--port' || argv[i] === '-p') {
        remoteServerPort = parseInt(argv[i + 1], 10);
      }
      // TODO(T25636823): Also support debug flags
    }
  }
  // Add an extra flag to indicate the use of big-dig.
  remoteServerCommand += ' --big-dig';
  // And the current Nuclide version.
  remoteServerCommand += ` --version=${getNuclideVersion()}`;
  sshHandshake.connect({
    host,
    sshPort,
    username,
    pathToPrivateKey,
    remoteServer: {
      command: remoteServerCommand,
    },
    remoteServerPort,
    authMethod,
    password,
  });
  return sshHandshake;
}
