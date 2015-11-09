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
import PathSet from '../lib/PathSet';

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
};

let pathsearch: any = null;

describe('PathSearch', () => {
  beforeEach(() => {
    pathsearch = new PathSearch(
      new PathSet({
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
      const query1 = await pathsearch.doQuery('spec');
      const query2 = await pathsearch.doQuery('spec---');
      const query3 = await pathsearch.doQuery('__s!p$e%c&---');
      expect(query1.results).toEqual(query2.results);
      expect(query1.results).toEqual(query3.results);
    });
  });

  it('treats uppercase and lowercase characters in the query equally.', () => {
    waitsForPromise(async () => {
      const query1 = await pathsearch.doQuery('spec');
      const query2 = await pathsearch.doQuery('SPEC');
      const query3 = await pathsearch.doQuery('sPeC');
      expect(query1.results).toEqual(query2.results);
      expect(query1.results).toEqual(query3.results);
    });
  });

});
