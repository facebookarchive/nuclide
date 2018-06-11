/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import AsyncStorage from 'idb-keyval';
import LRUCache from 'lru-cache';
import {BehaviorSubject, Observable, Subject} from 'rxjs';

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects';

type ProjectFile = {|
  repo: string,
  path: string,
|};

type ProjectSession = {|
  projectFile: ProjectFile,
  host: string,
|};

export type ProjectSessions = {|
  projectFile: ProjectFile,
  hosts: Array<string>,
  lastAccessed: number,
|};

class ProjectManager {
  _projects: BehaviorSubject<?ProjectSession> = new BehaviorSubject();
  _recentProjects: Subject<Array<ProjectSessions>> = new Subject();

  getProjects(): Observable<Array<ProjectSessions>> {
    return Observable.concat(
      Observable.defer(() => this.getRecentProjects()),
      this._recentProjects.asObservable(),
    );
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
    this._recentProjects.next(projectsToList(recentProjects));
  }

  async getRecentProjects(): Promise<Array<ProjectSessions>> {
    const recents = projectsToList(await loadRecentProjects());
    return recents;
  }
}

export default new ProjectManager();

function projectsToList(
  projects: LRUCache<string, ProjectSessions>,
): Array<ProjectSessions> {
  return projects
    .dump()
    .map(pair => pair.v)
    .sort((a, b) => b.lastAccessed - a.lastAccessed);
}

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
