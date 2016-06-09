'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {sleep} from '../pkg/commons-node/promise';
import {_getCommands} from '../pkg/nuclide-build';
import {
  activateAllPackages,
  copyFixture,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  setLocalProject,
} from '../pkg/nuclide-integration-test-helpers';
import invariant from 'assert';
import path from 'path';

describe('Buck building via toolbar', () => {

  beforeEach(() => {
    waitsForPromise({timeout: 60000}, async () => {
      // Configure some jasmine specific things for integration testing.
      jasmineIntegrationTestSetup();

      // Activate nuclide packages.
      await activateAllPackages();
    });
  });

  afterEach(() => {
    // Deactivate nuclide packages.
    deactivateAllPackages();
  });

  it('builds a project', () => {
    let buildToolbar: HTMLElement;
    const workspaceView = atom.views.getView(atom.workspace);

    waitsForPromise(async () => {
      const projectPath = await copyFixture('objc_project_1');
      setLocalProject(projectPath);
      await atom.workspace.open(path.join(projectPath, '.buckconfig'));
    });

    waitsFor(
      'the toolbar to be shown',
      10,
      () => {
        atom.commands.dispatch(workspaceView, 'nuclide-build:toggle-toolbar-visibility');
        buildToolbar = document.querySelector('.nuclide-build-toolbar');
        return Boolean(buildToolbar);
      },
    );

    runs(() => {
      // Select the Buck build system.
      const commands = _getCommands();
      invariant(commands != null);
      commands.selectBuildSystem('buck');
    });

    let combobox: HTMLElement;
    waitsFor(
      'the target combobox to appear',
      200,
      () => (
        combobox = buildToolbar.querySelector('.nuclide-buck-target-combobox')
      ),
    );

    // Wait for the Buck project to load. This is a hack, obviously, around the issue that Combobox
    // will only load aliases for the Buck project that is currently loaded when you click on it.
    waitsForPromise(() => sleep(1000));

    // Focus on the build toolbar target combobox field.
    let targetField: HTMLElement;
    runs(() => {
      // Focus on the build toolbar target field.
      targetField = combobox.querySelector('atom-text-editor');
      const event = new window.MouseEvent('focus');
      targetField.dispatchEvent(event);
    });

    // Wait for the results.
    let listGroup: HTMLElement;
    waitsFor(
      'results to appear',
      10000,
      () => {
        listGroup = combobox.querySelector('.list-group');
        const hasListItems = listGroup && listGroup.querySelectorAll('li').length > 0;
        const isLoading = listGroup && listGroup.querySelector('.loading-message') != null;
        return hasListItems && !isLoading;
      },
    );

    waitsForPromise(async () => {
      // It shouldn't have errored.
      expect(listGroup.querySelector('.text-error')).toBeNull();

      const listElements = listGroup.querySelectorAll('li');
      const targets = Array.from(listElements).map(el => el.textContent);
      expect(targets).toEqual(['test_app_alias']);

      // Set the target.
      listElements[0].click();

      // Since there's some debouncing going on, wait for the state to update before building.
      await sleep(500);

      // Run the project
      atom.commands.dispatch(workspaceView, 'nuclide-build:build');

      // The Build task should be selected.
      const button = buildToolbar.querySelector(
        '.nuclide-build-toolbar-contents .nuclide-ui-split-button-dropdown button'
      );
      expect(button.textContent).toBe('Build');
    });

    let paneItem;
    waitsFor(
      'the output pane to appear',
      10000,
      () => {
        paneItem = atom.workspace.getActivePaneItem();
        return paneItem != null && paneItem.getTitle() === 'buck build test_app_alias';
      },
    );

    waitsFor(
      'the build to finish',
      10000,
      () => {
        const processOutputStore = paneItem && paneItem.props && paneItem.props.processOutputStore;
        const stdout = processOutputStore && processOutputStore.getStdout() || '';
        if (stdout.indexOf('FINISHED') === -1) { return false; }
        if (stdout.indexOf('100%') === -1) { return false; }
        return true;
      },
    );

  });

});
