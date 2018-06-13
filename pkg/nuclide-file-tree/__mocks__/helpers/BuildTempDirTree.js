'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildTempDirTree = buildTempDirTree;

var _promise;

function _load_promise() {
  return _promise = require('../../../../modules/nuclide-commons/promise');
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _fsPlus;

function _load_fsPlus() {
  return _fsPlus = require('fs-plus');
}

var _touch;

function _load_touch() {
  return _touch = _interopRequireDefault(require('touch'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
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

(_temp || _load_temp()).default.track();
const tempMkDir = (0, (_promise || _load_promise()).denodeify)((_temp || _load_temp()).default.mkdir);

const mkdir = (0, (_promise || _load_promise()).denodeify)((_fsPlus || _load_fsPlus()).makeTree);

const touch = (0, (_promise || _load_promise()).denodeify)((_touch || _load_touch()).default);

async function buildTempDirTree(...paths) {
  const rootPath = await tempMkDir('/');
  const fileMap = new Map();

  for (let i = 0; i < paths.length; i++) {
    const pathItem = paths[i];
    const arrPathItemParts = (_nuclideUri || _load_nuclideUri()).default.split(pathItem);
    const itemGlobalDirPath = (_nuclideUri || _load_nuclideUri()).default.join(rootPath, ...arrPathItemParts.slice(0, -1));
    const itemLocalFileName = arrPathItemParts[arrPathItemParts.length - 1];

    // eslint-disable-next-line no-await-in-loop
    await mkdir(itemGlobalDirPath);
    if (itemLocalFileName) {
      // eslint-disable-next-line no-await-in-loop
      await touch((_nuclideUri || _load_nuclideUri()).default.join(itemGlobalDirPath, itemLocalFileName));
    }

    arrPathItemParts.forEach((val, j) => {
      let prefixNodePath = (_nuclideUri || _load_nuclideUri()).default.join(rootPath, ...arrPathItemParts.slice(0, j + 1));
      if (j < arrPathItemParts.length - 1 || (_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(val)) {
        prefixNodePath = (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(prefixNodePath);
      }

      fileMap.set((_nuclideUri || _load_nuclideUri()).default.join(...arrPathItemParts.slice(0, j + 1)), prefixNodePath);
    });
  }

  return fileMap;
}