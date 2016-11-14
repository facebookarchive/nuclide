'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let doGetBlameForEditor = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (editor) {
    const path = editor.getPath();
    if (!path) {
      return Promise.resolve(new Map());
    }

    const repo = (0, (_common || _load_common()).hgRepositoryForEditor)(editor);
    if (!repo) {
      const message = `HgBlameProvider could not fetch blame for ${ path }: no Hg repo found.`;
      logger.error(message);
      throw new Error(message);
    }

    const blameInfo = yield repo.getBlameAtHead(path);
    // TODO (t8045823) Convert the return type of ::getBlameAtHead to a Map when
    // the service framework supports a Map return type.
    const useShortName = !(_featureConfig || _load_featureConfig()).default.get('nuclide-blame-provider-hg.showVerboseBlame');
    return formatBlameInfo(blameInfo, useShortName);
  });

  return function doGetBlameForEditor(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Takes a map returned by HgRepositoryClient.getBlameAtHead() and reformats it as a Map of
 * line numbers to blame info to display in the blame gutter. If `useShortName` is false,
 * The blame info is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
 * (The Firstname Lastname may not appear sometimes.) If `useShortName` is true, then the
 * author portion will contain only the username.
 */


var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _common;

function _load_common() {
  return _common = require('./common');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideVcsLog;

function _load_nuclideVcsLog() {
  return _nuclideVcsLog = require('../../nuclide-vcs-log');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

function canProvideBlameForEditor(editor) {
  if (editor.isModified()) {
    atom.notifications.addInfo('There is Hg blame information for this file, but only for saved changes. ' + 'Save, then try again.');
    logger.info('nuclide-blame: Could not open Hg blame due to unsaved changes in file: ' + String(editor.getPath()));
    return false;
  }
  const repo = (0, (_common || _load_common()).hgRepositoryForEditor)(editor);
  return Boolean(repo);
}

function getBlameForEditor(editor) {
  return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackOperationTiming)('blame-provider-hg:getBlameForEditor', () => doGetBlameForEditor(editor));
}

function formatBlameInfo(rawBlameData, useShortName) {
  const extractAuthor = useShortName ? (_nuclideVcsLog || _load_nuclideVcsLog()).shortNameForAuthor : identity;

  const blameForEditor = new Map();
  rawBlameData.forEach((blameName, serializedLineNumber) => {
    const lineNumber = parseInt(serializedLineNumber, 10);
    const index = blameName.lastIndexOf(' ');
    const changeSetId = blameName.substring(index + 1);
    const fullAuthor = blameName.substring(0, index);

    // The ChangeSet ID will be null for uncommitted local changes.
    const blameInfo = {
      author: extractAuthor(fullAuthor),
      changeset: changeSetId !== 'null' ? changeSetId : null
    };
    blameForEditor.set(lineNumber, blameInfo);
  });
  return blameForEditor;
}

/** @return The input value. */
function identity(anything) {
  return anything;
}

let getUrlForRevision;
try {
  // $FlowFB
  var _require = require('./fb/FbHgBlameProvider');

  const getPhabricatorUrlForRevision = _require.getPhabricatorUrlForRevision;

  getUrlForRevision = getPhabricatorUrlForRevision;
} catch (e) {
  // Ignore case where FbHgBlameProvider is unavailable.
}

module.exports = {
  canProvideBlameForEditor: canProvideBlameForEditor,
  getBlameForEditor: getBlameForEditor,
  getUrlForRevision: getUrlForRevision,
  __test__: {
    formatBlameInfo: formatBlameInfo
  }
};