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

// From http://www.regular-expressions.info/email.html
var EMAIL_REGEX = /\b([A-Za-z0-9._%+-]+)@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}\b/;
/**
 * `hg blame` may return the 'user' name in a mix of formats:
 *   - foo@bar.com
 *   - Foo Bar <foo@bar.com>
 * This method shortens the name for each line entry in `blameInfo` to just
 * return the beginning part of the email, iff an email is present.
 * The examples above would become 'foo'.
 * @return A new Map of the given blameInfo, in which the blame names are shortened.
 */
function shortenBlameNames(blameInfo: BlameForEditor): BlameForEditor {
  var newBlameInfo = new Map();
  for (var [blameLineNumber, blameName] of blameInfo) {
    var shortenedNameMatch = blameName.match(EMAIL_REGEX);
    if (shortenedNameMatch) {
      // Index 0 will be the whole email. Index 1 is the capture group.
      newBlameInfo.set(blameLineNumber, shortenedNameMatch[1]);
    } else {
      newBlameInfo.set(blameLineNumber, blameName);
    }
  }
  return newBlameInfo;
}

function canProvideBlameForEditor(editor: TextEditor): boolean {
  var repo = hgRepositoryForEditor(editor);
  return !!repo;
}

async function getBlameForEditor(editor: TextEditor): Promise<BlameForEditor> {
  var repo = hgRepositoryForEditor(editor);
  if (!repo) {
    var message = 'HgBlameProvider could not fetch blame for ' + editor.getPath() + ': no Hg repo found.';
    getLogger().error(message);
    throw new Error(message);
  }

  var blameForEditor = await repo.getBlameAtHead(editor.getPath());
  if (!(atom.config.get('nuclide-blame-provider-hg.showVerboseBlame'))) {
    return shortenBlameNames(blameForEditor);
  } else {
    return blameForEditor;
  }
}


module.exports = {
  canProvideBlameForEditor,
  getBlameForEditor,
  __test__: {
    shortenBlameNames,
  },
};
