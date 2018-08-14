"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _WorkingSetsStore() {
  const data = require("./WorkingSetsStore");

  _WorkingSetsStore = function () {
    return data;
  };

  return data;
}

function _WorkingSetsConfig() {
  const data = require("./WorkingSetsConfig");

  _WorkingSetsConfig = function () {
    return data;
  };

  return data;
}

function _PathsObserver() {
  const data = require("./PathsObserver");

  _PathsObserver = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-working-sets-common/lib/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _extractDefinitionsFromProject() {
  const data = _interopRequireDefault(require("./extractDefinitionsFromProject"));

  _extractDefinitionsFromProject = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// $FlowFB
class Activation {
  constructor() {
    this._projectManagers = new _RxMin.BehaviorSubject();
    this.workingSetsStore = new (_WorkingSetsStore().WorkingSetsStore)();
    this._workingSetsConfig = new (_WorkingSetsConfig().WorkingSetsConfig)();
    this._disposables = new (_UniversalDisposable().default)();

    this._disposables.add(this.workingSetsStore.onSaveDefinitions(definitions => {
      this._workingSetsConfig.setDefinitions(definitions);
    }));

    this._disposables.add(this._workingSetsConfig.observeDefinitions(definitions => {
      this.workingSetsStore.updateUserDefinitions(definitions);
    }));

    this._disposables.add(this._projectManagers.switchMap(projectManager => projectManager == null ? _RxMin.Observable.of(null) : (0, _event().observableFromSubscribeFunction)(cb => projectManager.observeActiveProjectSpec(cb))).subscribe(spec => {
      this.workingSetsStore.updateProjectDefinitions((0, _extractDefinitionsFromProject().default)(spec));
    }));

    this._disposables.add(atom.project.onDidChangePaths(() => {
      this.workingSetsStore.updateApplicability();
    }));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:toggle-last-selected', this.workingSetsStore.toggleLastSelected.bind(this.workingSetsStore)));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:find-in-active', findInActive));

    this._disposables.add(new (_PathsObserver().PathsObserver)(this.workingSetsStore));
  }

  dispose() {
    this._disposables.dispose();
  }

  provideWorkingSetsStore() {
    return this.workingSetsStore;
  }

  consumeProjectManager(projectManager) {
    this._projectManagers.next(projectManager);

    return new (_UniversalDisposable().default)(() => {
      if (this._projectManagers.getValue() === projectManager) {
        this._projectManagers.next(null);
      }
    });
  }

}

async function findInActive() {
  const activePane = atom.workspace.getActivePane().element;
  atom.commands.dispatch(activePane, 'project-find:show');
  const allProjectsRemote = atom.project.getDirectories().every(dir => _nuclideUri().default.isRemote(dir.getPath()));
  (0, _nuclideAnalytics().track)('find-in-working-set:hotkey', {
    allProjectsRemote
  });

  if (!allProjectsRemote) {
    atom.notifications.addWarning("Working set searches don't yet work in local projects", {
      dismissable: true
    });
    return;
  }

  if (!atom.packages.isPackageActive('find-and-replace')) {
    await atom.packages.activatePackage('find-and-replace');
  }

  const findPackage = atom.packages.getActivePackage('find-and-replace');

  if (!findPackage) {
    throw new Error('find-and-replace package is not active');
  }

  const view = findPackage.mainModule.projectFindView;

  if (!(view && view.pathsEditor && view.pathsEditor.setText)) {
    throw new Error('find-and-replace internals have changed - please update this code');
  }

  view.pathsEditor.setText(_constants().WORKING_SET_PATH_MARKER);
}

(0, _createPackage().default)(module.exports, Activation);