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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ConnectableObservable} from 'rxjs';

export type ClientConnection = {
  rootFolders: Array<NuclideUri>,
};

export type AtomFileEvent = 'open' | 'close';
export interface AtomCommands {
  openFile(
    // Path local to the machine that made the call to openFile().
    filePath: NuclideUri,
    line: number,
    column: number,
    isWaiting: boolean,
  ): ConnectableObservable<AtomFileEvent>;
  openRemoteFile(
    // This is a remote NuclideUri. It is typed as a string so that it does not
    // get converted as part of Nuclide-RPC.
    uri: string,
    line: number,
    column: number,
    isWaiting: boolean,
  ): ConnectableObservable<AtomFileEvent>;

  /**
   * The returned Promise may resolve before the project is added to Atom if
   * newWindow is true.
   */
  addProject(projectPath: NuclideUri, newWindow: boolean): Promise<void>;

  /**
   * Returns information about the Atom windows that have a Nuclide server
   * connection to the specified hostname.
   */
  getClientConnections(hostname: string): Promise<Array<ClientConnection>>;

  dispose(): void;
}

export type ConnectionDetails = {
  port: number,
  family: string,
};
