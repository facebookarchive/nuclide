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

import type {Store} from '../redux/types';

import * as Actions from '../lib/redux/Actions';
import path from 'path';
import invariant from 'assert';
import registerCommands from '../lib/registerCommands';

export const setup = (store: Store) => {
  const fixturesPath = path.resolve(__dirname, './fixtures');
  atom.project.setPaths([fixturesPath]);
  store.dispatch(Actions.updateRootDirectories());
  const workspaceElement = atom.views.getView(atom.workspace);
  // Attach the workspace to the DOM so focus can be determined in tests below.
  const testContainer = document.createElement('div');
  invariant(document.body);
  document.body.appendChild(testContainer);
  testContainer.appendChild(workspaceElement);
  // console.log(document.body.innerHTML);
  registerCommands(store);
};
