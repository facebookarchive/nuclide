'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import semver from 'semver';

function isVersionOrLater(packageName: string, version: string): boolean {
  const pkg = atom.packages.getLoadedPackage(packageName);
  if (pkg == null || pkg.metadata == null || pkg.metadata.version == null) {
    return false;
  }
  return semver.gte(pkg.metadata.version, version);
}

export function farEndPriority(priority: number): number {
  if (isVersionOrLater('tool-bar', '0.3.0')) {
    // New versions of the toolbar use negative priority to push icons to the far end.
    return -priority;
  } else {
    // Old ones just use large positive priority.
    return 2000 - priority;
  }
}
