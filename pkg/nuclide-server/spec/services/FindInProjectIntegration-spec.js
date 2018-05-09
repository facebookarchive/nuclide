/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import fs from 'fs';
import {addMatchers} from '../../../nuclide-test-helpers';
import nuclideUri from 'nuclide-commons/nuclideUri';
import ServiceTestHelper from './ServiceTestHelper';

describe('GrepSearch', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  // Strips out hostname and current file directory.
  function makePortable(jsonObject) {
    // eslint-disable-next-line no-path-concat
    const regex = new RegExp('\\/\\/localhost/*' + __dirname, 'g');
    return JSON.parse(
      JSON.stringify(jsonObject, null, 2).replace(regex, 'VARIABLE'),
    );
  }

  it('can execute a basic search', () => {
    const testHelper = new ServiceTestHelper();

    waitsForPromise(async () => {
      const FIND_IN_PROJECT_SERVICE_PATH = require.resolve(
        '../../../nuclide-code-search-rpc',
      );

      // Start the integration test helper.
      await testHelper.start([
        {
          name: 'CodeSearchService',
          definition: FIND_IN_PROJECT_SERVICE_PATH,
          implementation: FIND_IN_PROJECT_SERVICE_PATH,
        },
      ]);

      const remoteService = testHelper.getRemoteService('CodeSearchService');

      // Search in the fixtures/basic directory.
      const input_dir = nuclideUri.join(__dirname, 'fixtures', 'basic');
      const uri = testHelper.getUriOfRemotePath(input_dir);

      // Do search.
      const updates = await remoteService
        .remoteAtomSearch(uri, /hello world/i, [], false, 'grep')
        .refCount()
        .toArray()
        .toPromise();

      const expected = JSON.parse(
        fs.readFileSync(input_dir + '.json', {encoding: 'utf8'}),
      );
      expect(makePortable(updates)).diffJson(expected);
      testHelper.stop();
    });
  });
});
