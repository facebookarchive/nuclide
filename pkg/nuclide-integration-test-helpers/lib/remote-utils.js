'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import {RemoteConnection} from '../../nuclide-remote-connection';
import {getServiceByNuclideUri} from '../../nuclide-client';
import child_process from 'child_process';

const DEFAULT_PORT = 9090;

/**
 * Starts a local version of the nuclide server in insecure mode on the specified port.
 * The server is started in a separate process than the caller's.
 */
export function startNuclideServer(): void {
  child_process.spawnSync(
    require.resolve('../../nuclide-server/nuclide-start-server'),
    ['-k', `--port=${DEFAULT_PORT}`],
  );
}

/**
 * Add a remote project to nuclide.  This function bypasses the SSH authentication that the
 * server normally uses.  `projectPath` is a path to a local directory.  This function assumes
 * that the nuclide server has been started in insecure mode, e.g. with using the
 * integration-test-helpers.startNuclideServer function.
 */
export async function addRemoteProject(projectPath: string): Promise<?RemoteConnection> {
  return await RemoteConnection._createInsecureConnectionForTesting(projectPath, DEFAULT_PORT);
}

/**
 * Kills the nuclide server associated with `connection`, and closes the connection.
 */
export async function stopNuclideServer(connection: RemoteConnection): Promise<void> {
  const service =
    getServiceByNuclideUri('FlowService', connection.getUriForInitialWorkingDirectory());
  invariant(service);
  service.dispose();
  // If this ever fires, either ensure that your test closes all RemoteConnections
  // or we can add a force shutdown method to ServerConnection.
  invariant(connection.isOnlyConnection());
  const attemptShutdown = true;
  connection.close(attemptShutdown);
}
