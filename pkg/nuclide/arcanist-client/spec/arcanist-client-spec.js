'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import arcanistClient from '../';

describe('nuclide-arcanist-client', () => {
  const testCases = [
    [
      'Differential Revision: https://phabricator.fb.com/D169775',
      {id: 'D169775', url: 'https://phabricator.fb.com/D169775'},
    ],
    ['Some stuff', null],
    [
      (`Multiline

      message
      Differential Revision: https://phabricator.fb.com/d123456
      Test plan: foo!`).replace(/^ +/gm, ''),
      {id: 'D123456', url: 'https://phabricator.fb.com/d123456'},
    ],
  ];
  it('can parse a commit message and get the revision ID', () => {
    for (const [message, correctAnswer] of testCases) {
      const msg = `Test data: '${message}'`;
      const revisionInfo = arcanistClient.getPhabricatorRevisionFromCommitMessage(message);
      if (correctAnswer == null) {
        expect(revisionInfo).toBeNull(msg);
      } else {
        expect(revisionInfo).not.toBeNull(msg);
        invariant(revisionInfo != null);
        expect(revisionInfo.id).toBe(correctAnswer.id, msg);
        expect(revisionInfo.url).toBe(correctAnswer.url, msg);
      }
    }
  });
});
