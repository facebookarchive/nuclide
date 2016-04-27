var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var Emitter = _require.Emitter;
var Directory = _require.Directory;

var _require2 = require('../../nuclide-remote-uri');

var isRemote = _require2.isRemote;

var _require3 = require('../../nuclide-commons');

var singleton = _require3.singleton;

var REMOVE_PROJECT_EVENT = 'did-remove-project';
var ADD_PROJECT_EVENT = 'did-add-project';
var PROJECT_PATH_WATCHER_INSTANCE_KEY = '_nuclide_project_path_watcher';

function getValidProjectPaths() {
  return atom.project.getDirectories().filter(function (directory) {
    // If a remote directory path is a local `Directory` instance, the project path
    // isn't yet ready for consumption.
    if (isRemote(directory.getPath()) && directory instanceof Directory) {
      return false;
    }
    return true;
  }).map(function (directory) {
    return directory.getPath();
  });
}

var ProjectManager = (function () {
  function ProjectManager() {
    _classCallCheck(this, ProjectManager);

    this._emitter = new Emitter();
    this._projectPaths = new Set(getValidProjectPaths());
    atom.project.onDidChangePaths(this._updateProjectPaths.bind(this));
  }

  _createClass(ProjectManager, [{
    key: '_updateProjectPaths',
    value: function _updateProjectPaths(newProjectPaths) {
      var oldProjectPathSet = this._projectPaths;
      var newProjectPathSet = new Set(getValidProjectPaths());
      for (var oldProjectPath of oldProjectPathSet) {
        if (!newProjectPathSet.has(oldProjectPath)) {
          this._emitter.emit(REMOVE_PROJECT_EVENT, oldProjectPath);
        }
      }
      for (var newProjectPath of newProjectPathSet) {
        if (!oldProjectPathSet.has(newProjectPath)) {
          this._emitter.emit(ADD_PROJECT_EVENT, newProjectPath);
        }
      }
      this._projectPaths = newProjectPathSet;
    }
  }, {
    key: 'observeProjectPaths',
    value: function observeProjectPaths(callback) {
      for (var _projectPath of this._projectPaths) {
        callback(_projectPath);
      }
      return this._emitter.on(ADD_PROJECT_EVENT, callback);
    }
  }, {
    key: 'onDidAddProjectPath',
    value: function onDidAddProjectPath(callback) {
      return this._emitter.on(ADD_PROJECT_EVENT, callback);
    }
  }, {
    key: 'onDidRemoveProjectPath',
    value: function onDidRemoveProjectPath(callback) {
      return this._emitter.on(REMOVE_PROJECT_EVENT, callback);
    }
  }]);

  return ProjectManager;
})();

function getProjectManager() {
  return singleton.get(PROJECT_PATH_WATCHER_INSTANCE_KEY, function () {
    return new ProjectManager();
  });
}

module.exports = {
  observeProjectPaths: function observeProjectPaths(callback) {
    return getProjectManager().observeProjectPaths(callback);
  },

  onDidAddProjectPath: function onDidAddProjectPath(callback) {
    return getProjectManager().onDidAddProjectPath(callback);
  },

  onDidRemoveProjectPath: function onDidRemoveProjectPath(callback) {
    return getProjectManager().onDidRemoveProjectPath(callback);
  },

  __test__: {
    PROJECT_PATH_WATCHER_INSTANCE_KEY: PROJECT_PATH_WATCHER_INSTANCE_KEY
  }
};