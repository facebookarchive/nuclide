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
  ClangCompilationDatabase,
} from '../../nuclide-clang-rpc/lib/rpc-types';
import {findArcProjectIdOfPath} from '../../nuclide-arcanist-rpc';

import * as BuckService from './BuckServiceImpl';
import fsPromise from 'nuclide-commons/fsPromise';
import {getLogger} from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Cache} from '../../commons-node/cache';
import {guessBuildFile} from '../../nuclide-clang-rpc/lib/utils';

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

const targetCache = new Cache();
const sourceCache = new Cache();

// Ensure that we can clear targetCache for a given file.
const sourceToTargetKey = new Map();

/**
 * Facebook puts all headers in a <target>:__default_headers__ build target by default.
 * This target will never produce compilation flags, so make sure to ignore it.
 */
const DEFAULT_HEADERS_TARGET = '__default_headers__';

export function resetForSource(src: string): void {
  sourceCache.delete(src);
  const targetKey = sourceToTargetKey.get(src);
  if (targetKey != null) {
    targetCache.delete(targetKey);
    sourceToTargetKey.delete(src);
  }
}

export function reset(): void {
  sourceCache.clear();
  targetCache.clear();
  sourceToTargetKey.clear();
}

export async function getCompilationDatabase(
  src: string,
): Promise<?ClangCompilationDatabase> {
  return sourceCache.getOrCreate(src, () =>
    loadCompilationDatabaseFromBuck(src).catch(err => {
      logger.error('Error getting flags from Buck', err);
      return null;
    }),
  );
}

async function loadCompilationDatabaseFromBuck(
  src: string,
): Promise<?ClangCompilationDatabase> {
  const buckRoot = await BuckService.getRootForPath(src);
  if (buckRoot == null) {
    return null;
  }

  let queryTarget = null;
  try {
    queryTarget = (await BuckService.getOwners(
      buckRoot,
      src,
      TARGET_KIND_REGEX,
    )).find(x => x.indexOf(DEFAULT_HEADERS_TARGET) === -1);
  } catch (err) {
    logger.error('Failed getting the target from buck', err);
  }

  if (queryTarget == null) {
    // Even if we can't get flags, return a flagsFile to watch
    const buildFile = await guessBuildFile(src);
    if (buildFile != null) {
      return {flagsFile: buildFile, file: null};
    }
    return null;
  }
  const target = queryTarget;

  const targetKey = buckRoot + ':' + target;
  sourceToTargetKey.set(src, targetKey);

  return targetCache.getOrCreate(targetKey, () =>
    loadCompilationDatabaseForBuckTarget(buckRoot, target),
  );
}

async function addMode(
  root: string,
  mode: string,
  args: Array<string>,
): Promise<Array<string>> {
  if (await fsPromise.exists(nuclideUri.join(root, mode))) {
    return args.concat(['@' + mode]);
  }
  return args;
}

// Many Android/iOS targets require custom flags to build with Buck.
// TODO: Share this code with the client-side Buck modifiers!
async function customizeBuckTarget(
  root: string,
  target: string,
): Promise<Array<string>> {
  let args = [target];
  const projectId = await findArcProjectIdOfPath(root);
  switch (projectId) {
    case 'fbobjc':
      if (process.platform === 'linux') {
        // TODO: this should probably look up the right flavor somehow.
        args = await addMode(root, 'mode/iphonesimulator', args);
      }
      break;
    case 'facebook-fbandroid':
      if (process.platform === 'linux') {
        args = await addMode(root, 'mode/server', args);
      }
      break;
  }
  return args;
}

async function loadCompilationDatabaseForBuckTarget(
  buckProjectRoot: string,
  target: string,
): Promise<ClangCompilationDatabase> {
  // TODO(t12973165): Allow configuring a custom flavor.
  // For now, this seems to use cxx.default_platform, which tends to be correct.
  const buildTarget = target + '#compilation-database';
  const buildReport = await BuckService.build(
    buckProjectRoot,
    [
      // Small builds, like those used for a compilation database, can degrade overall
      // `buck build` performance by unnecessarily invalidating the Action Graph cache.
      // See https://buckbuild.com/concept/buckconfig.html#client.skip-action-graph-cache
      // for details on the importance of using skip-action-graph-cache=true.
      '--config',
      'client.skip-action-graph-cache=true',

      ...(await customizeBuckTarget(buckProjectRoot, buildTarget)),
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

  const buildFile = await BuckService.getBuildFile(buckProjectRoot, target);
  return {file: pathToCompilationDatabase, flagsFile: buildFile};
}
