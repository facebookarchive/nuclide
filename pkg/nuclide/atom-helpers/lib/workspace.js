'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';

/**
 * @return The path to the JSON file on disk where the workspace state is stored.
 */
export function getPathToWorkspaceState(): string {
  // As you can imagine, the way that we are getting this path is not documented and is therefore
  // unstable.
  // TODO(t8750960): Work with the Atom core team to get a stable API for this.
  return path.join(
    atom.getConfigDirPath(),
    'storage',
    atom.constructor.getStateKey(atom.project.getPaths(), 'editor'),
  );
}
