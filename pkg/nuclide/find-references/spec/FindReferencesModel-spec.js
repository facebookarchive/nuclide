'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type FindReferencesModelType from '../lib/FindReferencesModel';

const nuclideClient = require('../../client');

// convenience location creator
function loc(line, column) {
  return {line, column};
}

describe('FindReferencesModel', () => {
  let FindReferencesModel: Class<FindReferencesModelType> = (null: any);
  const fakeGrammar = {};

  beforeEach(() => {
    spyOn(atom.grammars, 'selectGrammar').andReturn(fakeGrammar);
    // Create fake file contents.
    spyOn(nuclideClient, 'getFileSystemServiceByNuclideUri').andReturn({
      readFile: async (fileName) => {
        if (fileName === 'bad') {
          throw 'bad file';
        }
        let file = '';
        for (let i = 1; i <= 9; i++) {
          file += i + '\n';
        }
        return file;
      },
    });
    // Have to install the spy before loading this.
    FindReferencesModel = require('../lib/FindReferencesModel');
  });

  it('should group references by file', () => {
    waitsForPromise(async () => {
      const refs = [
        // These should be sorted in the final output.
        {uri: '/test/1', name: 'test1', start: loc(9, 1), end: loc(10, 1)},
        {uri: '/test/1', name: 'test1', start: loc(1, 1), end: loc(1, 1)},
        {uri: '/test/2', name: 'test2', start: loc(2, 1), end: loc(2, 1)},
      ];
      const model = new FindReferencesModel('/test', 'testFunction', refs);
      expect(model.getReferenceCount()).toEqual(3);
      expect(model.getFileCount()).toEqual(2);

      const result = await model.getFileReferences(0, 100);
      // Note the 1 line of context in the previews (but make sure it doesn't overflow)
      const expectedResult = [
        {
          uri: '/test/1',
          grammar: fakeGrammar,
          previewText: ['1\n2', '8\n9'],
          refGroups: [
            {references: [refs[1]], startLine: 1, endLine: 2},
            {references: [refs[0]], startLine: 8, endLine: 9},
          ],
        },
        {
          uri: '/test/2',
          grammar: fakeGrammar,
          previewText: ['1\n2\n3'],
          refGroups: [
            {references: [refs[2]], startLine: 1, endLine: 3},
          ],
        },
      ];
      expect(result).toEqual(expectedResult);

      // It should also work if we fetch each one separately.
      const res1 = await model.getFileReferences(0, 1);
      const res2 = await model.getFileReferences(1, 1);
      expect(res1.concat(res2)).toEqual(expectedResult);
    });
  });

  it('should group overlapping references', () => {
    waitsForPromise(async () => {
      // Adjacent blocks (including context) should get merged into a single group.
      const refs = [
        {uri: '/test/1', name: 'test1', start: loc(1, 1), end: loc(1, 1)},
        {uri: '/test/1', name: 'test1', start: loc(2, 1), end: loc(2, 1)},
        {uri: '/test/1', name: 'test1', start: loc(4, 1), end: loc(4, 1)},
        {uri: '/test/1', name: 'test1', start: loc(7, 1), end: loc(7, 1)},
        {uri: '/test/1', name: 'test1', start: loc(8, 1), end: loc(8, 1)},
        // and overlapping ranges
        {uri: '/test/2', name: 'test2', start: loc(1, 1), end: loc(4, 1)},
        {uri: '/test/2', name: 'test2', start: loc(2, 1), end: loc(3, 1)},
        // ignore duplicates
        {uri: '/test/1', name: 'dupe!', start: loc(1, 1), end: loc(1, 1)},
      ];
      const model = new FindReferencesModel('/test', 'testFunction', refs);
      expect(model.getReferenceCount()).toEqual(7);
      expect(model.getFileCount()).toEqual(2);

      const result = await model.getFileReferences(0, 100);
      expect(result).toEqual([
        {
          uri: '/test/1',
          grammar: fakeGrammar,
          previewText: ['1\n2\n3\n4\n5', '6\n7\n8\n9'],
          refGroups: [
            {references: refs.slice(0, 3), startLine: 1, endLine: 5},
            {references: refs.slice(3, 5), startLine: 6, endLine: 9},
          ],
        },
        {
          uri: '/test/2',
          grammar: fakeGrammar,
          previewText: ['1\n2\n3\n4\n5'],
          refGroups: [
            {references: refs.slice(5, 7), startLine: 1, endLine: 5},
          ],
        },
      ]);
    });
  });

  it('should hide bad files', () => {
    waitsForPromise(async () => {
      const refs = [
        {uri: '/test/1', name: 'test1', start: loc(1, 1), end: loc(1, 1)},
        {uri: 'bad', name: 'bad', start: loc(2, 1), end: loc(2, 1)},
      ];
      const model = new FindReferencesModel('/test', 'testFunction', refs);
      expect(model.getReferenceCount()).toEqual(2);
      expect(model.getFileCount()).toEqual(2);

      const result = await model.getFileReferences(0, 100);
      // Bad file should be silently hidden.
      expect(result).toEqual([
        {
          uri: '/test/1',
          grammar: fakeGrammar,
          previewText: ['1\n2'],
          refGroups: [{references: [refs[0]], startLine: 1, endLine: 2}],
        },
      ]);
    });
  });

});
