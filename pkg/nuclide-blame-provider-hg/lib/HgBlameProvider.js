var doGetBlameForEditor = _asyncToGenerator(function* (editor) {
  var path = editor.getPath();
  if (!path) {
    return Promise.resolve(new Map());
  }

  var repo = (0, (_common2 || _common()).hgRepositoryForEditor)(editor);
  if (!repo) {
    var message = 'HgBlameProvider could not fetch blame for ' + path + ': no Hg repo found.';
    getLogger().error(message);
    throw new Error(message);
  }

  var blameInfo = yield repo.getBlameAtHead(path);
  // TODO (t8045823) Convert the return type of ::getBlameAtHead to a Map when
  // the service framework supports a Map return type.
  var useShortName = !(_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-blame-provider-hg.showVerboseBlame');
  return formatBlameInfo(blameInfo, useShortName);
}

/**
 * Takes a map returned by HgRepositoryClient.getBlameAtHead() and reformats it as a Map of
 * line numbers to blame info to display in the blame gutter. If `useShortName` is false,
 * The blame info is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
 * (The Firstname Lastname may not appear sometimes.) If `useShortName` is true, then the
 * author portion will contain only the username.
 */
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../nuclide-feature-config'));
}

var _common2;

function _common() {
  return _common2 = require('./common');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _nuclideVcsLog2;

function _nuclideVcsLog() {
  return _nuclideVcsLog2 = require('../../nuclide-vcs-log');
}

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

function canProvideBlameForEditor(editor) {
  if (editor.isModified()) {
    atom.notifications.addInfo('There is Hg blame information for this file, but only for saved changes. ' + 'Save, then try again.');
    getLogger().info('nuclide-blame: Could not open Hg blame due to unsaved changes in file: ' + String(editor.getPath()));
    return false;
  }
  var repo = (0, (_common2 || _common()).hgRepositoryForEditor)(editor);
  return Boolean(repo);
}

function getBlameForEditor(editor) {
  return (0, (_nuclideAnalytics2 || _nuclideAnalytics()).trackOperationTiming)('blame-provider-hg:getBlameForEditor', function () {
    return doGetBlameForEditor(editor);
  });
}

function formatBlameInfo(rawBlameData, useShortName) {
  var extractAuthor = useShortName ? (_nuclideVcsLog2 || _nuclideVcsLog()).shortNameForAuthor : identity;

  var blameForEditor = new Map();
  rawBlameData.forEach(function (blameName, serializedLineNumber) {
    var lineNumber = parseInt(serializedLineNumber, 10);
    var index = blameName.lastIndexOf(' ');
    var changeSetId = blameName.substring(index + 1);
    var fullAuthor = blameName.substring(0, index);

    // The ChangeSet ID will be null for uncommitted local changes.
    var blameInfo = {
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

var getUrlForRevision = undefined;
try {
  // $FlowFB

  var _require = require('./fb/FbHgBlameProvider');

  var getPhabricatorUrlForRevision = _require.getPhabricatorUrlForRevision;

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