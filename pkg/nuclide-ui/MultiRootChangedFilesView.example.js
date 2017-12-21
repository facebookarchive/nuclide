'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesViewExample = undefined;

var _react = _interopRequireWildcard(require('react'));

var _Block;

function _load_Block() {
  return _Block = require('nuclide-commons-ui/Block');
}

var _MultiRootChangedFilesView;

function _load_MultiRootChangedFilesView() {
  return _MultiRootChangedFilesView = require('./MultiRootChangedFilesView');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../nuclide-vcs-base');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function onFileChosen(uri) {
  atom.notifications.addInfo(`Selected file ${uri}`);
}

function BasicExample() {
  const fileChanges = new Map([['nuclide://remote.host/someRemoteDir', new Map([['path/to/some/file/added.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.ADDED], ['path/to/some/file/modified.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED], ['path/to/some/file/missing.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MISSING], ['path/to/some/file/removed.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.REMOVED], ['path/to/some/file/untracked.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.UNTRACKED]])], ['someLocalDir', new Map([['file/with/shared/prefix/foo.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED], ['file/with/shared/prefix/bar.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED], ['file/with/shared/prefix/baz.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED], ['file/with/another/prefix/foo.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED], ['file/with/another/prefix/bar.js', (_nuclideVcsBase || _load_nuclideVcsBase()).FileChangeStatus.MODIFIED]])]]);
  return _react.createElement(
    'div',
    null,
    _react.createElement(
      (_Block || _load_Block()).Block,
      null,
      _react.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
        fileStatuses: fileChanges,
        commandPrefix: 'sample-ui-playground',
        selectedFile: null,
        onFileChosen: onFileChosen,
        openInDiffViewOption: true
      })
    )
  );
}

const MultiRootChangedFilesViewExample = exports.MultiRootChangedFilesViewExample = {
  sectionName: 'MultiRootChangedFilesView',
  description: 'Renders a list of changed files, across one or more directories.',
  examples: [{
    title: 'Basic example',
    component: BasicExample
  }]
};