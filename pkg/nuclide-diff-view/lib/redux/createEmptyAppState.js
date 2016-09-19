Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.createEmptyAppState = createEmptyAppState;

var _constants2;

function _constants() {
  return _constants2 = require('../constants');
}

function createEmptyAppState() {
  return {
    activeRepository: null,
    commitMessage: null,
    commitMode: (_constants2 || _constants()).CommitMode.COMMIT,
    commitModeState: (_constants2 || _constants()).CommitModeState.READY,
    filePath: '',
    fromRevisionTitle: 'No file selected',
    newContents: '',
    oldContents: '',
    publishMessage: null,
    publishMode: (_constants2 || _constants()).PublishMode.CREATE,
    publishModeState: (_constants2 || _constants()).PublishModeState.READY,
    repositoriesStates: new Map(),
    shouldRebaseOnAmend: true,
    toRevisionTitle: 'No file selected',
    viewMode: (_constants2 || _constants()).DiffMode.BROWSE_MODE
  };
}