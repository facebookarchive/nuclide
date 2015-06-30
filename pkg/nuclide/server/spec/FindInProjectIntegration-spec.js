'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var ServiceIntegrationTestHelper = require('./ServiceIntegrationTestHelper');

describe('FindInProjectService-Integration', () => {
  // Strips out port number, hostname, and current file directory.
  function makePortable(jsonObject) {
      return JSON.parse(
        JSON.stringify(jsonObject, null, 2)
          .replace(new RegExp('\/\/localhost:\\d*/*' + __dirname), 'VARIABLE')
      );
  }

  it('can execute a basic search', () => {
    waitsForPromise(async () => {
      // Star the integration test helper.
      var testHelper = new ServiceIntegrationTestHelper('FindInProjectService',
        path.join(__dirname, '../node_modules/nuclide-remote-search/lib/FindInProjectService.js'),
        path.join(__dirname, '../node_modules/nuclide-remote-search/lib/LocalFindInProjectService.js'));
      await testHelper.start();
      var remoteService = testHelper.getRemoteService();

      // Search in the fixtures/basic directory.
      var connection = testHelper.getRemoteConnection();
      var input_dir = path.join(__dirname, 'fixtures', 'basic');
      var uri = connection.getUriOfRemotePath(input_dir);
      var results = await remoteService.search(
        uri,
        /hello world/.source
      );

      // Should equal fixtures/basic.json
      var expected = JSON.parse(fs.readFileSync(input_dir + '.json'));
      expect( makePortable( results ) ).toEqual(expected);
      testHelper.stop();
    });
  });
});
