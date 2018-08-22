"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Package = void 0;

var path = _interopRequireWildcard(require("path"));

function _resolveFrom() {
  const data = _interopRequireDefault(require("resolve-from"));

  _resolveFrom = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../nuclide-commons/promise");

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
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const ASYNC_LIMIT = 100;
/**
 * The parts of `package.json` that we use.
 */

/**
 * Reads a `package.json` file.
 */
async function loadPackage(pkgPath) {
  const pkg = await _fsPromise().default.readFile(pkgPath, 'utf8');
  return JSON.parse(pkg);
}
/**
 * Represents a module's "package". Contains methods to traverse its dependencies.
 */


class Package {
  constructor(info, packageRoot) {
    this.info = info;
    this.root = packageRoot;
  }
  /**
   * Loads package `name`, corresponding to the module that `require(name)` loads when run from a
   * file in `fromDir`.
   */


  static async from(fromDir, name) {
    const pkgPath = (0, _resolveFrom().default)(fromDir, path.join(name, 'package.json'));
    const root = path.dirname(pkgPath);
    const pkg = await loadPackage(pkgPath);
    return new Package(pkg, root);
  }

  getPackageFile() {
    return path.join(this.root, 'package.json');
  }
  /**
   * Finds the package for module `name` w.r.t this package.
   */


  async child(name) {
    return Package.from(this.root, name);
  }
  /**
   * @return All immediate "child" packages that this depends on.
   */


  dependencies() {
    const deps = Object.keys(this.info.dependencies || {});
    return (0, _promise().asyncLimit)(deps, ASYNC_LIMIT, name => this.child(name));
  }
  /**
   * @return All "child" (and subchild) packages that this depends on.
   */


  async allDependencies() {
    const deps = new Map();
    await this._allDependencies(deps);
    return Array.from(deps.values());
  }

  async _allDependencies(traversed) {
    const deps = Object.keys(this.info.dependencies || {}).filter(dep => !traversed.has((0, _resolveFrom().default)(this.root, dep)));
    const children = await (0, _promise().asyncLimit)(deps, ASYNC_LIMIT, name => this.child(name));
    children.forEach(child => traversed.set(child.root, child));
    await (0, _promise().asyncLimit)(children, ASYNC_LIMIT, child => child._allDependencies(traversed));
  }

}

exports.Package = Package;