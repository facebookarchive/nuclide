"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
// eslint-disable-next-line
const {
  getExportsForFile
} = require("../src/lib/AutoImportsWorker");

describe('getExportsForFile component definitions', () => {
  beforeEach(() => {
    process.env.JS_IMPORTS_INITIALIZATION_SETTINGS = JSON.stringify({
      componentModulePathFilter: null,
      uiComponentToolsIndexingGkEnabled: true
    });
  });
  it('gets the component definition for a React component', async () => {
    const path = _nuclideUri().default.join(__dirname, '..', '__mocks__', 'componentDefinitions', 'FDSTest.react.js');

    const exportUpdate = await getExportsForFile(path, {
      isHaste: false,
      useNameReducers: false,
      nameReducers: [],
      nameReducerWhitelist: [],
      nameReducerBlacklist: []
    });
    expect(exportUpdate).toBeTruthy();

    if (!(exportUpdate != null)) {
      throw new Error("Invariant violation: \"exportUpdate != null\"");
    }

    expect(exportUpdate.componentDefinition).toBeTruthy();

    if (!exportUpdate.componentDefinition) {
      throw new Error("Invariant violation: \"exportUpdate.componentDefinition\"");
    }

    expect(exportUpdate.componentDefinition.name).toBe('FDSTest');

    if (!exportUpdate.componentDefinition) {
      throw new Error("Invariant violation: \"exportUpdate.componentDefinition\"");
    }

    expect(exportUpdate.componentDefinition.requiredProps.length).toBeGreaterThan(0);
  });
});