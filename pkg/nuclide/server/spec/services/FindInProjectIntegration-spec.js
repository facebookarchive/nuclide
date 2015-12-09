'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import {addMatchers} from '../../../test-helpers';
import path from 'path';
import ServiceTestHelper from './ServiceTestHelper';

describe('FindInProjectService-Integration', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  // Strips out port number, hostname, and current file directory.
  function makePortable(jsonObject) {
    return JSON.parse(
        JSON.stringify(jsonObject, null, 2)
          .replace(new RegExp('\/\/localhost:\\d*/*' + __dirname, 'g'), 'VARIABLE')
      );
  }

  it('can execute a basic search', () => {
    const testHelper = new ServiceTestHelper();

    waitsForPromise(async () => {
      // Start the integration test helper.
      await testHelper.start([{
        name: 'FindInProjectService',
        definition: '../../../remote-search/lib/FindInProjectService.def',
        implementation: '../../../remote-search/lib/FindInProjectService.js',
      }]);

      const remoteService = testHelper.getRemoteService(
        'FindInProjectService',
        '../../../remote-search/lib/FindInProjectService.def');

      // Search in the fixtures/basic directory.
      const connection = testHelper.getRemoteConnection();
      const input_dir = path.join(__dirname, 'fixtures', 'basic');
      const uri = connection.getUriOfRemotePath(input_dir);

      // Do search.
      const updates = await remoteService.findInProjectSearch(uri,
        /hello world/i, []).toArray().toPromise();

      const expected = JSON.parse(fs.readFileSync(input_dir + '.json'));
      expect(makePortable(updates)).diffJson(expected);
      testHelper.stop();
    });
  });
});
