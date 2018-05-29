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
import {BehaviorSubject} from 'rxjs';

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects';

type ProjectFile = {|
  repo: string,
  path: string,
|};

type ProjectSession = {|
  projectFile: ProjectFile,
  host: string,
|};

type ProjectSessions = {|
  projectFile: ProjectFile,
  hosts: Array<string>,
  lastAccessed: number,
|};

class ProjectManager {
  _projects: BehaviorSubject<?ProjectSession> = new BehaviorSubject();

  getProjects() {
    return this._projects.asObservable();
  }

  getActiveProject(): ?ProjectSession {
    return this._projects.getValue();
  }

  async addRecentProject(
    projectFile: ProjectFile,
    host: string,
  ): Promise<void> {
    const recentProjects = await loadRecentProjects();
    const key = projectFileToKey(projectFile);
    const project = recentProjects.get(key) || {
      lastAccessed: 0,
      projectFile,
      hosts: [],
    };
    if (!project.hosts.includes(host)) {
      project.hosts.push(host);
    }
    project.lastAccessed = Date.now();
    recentProjects.set(key, project);
    await saveRecentProjects(recentProjects);
    this._projects.next({projectFile, host});
  }

  async getRecentProjects(): Promise<Array<ProjectSessions>> {
    const recentProjects = await loadRecentProjects();
    return recentProjects
      .dump()
      .map(pair => pair.v)
      .sort((a, b) => b.lastAccessed - a.lastAccessed);
  }
}

export default new ProjectManager();

function projectFileToKey(projectFile: ProjectFile): string {
  return [projectFile.repo, projectFile.path].join('#');
}

async function loadRecentProjects(): Promise<
  LRUCache<string, ProjectSessions>,
> {
  const recentProjectsEntries = await AsyncStorage.get(RECENT_PROJECTS_KEY);
  const recentProjects = new LRUCache({max: 100});
  if (recentProjectsEntries) {
    // $FlowFixMe
    recentProjects.load(recentProjectsEntries);
  }

  return recentProjects;
}

async function saveRecentProjects(
  recentProjects: LRUCache<string, ProjectSessions>,
): Promise<void> {
  await AsyncStorage.set(RECENT_PROJECTS_KEY, recentProjects.dump());
}
