'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import path from 'path';
import {dispatchKeyboardEvent} from './event';
import {copyFixture, copyMercurialFixture, setLocalProject} from './fixtures';
import {activateAllPackages, deactivateAllPackages} from './package-utils';
import {addRemoteProject, startNuclideServer, stopNuclideServer} from './remote-utils';
import {waitsForFile, waitsForFilePosition} from './waitsForFile';

// Smallish, yet realistic testing window dimensions.
const TEST_WINDOW_HEIGHT = 600;
const TEST_WINDOW_WIDTH = 1000;

export function jasmineIntegrationTestSetup(): void {
  // Allow jasmine to interact with the DOM.
  jasmine.attachToDOM(atom.views.getView(atom.workspace));

  // This prevents zombie buck/java processes from hanging the tests
  process.env.NO_BUCKD = '1';

  // Set the testing window dimensions.
  const styleCSS = `
    height: ${TEST_WINDOW_HEIGHT}px;
    width: ${TEST_WINDOW_WIDTH}px;
  `;
  document.querySelector('#jasmine-content').setAttribute('style', styleCSS);

  // Unmock timer functions.
  jasmine.useRealClock();

  // Atom will add its spec directory to the project during tests. The asar
  // hook makes "fs" operations seem like the "spec" dir in "app.asar" is
  // real, but when we attempt to watch it, the operation fails (because
  // it's not a real directory).
  // https://github.com/atom/atom/blob/v1.7.3/spec/spec-helper.coffee#L66
  invariant(typeof process.resourcesPath === 'string');
  const specProjectPath = path.join(process.resourcesPath, 'app.asar/spec');
  invariant(atom.project.getPaths().indexOf(specProjectPath) !== -1);
  atom.project.removePath(specProjectPath);
}

export {
  activateAllPackages,
  addRemoteProject,
  copyFixture,
  copyMercurialFixture,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  setLocalProject,
  startNuclideServer,
  stopNuclideServer,
  waitsForFile,
  waitsForFilePosition,
};
