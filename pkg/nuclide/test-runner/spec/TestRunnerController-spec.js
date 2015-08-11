'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type TestRunner from '../lib/TestRunner';

var TestRunnerController = require('../lib/TestRunnerController');

describe('TestRunnerController', () => {

  var testRunners: Set<TestRunner>;

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

  describe('on addition of new test runners', () => {

    // When new test runners are added, the dropdown in the UI needs to update. However, it should
    // not force a render if the panel is still supposed to be hidden.
    it('does not create a panel if `panelVisible` is false', () => {
      var controller = new TestRunnerController({panelVisible: false}, testRunners);
      testRunners.add({
        getByUri() {},
        label: '',
      });
      controller.didUpdateTestRunners();
      expect(atom.workspace.getBottomPanels().length).toEqual(0);
    });

  });

});
