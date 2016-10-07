'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {
  LineDiff,
  StatusCodeNumberValue,
} from '../../nuclide-hg-rpc/lib/HgService';
import type {HgRepositoryClient} from './HgRepositoryClient';

import {
  StatusCodeNumber,
  HgStatusOption,
} from '../../nuclide-hg-rpc/lib/hg-constants';

/*
 * Delegate to the passed in HgRepositoryClient.
 */
export default class HgRepositoryClientAsync {

  _client: HgRepositoryClient;

  constructor(client: HgRepositoryClient) {
    this._client = client;
  }

  getType(): string {
    return this._client.getType();
  }

  getWorkingDirectory(): string {
    return this._client.getWorkingDirectory();
  }

  getCachedPathStatus(filePath: ?NuclideUri): Promise<StatusCodeNumberValue> {
    return Promise.resolve(this._client.getCachedPathStatus(filePath));
  }

  // TODO This is a stub.
  getCachedUpstreamAheadBehindCount(
    path: ?NuclideUri,
  ): Promise<{ahead: number, behind: number}> {
    return Promise.resolve(this._client.getCachedUpstreamAheadBehindCount(path));
  }

  getDiffStats(filePath: NuclideUri): Promise<{added: number, deleted: number}> {
    return Promise.resolve(this._client.getDiffStats(filePath));
  }

  /**
   * Recommended method to use to get the line diffs of files in this repo.
   * @param path The absolute file path to get the line diffs for. If the path \
   *   is not in the project, an empty Array will be returned.
   */
  getLineDiffs(filePath: NuclideUri): Promise<Array<LineDiff>> {
    return Promise.resolve(this._client.getLineDiffs(filePath));
  }

  async refreshStatus(): Promise<void> {
    const repoRoot = this._client.getWorkingDirectory();
    const repoProjects = atom.project.getPaths().filter(projPath => projPath.startsWith(repoRoot));
    await this._client.getStatuses(repoProjects, {
      hgStatusOption: HgStatusOption.ONLY_NON_IGNORED,
    });
  }

  getHeadCommitMessage(): Promise<?string> {
    return this._client._service.getHeadCommitMessage();
  }

  /**
   * Return relative paths to status code number values object.
   * matching `GitRepositoryAsync` implementation.
   */
  getCachedPathStatuses(): {[filePath: string]: StatusCodeNumberValue} {
    const absoluteCodePaths = this._client.getAllPathStatuses();
    const relativeCodePaths = {};
    for (const absolutePath in absoluteCodePaths) {
      const relativePath = this._client.relativize(absolutePath);
      relativeCodePaths[relativePath] = absoluteCodePaths[absolutePath];
    }
    return relativeCodePaths;
  }

  isPathIgnored(filePath: ?NuclideUri): Promise<boolean> {
    return Promise.resolve(this._client.isPathIgnored(filePath));
  }

  isStatusIgnored(status: ?number): boolean {
    return status === StatusCodeNumber.IGNORED;
  }

  isStatusModified(status: ?number): boolean {
    return status === StatusCodeNumber.MODIFIED;
  }

  isStatusDeleted(status: ?number): boolean {
    return (
      status === StatusCodeNumber.MISSING ||
      status === StatusCodeNumber.REMOVED
    );
  }

  isStatusNew(status: ?number): boolean {
    return (
      status === StatusCodeNumber.ADDED ||
      status === StatusCodeNumber.UNTRACKED
    );
  }

  isStatusAdded(status: ?number): boolean {
    return status === StatusCodeNumber.ADDED;
  }

  isStatusUntracked(status: ?number): boolean {
    return status === StatusCodeNumber.UNTRACKED;
  }

}
