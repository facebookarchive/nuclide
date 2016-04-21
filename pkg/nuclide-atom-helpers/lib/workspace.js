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
import invariant from 'assert';

/**
 * @return The path to the JSON file on disk where the workspace state is stored.
 */
export function getPathToWorkspaceState(): ?string {
  // Atom <1.2 this function exists on `atom.constructor`. Atom >=1.2 it exists on the global `atom`
  // object. Find the appropriate location, and return `null` if both fail unexpectedly.
  const getStateKey = atom.getStateKey || atom.constructor.getStateKey;
  if (typeof getStateKey !== 'function') {
    return null;
  }

  // As you can imagine, the way that we are getting this path is not documented and is therefore
  // unstable.
  // TODO(t8750960): Work with the Atom core team to get a stable API for this.
  return path.join(
    atom.getConfigDirPath(),
    'storage',
    getStateKey(atom.project.getPaths(), 'editor'),
  );
}

export function activatePaneItem(paneItem: Object): void {
  const pane = atom.workspace.paneForItem(paneItem);
  invariant(pane != null);
  pane.activate();
  pane.activateItem(paneItem);
}
