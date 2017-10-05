'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let findInActive = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const activePane = atom.workspace.getActivePane().element;
    atom.commands.dispatch(activePane, 'project-find:show');

    const allProjectsRemote = atom.project.getDirectories().every(function (dir) {
      return (_nuclideUri || _load_nuclideUri()).default.isRemote(dir.getPath());
    });

    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('find-in-working-set:hotkey', { allProjectsRemote });
    if (!allProjectsRemote) {
      atom.notifications.addWarning("Working set searches don't yet work in local projects", { dismissable: true });
      return;
    }

    if (!atom.packages.isPackageActive('find-and-replace')) {
      yield atom.packages.activatePackage('find-and-replace');
    }
    const findPackage = atom.packages.getActivePackage('find-and-replace');

    if (!findPackage) {
      throw new Error('find-and-replace package is not active');
    }

    const view = findPackage.mainModule.projectFindView;

    if (!(view && view.pathsEditor && view.pathsEditor.setText)) {
      throw new Error('find-and-replace internals have changed - please update this code');
    }

    view.pathsEditor.setText((_constants || _load_constants()).WORKING_SET_PATH_MARKER);
  });

  return function findInActive() {
    return _ref.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideWorkingSetsStore = provideWorkingSetsStore;

var _atom = require('atom');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _WorkingSetsStore;

function _load_WorkingSetsStore() {
  return _WorkingSetsStore = require('./WorkingSetsStore');
}

var _WorkingSetsConfig;

function _load_WorkingSetsConfig() {
  return _WorkingSetsConfig = require('./WorkingSetsConfig');
}

var _PathsObserver;

function _load_PathsObserver() {
  return _PathsObserver = require('./PathsObserver');
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-working-sets-common/lib/constants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this.workingSetsStore = new (_WorkingSetsStore || _load_WorkingSetsStore()).WorkingSetsStore();
    this._workingSetsConfig = new (_WorkingSetsConfig || _load_WorkingSetsConfig()).WorkingSetsConfig();
    this._disposables = new _atom.CompositeDisposable();

    this._disposables.add(this.workingSetsStore.onSaveDefinitions(definitions => {
      this._workingSetsConfig.setDefinitions(definitions);
    }));

    this._disposables.add(this._workingSetsConfig.observeDefinitions(definitions => {
      this.workingSetsStore.updateDefinitions(definitions);
    }));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:toggle-last-selected', this.workingSetsStore.toggleLastSelected.bind(this.workingSetsStore)));

    this._disposables.add(atom.commands.add('atom-workspace', 'working-sets:find-in-active', findInActive));

    this._disposables.add(new (_PathsObserver || _load_PathsObserver()).PathsObserver(this.workingSetsStore));
  }

  deactivate() {
    this._disposables.dispose();
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

let activation = null;

function activate() {
  if (activation != null) {
    return;
  }

  activation = new Activation();
}

function deactivate() {
  if (activation == null) {
    return;
  }

  activation.deactivate();
  activation = null;
}

function provideWorkingSetsStore() {
  if (!activation) {
    throw new Error('Was requested to provide service from a non-activated package');
  }

  return activation.workingSetsStore;
}