/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import * as path from 'path';
import resolveFrom from 'resolve-from';
import fs from 'nuclide-commons/fsPromise';
import {asyncLimit} from 'nuclide-commons/promise';

const ASYNC_LIMIT = 100;

/**
 * The parts of `package.json` that we use.
 */
export type PackageInfo = {
  name: string,
  version: string,
  dependencies?: {[id: string]: string},
  devDependencies?: {[id: string]: string},
  files?: Array<string>,
};

/**
 * Reads a `package.json` file.
 */
async function loadPackage(pkgPath: string): Promise<PackageInfo> {
  const pkg = await fs.readFile(pkgPath, 'utf8');
  return JSON.parse(pkg);
}

/**
 * Represents a module's "package". Contains methods to traverse its dependencies.
 */
export class Package {
  info: PackageInfo;
  root: string;

  constructor(info: PackageInfo, packageRoot: string) {
    this.info = info;
    this.root = packageRoot;
  }

  /**
   * Loads package `name`, corresponding to the module that `require(name)` loads when run from a
   * file in `fromDir`.
   */
  static async from(fromDir: string, name: string): Promise<Package> {
    const pkgPath = resolveFrom(fromDir, path.join(name, 'package.json'));
    const root = path.dirname(pkgPath);
    const pkg = await loadPackage(pkgPath);
    return new Package(pkg, root);
  }

  getPackageFile(): string {
    return path.join(this.root, 'package.json');
  }

  /**
   * Finds the package for module `name` w.r.t this package.
   */
  async child(name: string): Promise<Package> {
    return Package.from(this.root, name);
  }

  /**
   * @return All immediate "child" packages that this depends on.
   */
  dependencies(): Promise<Array<Package>> {
    const deps = Object.keys(this.info.dependencies || {});
    return asyncLimit(deps, ASYNC_LIMIT, name => this.child(name));
  }

  /**
   * @return All "child" (and subchild) packages that this depends on.
   */
  async allDependencies(): Promise<Array<Package>> {
    const deps = new Map();
    await this._allDependencies(deps);
    return Array.from(deps.values());
  }

  async _allDependencies(traversed: Map<string, Package>): Promise<void> {
    const deps = Object.keys(this.info.dependencies || {}).filter(
      dep => !traversed.has(resolveFrom(this.root, dep)),
    );
    const children = await asyncLimit(deps, ASYNC_LIMIT, name =>
      this.child(name),
    );
    children.forEach(child => traversed.set(child.root, child));
    await asyncLimit(children, ASYNC_LIMIT, child =>
      child._allDependencies(traversed),
    );
  }
}
