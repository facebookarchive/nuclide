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

import typeof * as BuckService from '../../nuclide-buck-rpc';
import type {
  ClangCompilationDatabase,
} from '../../nuclide-clang-rpc/lib/rpc-types';

import {getLogger} from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
// import {isHeaderFile} from '../../nuclide-clang-rpc/lib/utils';
import {
  getBuckServiceByNuclideUri,
  getArcanistServiceByNuclideUri,
  getFileSystemServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {Cache} from '../../commons-node/cache';

const logger = getLogger('nuclide-buck');
const BUCK_TIMEOUT = 10 * 60 * 1000;
const TARGET_KIND_REGEX = [
  'apple_binary',
  'apple_library',
  'apple_test',
  'cxx_binary',
  'cxx_library',
  'cxx_test',
].join('|');

const buckCompilationDBTargetCache = new Cache();
const buckCompilationDBSourceCache = new Cache();

/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

export class BuckClangCompilationDatabaseProvider {
  _src: string;
  _buck: BuckService;

  constructor(src: string) {
    this._buck = getBuckServiceByNuclideUri(src);
    this._src = src;
  }

  reset(): void {
    buckCompilationDBSourceCache.delete(this._src);
  }

  async getCompilationDatabase(): Promise<?ClangCompilationDatabase> {
    return buckCompilationDBSourceCache.getOrCreate(this._src, () =>
      this._loadCompilationDatabaseFromBuck().catch(err => {
        logger.error('Error getting flags from Buck', err);
        return null;
      }),
    );
    // TODO(wallace): implement something like this in buck-rpc if needed.
    // This logic seems incorrect anyway.
    // I have already added some header handling logic similar to this in the rpc so let's see if
    // this is needed at all.
    /*
    if (isHeaderFile(this._src)) {
      // Accept flags from any source file in the target.
      if (buckFlags.size > 0) {
        return buckFlags.values().next().value;
      }
    }
    */
  }

  async _loadCompilationDatabaseFromBuck(): Promise<?ClangCompilationDatabase> {
    const buckRoot = await this._buck.getRootForPath(this._src);
    if (buckRoot == null) {
      return null;
    }

    const target = (await this._buck.getOwners(
      buckRoot,
      this._src,
      TARGET_KIND_REGEX,
    )).find(x => x.indexOf(DEFAULT_HEADERS_TARGET) === -1);

    if (target == null) {
      return null;
    }

    return buckCompilationDBTargetCache.getOrCreate(
      buckRoot + ':' + target,
      () => this._loadCompilationDatabaseForBuckTarget(buckRoot, target),
    );
  }

  async _addMode(root: string, mode: string, args: Array<string>) {
    if (
      await getFileSystemServiceByNuclideUri(this._src).exists(
        nuclideUri.join(root, mode),
      )
    ) {
      return args.concat(['@' + mode]);
    }
    return args;
  }

  // Many Android/iOS targets require custom flags to build with Buck.
  // TODO: Share this code with the client-side Buck modifiers!
  async _customizeBuckTarget(
    root: string,
    target: string,
  ): Promise<Array<string>> {
    let args = [target];
    const projectId = await getArcanistServiceByNuclideUri(
      this._src,
    ).findArcProjectIdOfPath(root);
    switch (projectId) {
      case 'fbobjc':
        if (process.platform === 'linux') {
          // TODO: this should probably look up the right flavor somehow.
          args = await this._addMode(root, 'mode/iphonesimulator', args);
        }
        break;
      case 'facebook-fbandroid':
        if (process.platform === 'linux') {
          args = await this._addMode(root, 'mode/server', args);
        }
        break;
    }
    return args;
  }

  async _loadCompilationDatabaseForBuckTarget(
    buckProjectRoot: string,
    target: string,
  ): Promise<ClangCompilationDatabase> {
    // TODO(t12973165): Allow configuring a custom flavor.
    // For now, this seems to use cxx.default_platform, which tends to be correct.
    const buildTarget = target + '#compilation-database';
    const buildReport = await this._buck.build(
      buckProjectRoot,
      [
        // Small builds, like those used for a compilation database, can degrade overall
        // `buck build` performance by unnecessarily invalidating the Action Graph cache.
        // See https://buckbuild.com/concept/buckconfig.html#client.skip-action-graph-cache
        // for details on the importance of using skip-action-graph-cache=true.
        '--config',
        'client.skip-action-graph-cache=true',

        ...(await this._customizeBuckTarget(buckProjectRoot, buildTarget)),
        // TODO(hansonw): Any alternative to doing this?
        // '-L',
        // String(os.cpus().length / 2),
      ],
      {commandOptions: {timeout: BUCK_TIMEOUT}},
    );
    if (!buildReport.success) {
      const error = `Failed to build ${buildTarget}`;
      logger.error(error);
      throw error;
    }
    const firstResult = Object.keys(buildReport.results)[0];
    let pathToCompilationDatabase = buildReport.results[firstResult].output;
    pathToCompilationDatabase = nuclideUri.join(
      buckProjectRoot,
      pathToCompilationDatabase,
    );

    const buildFile = await this._buck.getBuildFile(buckProjectRoot, target);
    return {file: pathToCompilationDatabase, flagsFile: buildFile};
  }
}
