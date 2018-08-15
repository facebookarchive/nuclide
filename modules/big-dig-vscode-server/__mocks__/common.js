"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFileHierarchy = createFileHierarchy;

var pathModule = _interopRequireWildcard(require("path"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * Creates the given directories and files.
 * @return the filesystem, but with names mapped to absolute paths.
 */
async function createFileHierarchy(filesystem, base) {
  const result = {
    toString() {
      return base;
    }

  };
  await (0, _promise().asyncLimit)(Object.keys(filesystem), 100, async name => {
    const absName = pathModule.join(base, name);
    const value = filesystem[name];

    if (typeof value === 'string') {
      await _fsPromise().default.writeFile(absName, value);
      result[name] = absName;
    } else {
      await _fsPromise().default.mkdir(absName);
      const dir = await createFileHierarchy(value, absName);
      result[name] = dir;
    }
  });
  return result;
}