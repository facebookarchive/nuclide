'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestContext} from './remotable-tests';

import busySignal from './busy-signal-common';
import {copyFixture} from '../../pkg/nuclide-test-helpers';
import {Deferred} from '../../pkg/commons-node/promise';

const FLOW_FIXTURE = 'flow_project_1';
const FLOW_MAIN_FILE = 'main.js';

export function setup(context: TestContext): Promise<atom$TextEditor> {
  const deferred: Deferred<atom$TextEditor> = new Deferred();
  waitsForPromise({timeout: 240000}, async () => {
    const flowProjectPath = await copyFixture(FLOW_FIXTURE, __dirname);

    // Add this directory as an atom project.
    await context.setProject(flowProjectPath);
    // Open a file in the flow project we copied, and get reference to the editor's HTML.
    const editor = await atom.workspace.open(context.getProjectRelativePath(FLOW_MAIN_FILE));
    deferred.resolve(editor);
  });

  waitsFor('spinner to start', 10000, () => {
    return busySignal.isBusy();
  });

  waitsFor('spinner to stop', 30000, () => {
    return !busySignal.isBusy();
  });

  return deferred.promise;
}
