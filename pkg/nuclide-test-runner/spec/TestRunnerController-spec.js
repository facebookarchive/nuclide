'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestRunner} from '../../nuclide-test-runner-interfaces';

const TestRunnerController = require('../lib/TestRunnerController');

describe('TestRunnerController', () => {

  let testRunners: Set<TestRunner> = (null: any);

  beforeEach(() => {
    testRunners = new Set();
  });

  describe('on initialization', () => {

    it('does not create a panel if `panelVisible` is false', () => {
      new TestRunnerController({panelVisible: false}, testRunners); // eslint-disable-line no-new
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
    });

    it('does not create a panel if no state is provided', () => {
      new TestRunnerController(undefined, testRunners); // eslint-disable-line no-new
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
    });

    it('creates a panel if `panelVisible` is true', () => {
      new TestRunnerController({panelVisible: true}, testRunners); // eslint-disable-line no-new
      expect(atom.workspace.getBottomPanels().length).toEqual(1);
    });

  });

  describe('runTests()', () => {

    it('forces the panel to be shown', () => {
      // The controller needs at least one test runner to run tests.
      testRunners.add({getByUri() {}, label: ''});
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
      testRunners.add({
        getByUri() {},
        label: '',
      });
      controller.didUpdateTestRunners();
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
    });

  });

});
