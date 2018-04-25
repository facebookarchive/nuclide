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
  AtomFileEvent,
  MultiConnectionAtomCommands,
  ProjectState,
} from './rpc-types';
import type {CommandServer} from './CommandServer';
import type {ConnectableObservable} from 'rxjs';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {Observable} from 'rxjs';

/**
 * Implementation of MultiConnectionAtomCommands that routes requests
 * to the appropriate connection from the underlying CommandServer.
 */
export class RoutingAtomCommands implements MultiConnectionAtomCommands {
  _server: CommandServer;

  constructor(server: CommandServer) {
    this._server = server;
  }

  getConnectionCount(): Promise<number> {
    return Promise.resolve(this._server.getConnectionCount());
  }

  openFile(
    filePath: NuclideUri,
    line: number,
    column: number,
    isWaiting: boolean,
  ): ConnectableObservable<AtomFileEvent> {
    const commands = this._server.getAtomCommandsByPath(filePath);
    if (commands != null) {
      return commands.openFile(filePath, line, column, isWaiting);
    } else {
      return Observable.throw(Error('No connected Atom windows')).publish();
    }
  }

  openRemoteFile(
    uri: string,
    line: number,
    column: number,
    isWaiting: boolean,
  ): ConnectableObservable<AtomFileEvent> {
    const commands = this._server.getAtomCommandsByPath(uri);
    if (commands != null) {
      return commands.openRemoteFile(uri, line, column, isWaiting);
    } else {
      return Observable.throw(Error('No connected Atom windows')).publish();
    }
  }

  addProject(projectPath: NuclideUri, newWindow: boolean): Promise<void> {
    const commands = this._server.getAtomCommandsByPath(projectPath);
    if (commands != null) {
      return commands.addProject(projectPath, newWindow);
    } else {
      throw new Error('No connected Atom windows');
    }
  }

  async getProjectStates(): Promise<Array<ProjectState>> {
    return this._server.getProjectStates();
  }

  dispose() {}
}
