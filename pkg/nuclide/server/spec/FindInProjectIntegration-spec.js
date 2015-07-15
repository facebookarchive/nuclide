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
          .replace(new RegExp('\/\/localhost:\\d*/*' + __dirname, 'g'), 'VARIABLE')
      );
  }

  it('can execute a basic search', () => {
    var testHelper = new ServiceIntegrationTestHelper('FindInProjectService',
      path.join(__dirname, '../node_modules/nuclide-remote-search/lib/FindInProjectService.js'),
      path.join(__dirname, '../node_modules/nuclide-remote-search/lib/LocalFindInProjectService.js'));

    waitsForPromise(async () => {
      // Start the integration test helper.
      await testHelper.start();
      return new Promise((resolve, reject) => {
        var remoteService = testHelper.getRemoteService();

        // Search in the fixtures/basic directory.
        var connection = testHelper.getRemoteConnection();
        var input_dir = path.join(__dirname, 'fixtures', 'basic');
        var uri = connection.getUriOfRemotePath(input_dir);

        // Capture onUpdate messages.
        var updates = [];
        var updateDisposable = remoteService.onMatchesUpdate((requestId, update) => updates.push(update));

        // OnCompletion event handler.
        var myRequest = null, completedRequest = null;
        var onCompleted = requestId => {
          completedRequest = requestId;

          var complete = myRequest && completedRequest && myRequest === completedRequest;
          if (complete) { // If all searches are complete.
            // Should equal fixtures/basic.json.
            var expected = JSON.parse(fs.readFileSync(input_dir + '.json'));
            expect( makePortable( { myRequest, updates } ) ).toEqual(expected);
            testHelper.stop();

            updateDisposable.dispose();
            completedDisposable.dispose();

            // Resolve the promise.
            resolve();
          }
        };
        var completedDisposable = remoteService.onSearchCompleted(onCompleted);

        // Start seach.
        remoteService.search(uri, /hello world/.source, false, []).then(id => { myRequest = id; });
      });
    });
  });
});
