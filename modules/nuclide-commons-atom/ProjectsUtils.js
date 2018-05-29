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

import AsyncStorage from 'idb-keyval';
import LRUCache from 'lru-cache';

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects';

type ProjectFile = {|
  repo: string,
  path: string,
|};

export async function addRecentProject(
  projectFile: ProjectFile,
  hostname: string,
): Promise<void> {
  const recentProjects = await loadRecentProjects();
  const key = projectFileToKey(projectFile);
  const recentHosts = recentProjects.get(key) || [];
  if (!recentHosts.includes(hostname)) {
    recentHosts.push(hostname);
  }
  recentProjects.set(key, recentHosts);
  await saveRecentProjects(recentProjects);
}

function projectFileToKey(projectFile: ProjectFile): string {
  return [projectFile.repo, projectFile.path].join('#');
}

async function loadRecentProjects(): Promise<LRUCache<string, Array<string>>> {
  const recentProjectsEntries = await AsyncStorage.get(RECENT_PROJECTS_KEY);
  const recentProjects = new LRUCache({max: 100});
  if (recentProjectsEntries) {
    // $FlowFixMe
    recentProjects.load(recentProjectsEntries);
  }

  return recentProjects;
}

async function saveRecentProjects(
  recentProjects: LRUCache<string, Array<string>>,
): Promise<void> {
  await AsyncStorage.set(RECENT_PROJECTS_KEY, recentProjects.dump());
}
