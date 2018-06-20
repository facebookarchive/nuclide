'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _fs = _interopRequireDefault(require('fs'));

var _outline;

function _load_outline() {
  return _outline = require('../lib/outline');
}

var _nuclideTestHelpers;

function _load_nuclideTestHelpers() {
  return _nuclideTestHelpers = require('../../nuclide-test-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

describe('Python outline', () => {
  it('converts from JSON to outline', () => {
    // Test using a fixture file containing the json representation of
    // the PythonService.getOutline result. We're only testing the conversion
    // of the raw outline to an OutlineTree, without calling the service.
    const outlinePath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/t.json');
    const resultPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures/t_expected_result.json');

    const outlineItems = JSON.parse(_fs.default.readFileSync(outlinePath, 'utf8'));
    const expectedResult = JSON.parse(_fs.default.readFileSync(resultPath, 'utf8'));

    const result = (0, (_outline || _load_outline()).itemsToOutline)('all' /* mode */, outlineItems);
    expect(result).toEqual(expectedResult);
  });
});