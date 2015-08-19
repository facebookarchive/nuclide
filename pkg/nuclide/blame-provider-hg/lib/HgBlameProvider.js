'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {repositoryForPath} = require('nuclide-hg-git-bridge');

import type {BlameForEditor} from 'nuclide-blame-base/blame-types';

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

function hgRepositoryForEditor(editor: TextEditor): ?Repository {
  var repo = repositoryForPath(editor.getPath());
  if (!repo || repo.getType() !== 'hg') {
    return null;
  }
  return repo;
}

function canProvideBlameForEditor(editor: TextEditor): boolean {
  if (editor.isModified()) {
    atom.notifications.addInfo('There is Hg blame information for this file, but only for saved changes. Save, then try again.');
    getLogger().info(`nuclide-blame: Could not open Hg blame due to unsaved changes in file: ${String(editor.getPath())}`);
    return false;
  }
  var repo = hgRepositoryForEditor(editor);
  return !!repo;
}

async function getBlameForEditor(editor: TextEditor): Promise<BlameForEditor> {
  var path = editor.getPath();
  if (!path) {
    return Promise.resolve(new Map());
  }

  var repo = hgRepositoryForEditor(editor);
  if (!repo) {
    var message = `HgBlameProvider could not fetch blame for ${path}: no Hg repo found.`;
    getLogger().error(message);
    throw new Error(message);
  }

  var blameInfo = await repo.getBlameAtHead(editor.getPath());
  // TODO (t8045823) Convert the return type of ::getBlameAtHead to a Map when
  // the service framework supports a Map return type.
  var useShortName = !(atom.config.get('nuclide-blame-provider-hg.showVerboseBlame'));
  return formatBlameInfo(blameInfo, useShortName);
}

/**
 * Takes a map returned by HgRepositoryClient.getBlameAtHead() and reformats it as a Map of
 * line numbers to blame info to display in the blame gutter. If `useShortName` is false,
 * The blame info is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
 * (The Firstname Lastname may not appear sometimes.) If `useShortName` is true, then the
 * author portion will contain only the username.
 */
function formatBlameInfo(
  rawBlameData: {[key: string]: string},
  useShortName: boolean
): BlameForEditor {
  var extractAuthor = useShortName ? shortenBlameName : identity;

  var blameForEditor = new Map();
  for (var serializedLineNumber in rawBlameData) {
    var blameName = rawBlameData[serializedLineNumber];
    var lineNumber = parseInt(serializedLineNumber, 10);
    var index = blameName.lastIndexOf(' ');
    var changeSetId = blameName.substring(index + 1);
    var fullAuthor = blameName.substring(0, index);

    // The ChangeSet ID will be null for uncommitted local changes.
    var blameInfo = {
      author: extractAuthor(fullAuthor),
      changeset: changeSetId !== 'null' ? changeSetId : null,
    };
    blameForEditor.set(lineNumber, blameInfo);
  }
  return blameForEditor;
}


// From http://www.regular-expressions.info/email.html.
var EMAIL_REGEX = /\b([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;
/**
 * `hg blame` may return the 'user' name in a mix of formats:
 *   - foo@bar.com
 *   - Foo Bar <foo@bar.com>
 * This method shortens the name in `blameName` to just
 * return the beginning part of the email, iff an email is present.
 * The examples above would become 'foo'.
 */
function shortenBlameName(blameName: string): string {
  var match = blameName.match(EMAIL_REGEX);
  // Index 0 will be the whole email. Index 1 is the capture group.
  return match ? match[1] : blameName;
}

/** @return The input value. */
function identity<T>(anything: T): T {
  return anything;
}

module.exports = {
  canProvideBlameForEditor,
  getBlameForEditor,
  __test__: {
    formatBlameInfo,
  },
};
