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
import {dispatchKeyboardEvent} from './event';
import {copyFixture, extractTarGzFixture, copyMercurialFixture, setLocalProject} from './fixtures';
import {activateAllPackages, deactivateAllPackages} from './package-utils';
import {addRemoteProject, startNuclideServer, stopNuclideServer} from './remote-utils';
import {waitsForFile, waitsForFilePosition} from './waitsForFile';
import busySignal from './busy-signal';
import {fileTreeHasFinishedLoading, getVisibleEntryFromFileTree} from './fileTree';
import pollFor from './pollFor';

// Smallish, yet realistic testing window dimensions.
const TEST_WINDOW_HEIGHT = 600;
const TEST_WINDOW_WIDTH = 1000;

export function jasmineIntegrationTestSetup(): void {
  // To run remote tests, we have to star the nuclide server. It uses `nohup`, but apparently
  // `nohup` doesn't work from within tmux, so starting the server fails.
  invariant(
    process.env.TMUX == null,
    'ERROR: tmux interferes with remote integration tests -- please run the tests outside of tmux',
  );
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

  // Atom will add the fixtures directory to the project during tests.
  // We'd like to have Atom start with a clean slate.
  // https://github.com/atom/atom/blob/v1.7.3/spec/spec-helper.coffee#L66
  atom.project.setPaths([]);
}

export {
  activateAllPackages,
  addRemoteProject,
  busySignal,
  copyFixture,
  copyMercurialFixture,
  deactivateAllPackages,
  dispatchKeyboardEvent,
  extractTarGzFixture,
  fileTreeHasFinishedLoading,
  getVisibleEntryFromFileTree,
  pollFor,
  setLocalProject,
  startNuclideServer,
  stopNuclideServer,
  waitsForFile,
  waitsForFilePosition,
};
