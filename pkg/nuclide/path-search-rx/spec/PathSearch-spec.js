'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import PathSearch from '../lib/PathSearch';
import LazyPathSet from '../lib/LazyPathSet';

const PATHS_FIXTURE = {
  '.babelrc': true,
  '.flowconfig': true,
  'lib/FileSearch.js': true,
  'lib/main.js': true,
  'lib/PathSearch.js': true,
  'lib/PathSet.js': true,
  'lib/PathSetFactory.js': true,
  'lib/PathSetUpdater.js': true,
  'lib/QueryItem.js': true,
  'lib/QueryScore.js': true,
  'lib/TopScores.js': true,
  'lib/utils.js': true,
  'package.json': true,
  'spec/FileSearch-spec.js': true,
  'spec/PathSearch-spec.js': true,
  'spec/PathSet-spec.js': true,
  'spec/PathSetFactory-spec.js': true,
  'spec/PathSetUpdater-spec.js': true,
  'spec/QueryItem-spec.js': true,
  'spec/TopScores-spec.js': true,
  'spec/utils-spec.js': true,
  'some/path/test.js': true,
  'some/longer/path/test.js': true,
  'some/even/longer/path/test.js': true,
};

let pathsearch: any = null;

// TODO jxg clean up or reenable (t9699370)
xdescribe('PathSearch', () => {
  beforeEach(() => {
    pathsearch = new PathSearch(
      new LazyPathSet({
        paths: {...PATHS_FIXTURE},
      })
    );
  });

  it('returns no results for empty queries.', () => {
    waitsForPromise(async () => {
      const query = await pathsearch.doQuery('');
      expect(query.results.length).toEqual(0);
    });
  });

  it('ignores non-alphanumeric characters in the query.', () => {
    waitsForPromise(async () => {
      const [
        query1,
        query2,
        query3,
      ] = await Promise.all([
        pathsearch.doQuery('spec'),
        pathsearch.doQuery('spec---'),
        pathsearch.doQuery('__s!p$e%c&---'),
      ]);
      expect(query1.results).toEqual(query2.results);
      expect(query1.results).toEqual(query3.results);
    });
  });

  it('treats uppercase and lowercase characters in the query equally.', () => {
    waitsForPromise(async () => {
      const [
        query1,
        query2,
        query3,
      ] = await Promise.all([
        pathsearch.doQuery('spec'),
        pathsearch.doQuery('SPEC'),
        pathsearch.doQuery('sPeC'),
      ]);
      expect(query1.results).toEqual(query2.results);
      expect(query1.results).toEqual(query3.results);
    });
  });

  it('matches paths directly when queries contain a slash', () => {
    waitsForPromise(async () => {
      const [
        query1,
        query2,
        query3,
      ] = await Promise.all([
        pathsearch.doQuery('some/'),
        pathsearch.doQuery('longer/path'),
        pathsearch.doQuery('even/longer/path'),
      ]);
      expect(query1.results.length).toEqual(3);
      expect(query2.results.length).toEqual(2);
      expect(query3.results.length).toEqual(1);
    });
  });

  it('matches subpaths in the query until results are found', () => {
    waitsForPromise(async () => {
      const [
        query1,
        query2,
        query3,
        query4,
      ] = await Promise.all([
        pathsearch.doQuery('/Users/test/some/even/longer/path'),
        pathsearch.doQuery('test/some/even/longer/path'),
        pathsearch.doQuery('/some/even/longer/path'),
        pathsearch.doQuery('some/even/longer/path'),
      ]);

      expect(query1.results).toEqual(query2.results);
      expect(query2.results).toEqual(query3.results);
      expect(query3.results).toEqual(query4.results);
    });
  });

});
