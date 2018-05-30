'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _idbKeyval;

function _load_idbKeyval() {
  return _idbKeyval = _interopRequireDefault(require('idb-keyval'));
}

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const RECENT_PROJECTS_KEY = 'nuclide_recent_projects'; /**
                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the BSD-style license found in the
                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                        *
                                                        *  strict-local
                                                        * @format
                                                        */

class ProjectManager {
  constructor() {
    this._projects = new _rxjsBundlesRxMinJs.BehaviorSubject();
  }

  getProjects() {
    return this._projects.asObservable();
  }

  getActiveProject() {
    return this._projects.getValue();
  }

  async addRecentProject(projectFile, host) {
    const recentProjects = await loadRecentProjects();
    const key = projectFileToKey(projectFile);
    const project = recentProjects.get(key) || {
      lastAccessed: 0,
      projectFile,
      hosts: []
    };
    if (!project.hosts.includes(host)) {
      project.hosts.push(host);
    }
    project.lastAccessed = Date.now();
    recentProjects.set(key, project);
    await saveRecentProjects(recentProjects);
    this._projects.next({ projectFile, host });
  }

  async getRecentProjects() {
    const recentProjects = await loadRecentProjects();
    return recentProjects.dump().map(pair => pair.v).sort((a, b) => b.lastAccessed - a.lastAccessed);
  }
}

exports.default = new ProjectManager();


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