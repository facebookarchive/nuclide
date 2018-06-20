'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _without2;

function _load_without() {
  return _without2 = _interopRequireDefault(require('lodash/without'));
}

exports._validateProjectSpec = _validateProjectSpec;

var _idbKeyval;

function _load_idbKeyval() {
  return _idbKeyval = _interopRequireDefault(require('idb-keyval'));
}

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _event;

function _load_event() {
  return _event = require('../nuclide-commons/event');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

var _toml;

function _load_toml() {
  return _toml = _interopRequireDefault(require('toml'));
}

var _season;

function _load_season() {
  return _season = _interopRequireDefault(require('season'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../nuclide-commons/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects'; /**
                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the BSD-style license found in the
                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                        *
                                                        * 
                                                        * @format
                                                        */

class ProjectManager {
  constructor() {
    this._projects = new _rxjsBundlesRxMinJs.BehaviorSubject();
    this._recentProjects = new _rxjsBundlesRxMinJs.Subject();
  }

  getProjects() {
    return _rxjsBundlesRxMinJs.Observable.concat(_rxjsBundlesRxMinJs.Observable.defer(() => this.getRecentProjects()), this._recentProjects.asObservable());
  }

  getActiveProject() {
    return this._projects.getValue();
  }

  observeActiveProjectSpec(cb) {
    // TODO: Remove after `atom.project.getSpecification()` is upstreamed.
    if (typeof atom.project.onDidReplace !== 'function' ||
    // $FlowFixMe: Add this to the typedef after we've upstreamed.
    typeof atom.project.getSpecification !== 'function') {
      cb(null);
      return new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }

    return new (_UniversalDisposable || _load_UniversalDisposable()).default((0, (_event || _load_event()).observableFromSubscribeFunction)(callback => atom.project.onDidReplace(callback))
    // $FlowFixMe: Add this to the typedef after we've upstreamed.
    .startWith(atom.project.getSpecification()).subscribe(cb));
  }

  /**
   * Open a project. While this can handle both local and remote URIs, there must already be a
   * connection to the host of the remote project file or it will error.
   */
  async open(uri) {
    let fsApi;
    let expandedUri;
    let realPath;

    if ((_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
      fsApi = await getFsServiceFor(uri);
      if (fsApi == null) {
        throw new Error('Tried to load a remote project without a connection.');
      }
      realPath = await fsApi.resolveRealPath((_nuclideUri || _load_nuclideUri()).default.getPath(uri));
      expandedUri = (_nuclideUri || _load_nuclideUri()).default.resolve(uri, realPath);
    } else {
      fsApi = (_fsPromise || _load_fsPromise()).default;
      expandedUri = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(uri);
      realPath = expandedUri;
    }

    let rawContents;
    try {
      rawContents = parseProject((await fsApi.readFile(realPath)).toString());
    } catch (e) {
      throw new Error(`Unable to find or parse atomproject at ${expandedUri}, make sure that the root repo` + ' (ie: fbsource, www) is in the correct location.');
    }

    const spec = _validateProjectSpec(Object.assign({}, rawContents, {
      originPath: expandedUri
    }));

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
    atom.project.replace(Object.assign({}, spec));
  }

  async addRecentProject(projectFile, host) {
    const recentProjects = await loadRecentProjects();
    const key = projectFileToKey(projectFile);
    const project = recentProjects.get(key) || {
      lastAccessed: 0,
      projectFile,
      hosts: []
    };
    project.hosts = (0, (_without2 || _load_without()).default)(project.hosts, host);
    project.hosts.unshift(host);
    project.lastAccessed = Date.now();
    recentProjects.set(key, project);
    await saveRecentProjects(recentProjects);
    this._projects.next({ projectFile, host });
    this._recentProjects.next(projectsToList(recentProjects));
  }

  async getRecentProjects() {
    const recents = projectsToList((await loadRecentProjects()));
    return recents;
  }
}

exports.default = new ProjectManager();


function projectsToList(projects) {
  return projects.dump().map(pair => pair.v).sort((a, b) => b.lastAccessed - a.lastAccessed);
}

function projectFileToKey(projectFile) {
  return [projectFile.repo, projectFile.path].join('#');
}

async function loadRecentProjects() {
  const recentProjectsEntries = await (_idbKeyval || _load_idbKeyval()).default.get(RECENT_PROJECTS_KEY);
  const recentProjects = new (_lruCache || _load_lruCache()).default({ max: 100 });
  if (recentProjectsEntries) {
    // $FlowFixMe
    recentProjects.load(recentProjectsEntries);
  }

  return recentProjects;
}

async function saveRecentProjects(recentProjects) {
  await (_idbKeyval || _load_idbKeyval()).default.set(RECENT_PROJECTS_KEY, recentProjects.dump());
}

function parseProject(raw) {
  try {
    return (_toml || _load_toml()).default.parse(raw);
  } catch (err) {
    if (err.name === 'SyntaxError') {
      return (_season || _load_season()).default.parse(raw);
    }
    throw err;
  }
}

function _validateProjectSpec(raw) {
  const spec = Object.assign({}, raw);
  const baseDir = (_nuclideUri || _load_nuclideUri()).default.dirname((_nuclideUri || _load_nuclideUri()).default.getPath(spec.originPath));
  const originalPaths = raw.paths;
  spec.paths = originalPaths != null && Array.isArray(originalPaths) ? originalPaths.map(p => (_nuclideUri || _load_nuclideUri()).default.resolve(baseDir, p)) : [baseDir];
  return spec;
}

async function getRepoRoots(paths, fsApi) {
  const repoRootUris = await Promise.all(paths.map(async path => {
    const hgRoot = await fsApi.findNearestAncestorNamed('.hg', path);
    return hgRoot == null ? fsApi.findNearestAncestorNamed('.git', path) : hgRoot;
  }));
  const repoRoots = repoRootUris.filter(Boolean).map(uri => (_nuclideUri || _load_nuclideUri()).default.getPath((_nuclideUri || _load_nuclideUri()).default.dirname(uri)));
  return Array.from(new Set(repoRoots));
}

async function getFsServiceFor(uri) {
  const rpcService = await new Promise(resolve => {
    atom.packages.serviceHub.consume('nuclide-rpc-services', '0.0.0', resolve);
  });
  return rpcService.getServiceByNuclideUri('FileSystemService', uri);
}