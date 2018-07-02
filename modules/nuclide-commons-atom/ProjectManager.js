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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

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

  /**
   * Open a project. While this can handle both local and remote URIs, there must already be a
   * connection to the host of the remote project file or it will error.
   */
  async open(uri: NuclideUri): Promise<mixed> {
    let fsApi;
    let expandedUri: ?NuclideUri;
    let realPath: ?NuclideUri;

    if (nuclideUri.isRemote(uri)) {
      fsApi = await getFsServiceFor(uri);
      if (fsApi == null) {
        throw new Error('Tried to load a remote project without a connection.');
      }
      realPath = await fsApi.resolveRealPath(nuclideUri.getPath(uri));
      expandedUri = nuclideUri.resolve(uri, realPath);
    } else {
      fsApi = fsPromise;
      expandedUri = nuclideUri.expandHomeDir(uri);
      realPath = expandedUri;
    }

    let rawContents;
    try {
      rawContents = parseProject((await fsApi.readFile(realPath)).toString());
    } catch (e) {
      throw new Error(
        `Unable to find or parse atomproject at ${expandedUri}, make sure that the root repo` +
          ' (ie: fbsource, www) is in the correct location.',
      );
    }

    const spec = _validateProjectSpec({
      ...rawContents,
      originPath: expandedUri,
    });

    // Even though the project may list a bunch of directories, we actually mount the repository
    // root and then filter. This is a change from the normal Atom handling so we need to
    // account for that.
    const repoRoots = await getRepoRoots(spec.paths, fsApi);

    if (repoRoots.length !== 0) {
      // As far as Atom is concerned, the repo root will be the path. However, we put the
      // original paths on the project spec as `_paths` so we can use them to filter the file
      // tree.
      spec._paths = spec.paths;
      spec.paths = repoRoots;
    }

    // $FlowFixMe: Add typedef
    atom.project.replace({...spec});
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

export function _validateProjectSpec(
  raw: atom$ProjectSpecification,
): {
  originPath: NuclideUri,
  paths: Array<NuclideUri>,
  _paths?: ?Array<NuclideUri>,
} {
  const spec = {...raw};
  const baseDir = nuclideUri.dirname(nuclideUri.getPath(spec.originPath));
  const originalPaths = raw.paths;
  spec.paths =
    originalPaths != null && Array.isArray(originalPaths)
      ? originalPaths.map(p => nuclideUri.resolve(baseDir, p))
      : [baseDir];
  return spec;
}

async function getRepoRoots(
  paths: Array<NuclideUri>,
  fsApi,
): Promise<Array<NuclideUri>> {
  const repoRootUris = await Promise.all(
    paths.map(async path => {
      const hgRoot = await fsApi.findNearestAncestorNamed('.hg', path);
      return hgRoot == null
        ? fsApi.findNearestAncestorNamed('.git', path)
        : hgRoot;
    }),
  );
  const repoRoots = repoRootUris
    .filter(Boolean)
    .map(uri => nuclideUri.getPath(nuclideUri.dirname(uri)));
  return Array.from(new Set(repoRoots));
}

async function getFsServiceFor(uri: NuclideUri) {
  const rpcService: nuclide$RpcService = await new Promise(resolve => {
    atom.packages.serviceHub.consume('nuclide-rpc-services', '0.0.0', resolve);
  });
  return rpcService.getServiceByNuclideUri('FileSystemService', uri);
}
