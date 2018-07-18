"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._validateProjectSpec = _validateProjectSpec;
exports.default = void 0;

function _without2() {
  const data = _interopRequireDefault(require("lodash/without"));

  _without2 = function () {
    return data;
  };

  return data;
}

function _idbKeyval() {
  const data = _interopRequireDefault(require("idb-keyval"));

  _idbKeyval = function () {
    return data;
  };

  return data;
}

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _toml() {
  const data = _interopRequireDefault(require("toml"));

  _toml = function () {
    return data;
  };

  return data;
}

function _season() {
  const data = _interopRequireDefault(require("season"));

  _season = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects';

class ProjectManager {
  constructor() {
    this._projects = new _RxMin.BehaviorSubject();
    this._recentProjects = new _RxMin.Subject();
  }

  getProjects() {
    return _RxMin.Observable.concat(_RxMin.Observable.defer(() => this.getRecentProjects()), this._recentProjects.asObservable());
  }

  getActiveProject() {
    return this._projects.getValue();
  }

  observeActiveProjectSpec(cb) {
    // TODO: Remove after `atom.project.getSpecification()` is upstreamed.
    if (typeof atom.project.onDidReplace !== 'function' || // $FlowFixMe: Add this to the typedef after we've upstreamed.
    typeof atom.project.getSpecification !== 'function') {
      cb(null);
      return new (_UniversalDisposable().default)();
    }

    return new (_UniversalDisposable().default)((0, _event().observableFromSubscribeFunction)(callback => atom.project.onDidReplace(callback)) // $FlowFixMe: Add this to the typedef after we've upstreamed.
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

    if (_nuclideUri().default.isRemote(uri)) {
      fsApi = await getFsServiceFor(uri);

      if (fsApi == null) {
        throw new Error('Tried to load a remote project without a connection.');
      }

      realPath = await fsApi.resolveRealPath(_nuclideUri().default.getPath(uri));
      expandedUri = _nuclideUri().default.resolve(uri, realPath);
    } else {
      fsApi = _fsPromise().default;
      expandedUri = _nuclideUri().default.expandHomeDir(uri);
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
    })); // Even though the project may list a bunch of directories, we actually mount the repository
    // root and then filter. This is a change from the normal Atom handling so we need to
    // account for that.


    const repoRoots = await getRepoRoots(spec.paths, fsApi);

    if (repoRoots.length !== 0) {
      // As far as Atom is concerned, the repo root will be the path. However, we put the
      // original paths on the project spec as `_paths` so we can use them to filter the file
      // tree.
      spec._paths = spec.paths;
      spec.paths = repoRoots;
    } // $FlowFixMe: Add typedef


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
    project.hosts = (0, _without2().default)(project.hosts, host);
    project.hosts.unshift(host);
    project.lastAccessed = Date.now();
    recentProjects.set(key, project);
    await saveRecentProjects(recentProjects);

    this._projects.next({
      projectFile,
      host
    });

    this._recentProjects.next(projectsToList(recentProjects));
  }

  async getRecentProjects() {
    const recents = projectsToList((await loadRecentProjects()));
    return recents;
  }

}

var _default = new ProjectManager();

exports.default = _default;

function projectsToList(projects) {
  return projects.dump().map(pair => pair.v).sort((a, b) => b.lastAccessed - a.lastAccessed);
}

function projectFileToKey(projectFile) {
  return [projectFile.repo, projectFile.path].join('#');
}

async function loadRecentProjects() {
  const recentProjectsEntries = await _idbKeyval().default.get(RECENT_PROJECTS_KEY);
  const recentProjects = new (_lruCache().default)({
    max: 100
  });

  if (recentProjectsEntries) {
    recentProjects.load(recentProjectsEntries);
  }

  return recentProjects;
}

async function saveRecentProjects(recentProjects) {
  await _idbKeyval().default.set(RECENT_PROJECTS_KEY, recentProjects.dump());
}

function parseProject(raw) {
  try {
    return _toml().default.parse(raw);
  } catch (err) {
    if (err.name === 'SyntaxError') {
      return _season().default.parse(raw);
    }

    throw err;
  }
}

function _validateProjectSpec(raw) {
  const spec = Object.assign({}, raw);

  const baseDir = _nuclideUri().default.dirname(_nuclideUri().default.getPath(spec.originPath));

  const originalPaths = raw.paths;
  spec.paths = originalPaths != null && Array.isArray(originalPaths) ? originalPaths.map(p => _nuclideUri().default.resolve(baseDir, p)) : [baseDir];
  return spec;
}

async function getRepoRoots(paths, fsApi) {
  const repoRootUris = await Promise.all(paths.map(async path => {
    const hgRoot = await fsApi.findNearestAncestorNamed('.hg', path);
    return hgRoot == null ? fsApi.findNearestAncestorNamed('.git', path) : hgRoot;
  }));
  const repoRoots = repoRootUris.filter(Boolean).map(uri => _nuclideUri().default.getPath(_nuclideUri().default.dirname(uri)));
  return Array.from(new Set(repoRoots));
}

async function getFsServiceFor(uri) {
  const rpcService = await new Promise(resolve => {
    atom.packages.serviceHub.consume('nuclide-rpc-services', '0.0.0', resolve);
  });
  return rpcService.getServiceByNuclideUri('FileSystemService', uri);
}