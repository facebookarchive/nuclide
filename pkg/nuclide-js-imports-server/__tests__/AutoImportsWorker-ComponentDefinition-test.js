'use strict';

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
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

jest.mock('../../commons-node/passesGK');

// $FlowFixMe Jest doesn't have a type safe way to do this.
(_passesGK || _load_passesGK()).default.mockImplementation(async () => true);

const { getExportsForFile } = require('../src/lib/AutoImportsWorker');

describe('getExportsForFile component definitions', () => {
  it('gets the component definition for a React component', async () => {
    const path = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..', '__mocks__', 'componentDefinitions', 'FDSTest.js');
    const exportUpdate = await getExportsForFile(path, {
      isHaste: false,
      useNameReducers: false,
      nameReducers: [],
      nameReducerWhitelist: [],
      nameReducerBlacklist: []
    });
    expect(exportUpdate).toBeTruthy();

    if (!(exportUpdate != null)) {
      throw new Error('Invariant violation: "exportUpdate != null"');
    }

    expect(exportUpdate.componentDefinition).toBeTruthy();

    if (!exportUpdate.componentDefinition) {
      throw new Error('Invariant violation: "exportUpdate.componentDefinition"');
    }

    expect(exportUpdate.componentDefinition.name).toBe('FDSTest');

    if (!exportUpdate.componentDefinition) {
      throw new Error('Invariant violation: "exportUpdate.componentDefinition"');
    }

    expect(exportUpdate.componentDefinition.requiredProps.length).toBeGreaterThan(0);
  });
});