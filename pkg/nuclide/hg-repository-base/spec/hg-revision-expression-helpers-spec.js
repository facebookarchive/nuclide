'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {expressionForRevisionsBeforeHead} = require('../lib/hg-revision-expression-helpers');

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
});
