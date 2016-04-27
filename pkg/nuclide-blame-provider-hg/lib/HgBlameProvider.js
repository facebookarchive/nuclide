var doGetBlameForEditor = _asyncToGenerator(function* (editor) {
  var path = editor.getPath();
  if (!path) {
    return Promise.resolve(new Map());
  }

  var repo = (0, _common.hgRepositoryForEditor)(editor);
  if (!repo) {
    var message = 'HgBlameProvider could not fetch blame for ' + path + ': no Hg repo found.';
    getLogger().error(message);
    throw new Error(message);
  }

  var blameInfo = yield repo.getBlameAtHead(path);
  // TODO (t8045823) Convert the return type of ::getBlameAtHead to a Map when
  // the service framework supports a Map return type.
  var useShortName = !_nuclideFeatureConfig2['default'].get('nuclide-blame-provider-hg.showVerboseBlame');
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _common = require('./common');

var _nuclideAnalytics = require('../../nuclide-analytics');

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
  var repo = (0, _common.hgRepositoryForEditor)(editor);
  return !!repo;
}

function getBlameForEditor(editor) {
  return (0, _nuclideAnalytics.trackOperationTiming)('blame-provider-hg:getBlameForEditor', function () {
    return doGetBlameForEditor(editor);
  });
}

function formatBlameInfo(rawBlameData, useShortName) {
  var extractAuthor = useShortName ? shortenBlameName : identity;

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

// Mercurial history emails can be invalid.
var HG_EMAIL_REGEX = /\b([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\b/;
/**
 * `hg blame` may return the 'user' name in a mix of formats:
 *   - foo@bar.com
 *   - bar@56abc2-24378f
 *   - Foo Bar <foo@bar.com>
 * This method shortens the name in `blameName` to just
 * return the beginning part of the email, iff an email is present.
 * The examples above would become 'foo'.
 */
function shortenBlameName(blameName) {
  var match = blameName.match(HG_EMAIL_REGEX);
  // Index 0 will be the whole email. Index 1 is the capture group.
  return match ? match[1] : blameName;
}

/** @return The input value. */
function identity(anything) {
  return anything;
}

var getUrlForRevision = undefined;
try {
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