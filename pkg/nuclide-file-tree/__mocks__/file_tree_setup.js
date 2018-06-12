/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

/* eslint-disable nuclide-internal/prefer-nuclide-uri */

import path from 'path';
import invariant from 'assert';
import FileSystemActions from '../lib/FileSystemActions';
import FileTreeActions from '../lib/FileTreeActions';
import registerCommands from '../lib/registerCommands';
import FileTreeStore from '../lib/FileTreeStore';

export const setup = (store: FileTreeStore, actions: FileTreeActions) => {
  const fixturesPath = path.resolve(__dirname, './fixtures');
  atom.project.setPaths([fixturesPath]);
  actions.updateRootDirectories();
  const workspaceElement = atom.views.getView(atom.workspace);
  // Attach the workspace to the DOM so focus can be determined in tests below.
  const testContainer = document.createElement('div');
  invariant(document.body);
  document.body.appendChild(testContainer);
  testContainer.appendChild(workspaceElement);
  // console.log(document.body.innerHTML);
  const fileSystemActions = new FileSystemActions(store);
  registerCommands(store, actions, fileSystemActions);
};
