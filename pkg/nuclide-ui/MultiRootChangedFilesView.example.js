"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MultiRootChangedFilesViewExample = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _MultiRootChangedFilesView() {
  const data = require("./MultiRootChangedFilesView");

  _MultiRootChangedFilesView = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
  const fileChanges = new Map([['nuclide://remote.host/someRemoteDir', new Map([['path/to/some/file/added.js', _nuclideVcsBase().FileChangeStatus.ADDED], ['path/to/some/file/modified.js', _nuclideVcsBase().FileChangeStatus.MODIFIED], ['path/to/some/file/missing.js', _nuclideVcsBase().FileChangeStatus.MISSING], ['path/to/some/file/removed.js', _nuclideVcsBase().FileChangeStatus.REMOVED], ['path/to/some/file/untracked.js', _nuclideVcsBase().FileChangeStatus.UNTRACKED]])], ['someLocalDir', new Map([['file/with/shared/prefix/foo.js', _nuclideVcsBase().FileChangeStatus.MODIFIED], ['file/with/shared/prefix/bar.js', _nuclideVcsBase().FileChangeStatus.MODIFIED], ['file/with/shared/prefix/baz.js', _nuclideVcsBase().FileChangeStatus.MODIFIED], ['file/with/another/prefix/foo.js', _nuclideVcsBase().FileChangeStatus.MODIFIED], ['file/with/another/prefix/bar.js', _nuclideVcsBase().FileChangeStatus.MODIFIED]])]]);
  return React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_MultiRootChangedFilesView().MultiRootChangedFilesView, {
    fileStatuses: fileChanges,
    commandPrefix: "nuclide-ui-playground",
    selectedFile: null,
    onFileChosen: onFileChosen,
    openInDiffViewOption: true
  })));
}

const MultiRootChangedFilesViewExample = {
  sectionName: 'MultiRootChangedFilesView',
  description: 'Renders a list of changed files, across one or more directories.',
  examples: [{
    title: 'Basic example',
    component: BasicExample
  }]
};
exports.MultiRootChangedFilesViewExample = MultiRootChangedFilesViewExample;