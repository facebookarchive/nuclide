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
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {without} from 'lodash';
import toml from 'toml';
import season from 'season';
import fsPromise from 'nuclide-commons/fsPromise';

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects';

type ProjectFile = {|
  repo: string,
  path: string,
  originPath?: string,
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

  observeActiveProjectSpec(
    cb: (spec: ?atom$ProjectSpecification) => mixed,
  ): IDisposable {
    // TODO: Remove after `atom.project.getSpecification()` is upstreamed.
    if (
      typeof atom.project.onDidReplace !== 'function' ||
      // $FlowFixMe: Add this to the typedef after we've upstreamed.
      typeof atom.project.getSpecification !== 'function'
    ) {
      cb(null);
      return new UniversalDisposable();
    }

    return new UniversalDisposable(
      observableFromSubscribeFunction(callback =>
        atom.project.onDidReplace(callback),
      )
        // $FlowFixMe: Add this to the typedef after we've upstreamed.
        .startWith(atom.project.getSpecification())
        .subscribe(cb),
    );
  }

  async loadProjectFile(pathToProjectFile: string): Promise<boolean> {
    const expandedPath = nuclideUri.expandHomeDir(pathToProjectFile);
    let contents;
    try {
      contents = parseProject(await fsPromise.readFile(expandedPath, 'utf8'));
    } catch (e) {
      atom.notifications
        .addError(`Unable to find or parse atomproject at ${expandedPath}, make sure that
        the root repo (ie: fbsource, www) is in the correct location.`);
      return false;
    }
    contents.originPath = expandedPath;
    if (contents.paths != null) {
      contents.paths = contents.paths.map(contentPath =>
        nuclideUri.join(nuclideUri.dirname(expandedPath), contentPath),
      );
    }

    if (atom.project.replace != null) {
      atom.project.replace(contents);
      return true;
    }
    return false;
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
    project.hosts = without(project.hosts, host);
    project.hosts.unshift(host);
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

function parseProject(raw: string): any {
  try {
    return toml.parse(raw);
  } catch (err) {
    if (err.name === 'SyntaxError') {
      return season.parse(raw);
    }
    throw err;
  }
}
