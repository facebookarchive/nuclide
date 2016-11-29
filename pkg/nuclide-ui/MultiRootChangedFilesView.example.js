'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesViewExample = undefined;

var _reactForAtom = require('react-for-atom');

var _Block;

function _load_Block() {
  return _Block = require('./Block');
}

var _MultiRootChangedFilesView;

function _load_MultiRootChangedFilesView() {
  return _MultiRootChangedFilesView = require('./MultiRootChangedFilesView');
}

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-hg-git-bridge/lib/constants');
}

function onFileChosen(uri) {
  atom.notifications.addInfo(`Selected file ${ uri }`);
}

function BasicExample() {
  const fileChanges = new Map([['nuclide://remote.host/someRemoteDir', new Map([['path/to/some/file/added.js', (_constants || _load_constants()).FileChangeStatus.ADDED], ['path/to/some/file/modified.js', (_constants || _load_constants()).FileChangeStatus.MODIFIED], ['path/to/some/file/missing.js', (_constants || _load_constants()).FileChangeStatus.MISSING], ['path/to/some/file/removed.js', (_constants || _load_constants()).FileChangeStatus.REMOVED], ['path/to/some/file/untracked.js', (_constants || _load_constants()).FileChangeStatus.UNTRACKED]])], ['someLocalDir', new Map([['file/with/shared/prefix/foo.js', (_constants || _load_constants()).FileChangeStatus.MODIFIED], ['file/with/shared/prefix/bar.js', (_constants || _load_constants()).FileChangeStatus.MODIFIED], ['file/with/shared/prefix/baz.js', (_constants || _load_constants()).FileChangeStatus.MODIFIED], ['file/with/another/prefix/foo.js', (_constants || _load_constants()).FileChangeStatus.MODIFIED], ['file/with/another/prefix/bar.js', (_constants || _load_constants()).FileChangeStatus.MODIFIED]])]]);
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      (_Block || _load_Block()).Block,
      null,
      _reactForAtom.React.createElement((_MultiRootChangedFilesView || _load_MultiRootChangedFilesView()).MultiRootChangedFilesView, {
        fileChanges: fileChanges,
        commandPrefix: 'sample-ui-playground',
        selectedFile: null,
        onFileChosen: onFileChosen
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