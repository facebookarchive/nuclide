'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _ServiceTestHelper;

function _load_ServiceTestHelper() {
  return _ServiceTestHelper = _interopRequireDefault(require('../../__mocks__/services/ServiceTestHelper'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

jest.setTimeout(15000);

describe('GrepSearch', () => {
  // Strips out hostname and current file directory.
  function makePortable(jsonObject) {
    // eslint-disable-next-line no-path-concat
    const regex = new RegExp('\\/\\/localhost/*.*__mocks__', 'g');
    return JSON.parse(JSON.stringify(jsonObject, null, 2).replace(regex, 'VARIABLE'));
  }

  it('can execute a basic search', async () => {
    const testHelper = new (_ServiceTestHelper || _load_ServiceTestHelper()).default();

    const FIND_IN_PROJECT_SERVICE_PATH = require.resolve('../../../nuclide-code-search-rpc');

    // Start the integration test helper.
    await testHelper.start([{
      name: 'CodeSearchService',
      definition: FIND_IN_PROJECT_SERVICE_PATH,
      implementation: FIND_IN_PROJECT_SERVICE_PATH
    }]);

    const remoteService = testHelper.getRemoteService('CodeSearchService');

    // Search in the fixtures/basic directory.
    const input_dir = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../__mocks__/services/fixtures/', 'basic');
    const uri = testHelper.getUriOfRemotePath(input_dir);

    // Do search.
    const updates = await remoteService.remoteAtomSearch(uri, /hello world/i, [], false, 'grep').refCount().toArray().toPromise();

    expect(makePortable(updates)).toMatchSnapshot();
    await testHelper.stop();
  });
});