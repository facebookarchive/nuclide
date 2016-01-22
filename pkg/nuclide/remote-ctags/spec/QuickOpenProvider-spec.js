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
import React from 'react-for-atom';
import nuclideRemoteConnection from '../../remote-connection';
import * as hackService from '../../hack-symbol-provider/lib/getHackService';

const {TestUtils} = React.addons;

const TEST_DIR = '/test';

describe('QuickOpenProvider', () => {
  const mockDirectory: atom$Directory = ({
    getPath: () => TEST_DIR,
  }: any);

  let hackSpy;
  let QuickOpenProvider;
  beforeEach(() => {
    spyOn(nuclideRemoteConnection, 'getServiceByNuclideUri').andReturn({
      async getCtagsService() {
        return {
          async findTags(path, query): Promise<Array<CtagsResult>> {
            return [
              {
                name: 'A',
                file: '/path1/a',
                lineNumber: 1,
                kind: 'c',
                pattern: '/^class A$/',
              },
              {
                name: 'test::A',
                file: '/test/a',
                lineNumber: 2,
                kind: '',
                pattern: '/^struct A$/',
              },
            ];
          },
          dispose() {
          },
        };
      },
    });
    hackSpy = spyOn(hackService, 'getHackService').andReturn(null);
    QuickOpenProvider = require('../lib/QuickOpenProvider');
  });

  it('it activates for valid directories', () => {
    waitsForPromise(async () => {
      const {isEligibleForDirectory} = QuickOpenProvider;
      invariant(isEligibleForDirectory);
      expect(await isEligibleForDirectory(mockDirectory)).toBe(true);
    });
  });

  it('is able to return and render tag results', () => {
    waitsForPromise(async () => {
      const {executeQuery, getComponentForItem} = QuickOpenProvider;
      let results = await executeQuery('', mockDirectory);
      expect(results).toEqual([]);

      results = await executeQuery('test', mockDirectory);
      expect(results).toEqual([
        {
          name: 'A',
          file: '/path1/a',
          lineNumber: 1,
          kind: 'c',
          pattern: '/^class A$/',
          path: '/path1/a',
          dir: TEST_DIR,
          line: 0,
        },
        {
          name: 'test::A',
          file: '/test/a',
          lineNumber: 2,
          kind: '',
          pattern: '/^struct A$/',
          path: '/test/a',
          dir: TEST_DIR,
          line: 1,
        },
      ]);

      invariant(getComponentForItem);
      const reactElement = getComponentForItem(results[0]);
      expect(reactElement.props.title).toBe('class');
      const renderedComponent = TestUtils.renderIntoDocument(reactElement);
      const renderedNode = React.findDOMNode(renderedComponent);

      expect(renderedNode.querySelectorAll('.omnisearch-symbol-result-filename').length).toBe(1);
      expect(renderedNode.querySelectorAll('.icon-code').length).toBe(1);
    });
  });

});
