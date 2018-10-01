"use strict";

function _a_file_search_should() {
  const data = require("../__mocks__/a_file_search_should");

  _a_file_search_should = function () {
    return data;
  };

  return data;
}

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
jest.setTimeout(30000);
(0, _a_file_search_should().aFileSearchShould)('Vanilla (No VCS)', _a_file_search_should().createTestFolder);