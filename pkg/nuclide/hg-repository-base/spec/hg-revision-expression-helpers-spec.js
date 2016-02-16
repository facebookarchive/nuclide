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
  parseBookmarksOutput,
  INFO_REV_END_MARK,
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
      const commit1Description =
`Commit 1 'title'.
Continue Commit 1 message.`;
    const commit2Description =
`Commit 2 'title'.

Still, multi-line commit 2 message

Test Plan: complete`;
      const revisionsString =
`id:124
title:Commit 1 'title'.
author:Author Name<auth_2_alias@domain.com>
date:2015-10-15 16:03 -0700
hash:a343fb3
${commit1Description}
${INFO_REV_END_MARK}
id:123
title:Commit 2 'title'.
author:Author Name<auth_2_alias@domain.com>
date:2015-10-15 16:02 -0700
hash:a343fb2
${commit2Description}
${INFO_REV_END_MARK}
`;
      expect(parseRevisionInfoOutput(revisionsString)).toEqual([
        {
          id: 124,
          title: `Commit 1 'title'.`,
          author: 'Author Name<auth_2_alias@domain.com>',
          hash: 'a343fb3',
          bookmarks: [],
          date: new Date('2015-10-15 16:03 -0700'),
          description: commit1Description,
        },
        {
          id: 123,
          title: `Commit 2 'title'.`,
          author: 'Author Name<auth_2_alias@domain.com>',
          hash: 'a343fb2',
          bookmarks: [],
          date: new Date('2015-10-15 16:02 -0700'),
          description: commit2Description,
        },
      ]);
    });

    it('skips an entry if invalid - should never happen', () => {
      expect(parseRevisionInfoOutput(`revision:123`)).toEqual([]);
    });
  });

  describe('parseBookmarksOutput', () => {
    it('returns the parsed revision info if is valid.', () => {
      const bookmarksString =
`invalid bookmark line (never happens)
   dv-ws            849619:a7211db98af0
 * dv-timeline            849620:a7211db98af1
   dv-timeline-2            849620:a7211db98af1
`;

      const commitsToBookmarks = parseBookmarksOutput(bookmarksString);
      expect(commitsToBookmarks.size).toBe(2);
      expect(commitsToBookmarks.get(849619)).toEqual(['dv-ws']);
      expect(commitsToBookmarks.get(849620)).toEqual(['dv-timeline', 'dv-timeline-2']);
    });
  });
});
