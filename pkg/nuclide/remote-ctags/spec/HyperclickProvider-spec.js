'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CtagsResult} from '../../remote-ctags-base';

import invariant from 'assert';
import {Range} from 'atom';
import nuclideRemoteConnection from '../../remote-connection';
import atomHelpers from '../../atom-helpers';
import {HyperclickProvider} from '../lib/HyperclickProvider';

const fakeEditor: atom$TextEditor = ({
  getPath() {
    return '/path1/path2/file';
  },
}: any);

describe('HyperclickProvider', () => {
  let findTagsResult: Array<CtagsResult> = [];
  let hyperclickProvider: HyperclickProvider = (null: any);
  beforeEach(() => {
    // HACK: goToLocation is a getter. Not too easy to mock out :(
    delete atomHelpers.goToLocation;
    atomHelpers.goToLocation = jasmine.createSpy('goToLocation');

    // Mock the services we use.
    spyOn(nuclideRemoteConnection, 'getServiceByNuclideUri').andCallFake(service => {
      if (service === 'FileSystemService') {
        return {
          readFile() {
            return new Buffer('function A\ntest\nclass A\n');
          },
        };
      } else if (service === 'CtagsService') {
        return {
          getCtagsService() {
            return {
              async getTagsPath() {
                return '/tags';
              },
              async findTags(path, query) {
                return findTagsResult;
              },
              dispose() {},
            };
          },
        };
      } else {
        throw new Error('Unexpected service call');
      }
    });

    hyperclickProvider = new HyperclickProvider();
  });

  it('works with multiple tag results', () => {
    waitsForPromise(async () => {
      findTagsResult = [
        {
          name: 'A',
          file: '/path1/a',
          lineNumber: 0,
          kind: 'c',
          pattern: '/^class A$/',
        },
        {
          name: 'A',
          file: '/test/a',
          lineNumber: 0,
          kind: '',
          pattern: '/^struct A$/',
          fields: new Map([['namespace', 'test']]),
        },
        {
          name: 'A',
          file: '/path1/path2/a.py',
          kind: 'f',
          lineNumber: 1337,
          pattern: '/function A/',
          fields: new Map([['class', 'class']]),
        },
      ];

      const result = await hyperclickProvider.getSuggestionForWord(
        fakeEditor,
        'A',
        new Range([0, 0], [0, 1]),
      );
      invariant(result);

      // Note the ordering (by matching path prefix).
      expect(result.callback instanceof Array).toBe(true);
      expect(result.callback[0].title).toBe('function class.A (path1/path2/a.py)');
      expect(result.callback[1].title).toBe('class A (path1/a)');
      expect(result.callback[2].title).toBe('test::A (test/a)');

      // Blindly use line numbers, if they're given.
      await result.callback[0].callback();
      expect(atomHelpers.goToLocation).toHaveBeenCalledWith('/path1/path2/a.py', 1336, 0);

      // Find the line by pattern, in other cases.
      await result.callback[1].callback();
      expect(atomHelpers.goToLocation).toHaveBeenCalledWith('/path1/a', 2, 0);

      // Default to the first line, if it's not actually in the file any more.
      await result.callback[2].callback();
      expect(atomHelpers.goToLocation).toHaveBeenCalledWith('/test/a', 0, 0);
    });
  });

  it('directly jumps for single results', () => {
    waitsForPromise(async () => {
      findTagsResult = [
        {
          name: 'test',
          file: '/test',
          kind: 'class',
          lineNumber: 0,
          pattern: '/^test$/',
        },
      ];

      const result = await hyperclickProvider.getSuggestionForWord(
        fakeEditor,
        'test',
        new Range([0, 0], [0, 1]),
      );
      invariant(result);

      expect(result.callback instanceof Function).toBe(true);
      /* $FlowIssue: Flow can't resolve the union type here */
      await result.callback();
      expect(atomHelpers.goToLocation).toHaveBeenCalledWith('/test', 1, 0);
    });
  });

  it('returns null for no results', () => {
    waitsForPromise(async () => {
      findTagsResult = [];
      const result = await hyperclickProvider.getSuggestionForWord(
        fakeEditor,
        'test',
        new Range([0, 0], [0, 1]),
      );
      expect(result).toBe(null);
    });
  });
});
