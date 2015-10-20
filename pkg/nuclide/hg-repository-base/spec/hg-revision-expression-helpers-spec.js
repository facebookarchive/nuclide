'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  expressionForRevisionsBeforeHead,
  parseRevisionInfoOutput,
} from '../lib/hg-revision-expression-helpers';

describe('hg-revision-expression-helpers', () => {
  describe('expressionForRevisionsBeforeHead', () => {
    it('returns a correct expression <= 0 revisions before head.', () => {
      expect(expressionForRevisionsBeforeHead(0)).toBe('.');
      expect(expressionForRevisionsBeforeHead(-2)).toBe('.');
    });

    it('returns a correct expression for > 0 revisions before head.', () => {
      expect(expressionForRevisionsBeforeHead(3)).toBe('.~3');
    });
  });

  describe('parseRevisionInfoOutput', () => {
    it('returns the parsed revision info if is valid.', () => {
      const revisionsString = `revision:124
title:Commit 1 'title'.
author:Author Name<auth_2_alias@domain.com>
date:2015-10-15 16:03 -0700

revision:123
title:Commit 2 'title'.
author:Author Name<auth_2_alias@domain.com>
date:2015-10-15 16:02 -0700
`;
      expect(parseRevisionInfoOutput(revisionsString)).toEqual([
        {
          id: 124,
          title: `Commit 1 'title'.`,
          author: 'Author Name<auth_2_alias@domain.com>',
          date: '2015-10-15 16:03 -0700',
        },
        {
          id: 123,
          title: `Commit 2 'title'.`,
          author: 'Author Name<auth_2_alias@domain.com>',
          date: '2015-10-15 16:02 -0700',
        },
      ]);
    });

    it('skips an entry if invalid - should never happen', () => {
      expect(parseRevisionInfoOutput(`revision:123`)).toEqual([]);
    });
  });
});
