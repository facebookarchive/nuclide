"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _outline() {
  const data = require("../lib/outline");

  _outline = function () {
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
 * 
 * @format
 * @emails oncall+nuclide
 */
describe('Python outline', () => {
  it('converts from JSON to outline', () => {
    // Test using a fixture file containing the json representation of
    // the PythonService.getOutline result. We're only testing the conversion
    // of the raw outline to an OutlineTree, without calling the service.
    const outlinePath = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/t.json');

    const resultPath = _nuclideUri().default.join(__dirname, '../__mocks__/fixtures/t_expected_result.json');

    const outlineItems = JSON.parse(_fs.default.readFileSync(outlinePath, 'utf8'));
    const expectedResult = JSON.parse(_fs.default.readFileSync(resultPath, 'utf8'));
    const result = (0, _outline().itemsToOutline)('all'
    /* mode */
    , outlineItems);
    expect(result).toEqual(expectedResult);
  });
});