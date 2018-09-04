"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _a_file_search_should() {
  const data = require("../__mocks__/a_file_search_should");

  _a_file_search_should = function () {
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
jest.setTimeout(30000);

async function hgTestFolder() {
  const folder = await (0, _a_file_search_should().createTestFolder)();
  await (0, _process().runCommand)('hg', ['init'], {
    cwd: folder
  }).toPromise();
  await (0, _process().runCommand)('hg', ['addremove'], {
    cwd: folder
  }).toPromise(); // After adding the existing files to hg, add an ignored file to
  // prove we're using hg to populate the list.

  const ignoredFile = 'ignored';

  _fs.default.writeFileSync(_nuclideUri().default.join(folder, ignoredFile), '');

  _fs.default.writeFileSync(_nuclideUri().default.join(folder, '.hgignore'), `.hgignore\n${ignoredFile}`);

  return folder;
}

(0, _a_file_search_should().aFileSearchShould)('Mercurial', hgTestFolder);