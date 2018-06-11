/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import nuclideUri from 'nuclide-commons/nuclideUri';
import featureConfig from './feature-config';
import invariant from 'assert';

export function getLabelFromPath(path: string): string {
  const basename = nuclideUri.basename(path);
  const parts = basename.split('.');
  return humanizeProjectName(parts[0] || basename);
}

function formatProjectNameWord(word: string): string {
  switch (word) {
    case 'www':
      return 'WWW';
    case 'ios':
      return 'iOS';
    default:
      return word[0].toUpperCase() + word.slice(1);
  }
}

function humanizeProjectName(name: string): string {
  const hasCapitalLetters = /[A-Z]/.test(name);
  const id = x => x;
  return name
    .split(/[-_]+/)
    .map(hasCapitalLetters ? id : formatProjectNameWord)
    .join(' ');
}

/**
 * Gets the array of paths which can be tried on the local machine to find
 * the location of `repo`. For example, if repo := fbsource, then we are getting
 * the paths to fbsource on the user's local machine.
 */
export function getLocalPathsForProjectRepo(repo: string): Array<string> {
  return getPathsForProjectRepoFromLocation(repo, 'localPaths');
}

/**
 * Gets the array of paths which can be tried on a remote machine to find
 * the location of `repo`. For example, if repo := fbsource, then we are getting
 * the paths to fbsource on the user's remote machine.
 */
export function getRemotePathsForProjectRepo(repo: string): Array<string> {
  return getPathsForProjectRepoFromLocation(repo, 'remotePaths');
}

function getPathsForProjectRepoFromLocation(
  repo: string,
  featureConfigLocation: string,
): Array<string> {
  if (repo == null) {
    return [];
  }
  const localPaths = featureConfig.get(
    `fb-atomprojects.${featureConfigLocation}`,
  );

  invariant(Array.isArray(localPaths));
  const repoPaths = localPaths
    // $FlowIgnore
    .filter(obj => obj.repo === repo)
    // $FlowIgnore
    .map(obj => obj.path);

  if (repoPaths.length === 0) {
    repoPaths.push(`~/${repo}`);
  }
  return repoPaths;
}

/**
 * Sets an array of paths which can be tried on the local machine to find
 * the location of <repo>. For example, if repo := fbsource, then we are setting
 * the paths to fbsource on the user's local machine.
 */
export function setLocalPathsForProjectRepo(
  paths: Array<{
    path: NuclideUri,
    repo: string,
  }>,
): void {
  featureConfig.set('fb-atomprojects.localPaths', paths);
}

/**
 * Sets an array of paths which can be tried on a remote machine to find
 * the location of <repo>. For example, if repo := fbsource, then we are setting
 * the paths to fbsource on the user's remote machine.
 */
export function setRemotePathsForProjectRepo(
  paths: Array<{
    path: NuclideUri,
    repo: string,
  }>,
): void {
  featureConfig.set('fb-atomprojects.remotePaths', paths);
}
