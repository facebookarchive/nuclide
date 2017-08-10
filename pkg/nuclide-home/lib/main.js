'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let displayChangelog = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    const markdownPreviewPkg = atom.packages.getLoadedPackage('markdown-preview');
    if (markdownPreviewPkg != null) {
      yield atom.packages.activatePackage('markdown-preview');
      const fbChangelogPath = (_nuclideUri || _load_nuclideUri()).default.join((0, (_systemInfo || _load_systemInfo()).getAtomNuclideDir)(), 'fb-CHANGELOG.md');
      const osChangelogPath = (_nuclideUri || _load_nuclideUri()).default.join((0, (_systemInfo || _load_systemInfo()).getAtomNuclideDir)(), 'CHANGELOG.md');
      const fbChangeLogExists = yield (_fsPromise || _load_fsPromise()).default.exists(fbChangelogPath);
      const changelogPath = fbChangeLogExists ? fbChangelogPath : osChangelogPath;
      // eslint-disable-next-line nuclide-internal/atom-apis
      yield atom.workspace.open(encodeURI(`markdown-preview://${changelogPath}`));
    }
  });

  return function displayChangelog() {
    return _ref.apply(this, arguments);
  };
})();

exports.activate = activate;
exports.setHomeFragments = setHomeFragments;
exports.deactivate = deactivate;

var _createUtmUrl;

function _load_createUtmUrl() {
  return _createUtmUrl = _interopRequireDefault(require('./createUtmUrl'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _runtimeInfo;

function _load_runtimeInfo() {
  return _runtimeInfo = require('../../commons-node/runtime-info');
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _HomePaneItem;

function _load_HomePaneItem() {
  return _HomePaneItem = _interopRequireDefault(require('./HomePaneItem'));
}

var _HomePaneItem2;

function _load_HomePaneItem2() {
  return _HomePaneItem2 = require('./HomePaneItem');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _react = _interopRequireDefault(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _electron = require('electron');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let subscriptions = null;

// A stream of all of the fragments. This is essentially the state of our panel.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/* global localStorage */
const allHomeFragmentsStream = new _rxjsBundlesRxMinJs.BehaviorSubject((_immutable || _load_immutable()).default.Set());

function activate(state) {
  subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(registerCommandAndOpener());
  considerDisplayingHome();
  const runtimeInfo = (0, (_runtimeInfo || _load_runtimeInfo()).getRuntimeInformation)();
  if (!runtimeInfo.isDevelopment && (_featureConfig || _load_featureConfig()).default.get('nuclide-home.showChangelogs')) {
    const key = `nuclide-home.changelog-shown-${runtimeInfo.nuclideVersion}`;
    // Only display the changelog if this is the first time loading this version.
    // Note that displaying the Home page blocks the changelog for the version:
    // the intention here is to avoid showing the changelog for new users.
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, 'true');
      if (!(_featureConfig || _load_featureConfig()).default.get('nuclide-home.showHome')) {
        displayChangelog();
      }
    }
  }
  subscriptions.add(
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.commands.add('atom-workspace', 'nuclide-home:open-docs', e => {
    const url = (0, (_createUtmUrl || _load_createUtmUrl()).default)('https://nuclide.io/docs', 'help');
    _electron.shell.openExternal(url);
  }));
}

function setHomeFragments(homeFragments) {
  allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().add(homeFragments));
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    allHomeFragmentsStream.next(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  const showHome = (_featureConfig || _load_featureConfig()).default.get('nuclide-home.showHome');
  if (showHome) {
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.workspace.open((_HomePaneItem2 || _load_HomePaneItem2()).WORKSPACE_VIEW_URI);
  }
}

function deactivate() {
  allHomeFragmentsStream.next((_immutable || _load_immutable()).default.Set());
  subscriptions.dispose();
  subscriptions = null;
}

function registerCommandAndOpener() {
  const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
    if (uri === (_HomePaneItem2 || _load_HomePaneItem2()).WORKSPACE_VIEW_URI) {
      return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.default.createElement((_HomePaneItem || _load_HomePaneItem()).default, { allHomeFragmentsStream: allHomeFragmentsStream }));
    }
  }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_HomePaneItem || _load_HomePaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-home:toggle', () => {
    atom.workspace.toggle((_HomePaneItem2 || _load_HomePaneItem2()).WORKSPACE_VIEW_URI);
  }), atom.commands.add('atom-workspace', 'nuclide-docs:open', () => {
    _electron.shell.openExternal('https://nuclide.io/');
  }));
  considerDisplayingHome();
  return disposable;
}