'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestRunner} from '../lib/types';
import {Observable} from 'rxjs';

import TestRunnerController from '../lib/TestRunnerController';

describe('TestRunnerController', () => {

  const TEST_RUNNER = {getByUri() {}, label: '', runTest() { return Observable.empty(); }};

  let testRunners: Set<TestRunner> = (null: any);

  beforeEach(() => {
    testRunners = new Set();
  });

  describe('on initialization', () => {

    it('does not create a panel if `panelVisible` is false', () => {
      const testRunnerController = new TestRunnerController({panelVisible: false}, testRunners);
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
      testRunnerController.destroy();
    });

    it('does not create a panel if no state is provided', () => {
      const testRunnerController = new TestRunnerController(undefined, testRunners);
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
      testRunnerController.destroy();
    });

    it('creates a panel if `panelVisible` is true', () => {
      const testRunnerController = new TestRunnerController({panelVisible: true}, testRunners);
      expect(atom.workspace.getBottomPanels().length).toEqual(1);
      testRunnerController.destroy();
    });

  });

  describe('runTests()', () => {

    it('forces the panel to be shown', () => {
      // The controller needs at least one test runner to run tests.
      testRunners.add(TEST_RUNNER);
      // Start with `panelVisible: false` to ensure the panel is initially hidden.
      const controller = new TestRunnerController({panelVisible: false}, testRunners);
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
      waitsForPromise(async () => {
        await controller.runTests();
        expect(atom.workspace.getBottomPanels().length).toEqual(1);
      });
    });

  });

  describe('on addition of new test runners', () => {

    // When new test runners are added, the dropdown in the UI needs to update. However, it should
    // not force a render if the panel is still supposed to be hidden.
    it('does not create a panel if `panelVisible` is false', () => {
      const controller = new TestRunnerController({panelVisible: false}, testRunners);
      testRunners.add(TEST_RUNNER);
      controller.didUpdateTestRunners();
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
    });

  });

});
