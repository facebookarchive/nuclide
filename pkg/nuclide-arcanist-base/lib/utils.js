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

exports.getPhabricatorRevisionFromCommitMessage = getPhabricatorRevisionFromCommitMessage;
exports.getCommitAuthorFromAuthorEmail = getCommitAuthorFromAuthorEmail;

var DIFFERENTIAL_REVISION_REGEX = /^Differential Revision:\s*(\D+\/[dD]([1-9][0-9]{5,}))/im;
var COMMIT_AUTHOR_REGEX = /.*<(.*)@.*>/im;

function getPhabricatorRevisionFromCommitMessage(commitMessage) {
  var match = DIFFERENTIAL_REVISION_REGEX.exec(commitMessage);
  if (match === null) {
    return null;
  } else {
    return {
      url: match[1],
      id: parseInt(match[2], 10),
      name: 'D' + match[2]
    };
  }
}

function getCommitAuthorFromAuthorEmail(author) {
  var match = COMMIT_AUTHOR_REGEX.exec(author);
  if (match === null) {
    return null;
  } else {
    return match[1];
  }
}