"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildTempDirTree = buildTempDirTree;

function _promise() {
  const data = require("../../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _fsPlus() {
  const data = require("fs-plus");

  _fsPlus = function () {
    return data;
  };

  return data;
}

function _touch() {
  const data = _interopRequireDefault(require("touch"));

  _touch = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

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
 * 
 * @format
 */
_temp().default.track();

const tempMkDir = (0, _promise().denodeify)(_temp().default.mkdir);
const mkdir = (0, _promise().denodeify)(_fsPlus().makeTree); // eslint-disable-next-line nuclide-internal/no-unresolved

const touch = (0, _promise().denodeify)(_touch().default);

async function buildTempDirTree(...paths) {
  const rootPath = await tempMkDir('/');
  const fileMap = new Map();

  for (let i = 0; i < paths.length; i++) {
    const pathItem = paths[i];

    const arrPathItemParts = _nuclideUri().default.split(pathItem);

    const itemGlobalDirPath = _nuclideUri().default.join(rootPath, ...arrPathItemParts.slice(0, -1));

    const itemLocalFileName = arrPathItemParts[arrPathItemParts.length - 1]; // eslint-disable-next-line no-await-in-loop

    await mkdir(itemGlobalDirPath);

    if (itemLocalFileName) {
      // eslint-disable-next-line no-await-in-loop
      await touch(_nuclideUri().default.join(itemGlobalDirPath, itemLocalFileName));
    }

    arrPathItemParts.forEach((val, j) => {
      let prefixNodePath = _nuclideUri().default.join(rootPath, ...arrPathItemParts.slice(0, j + 1));

      if (j < arrPathItemParts.length - 1 || _nuclideUri().default.endsWithSeparator(val)) {
        prefixNodePath = _nuclideUri().default.ensureTrailingSeparator(prefixNodePath);
      }

      fileMap.set(_nuclideUri().default.join(...arrPathItemParts.slice(0, j + 1)), prefixNodePath);
    });
  }

  return fileMap;
}