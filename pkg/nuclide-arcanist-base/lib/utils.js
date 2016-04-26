'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type PhabricatorRevisionInfo = {
 url: string;
 id: string;
};

const DIFFERENTIAL_REVISION_REGEX = /^Differential Revision:\s*(\D+\/[dD]([1-9][0-9]{5,}))/im;

export function getPhabricatorRevisionFromCommitMessage(
  commitMessage: string,
): ?PhabricatorRevisionInfo {
  const match = DIFFERENTIAL_REVISION_REGEX.exec(commitMessage);
  if (match === null) {
    return null;
  } else {
    return {
      url: match[1],
      id: `D${match[2]}`,
    };
  }
}
