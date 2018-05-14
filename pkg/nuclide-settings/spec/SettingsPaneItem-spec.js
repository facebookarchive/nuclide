/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import invariant from 'assert';
import nullthrows from 'nullthrows';
import openSettingsView from '../lib/openSettingsView';
import {WORKSPACE_VIEW_URI} from '../lib/SettingsPaneItem';

describe('SettingsPaneItem', () => {
  beforeEach(() => {
    nullthrows(document.body).appendChild(atom.views.getView(atom.workspace));
    atom.workspace.addOpener(openSettingsView);
  });

  it('sets focus to the filter input after the pane is opened', () => {
    waitsForPromise(() => atom.workspace.open(WORKSPACE_VIEW_URI));
    runs(() => {
      const settingsViewEl = document.querySelector('.settings-view');
      invariant(settingsViewEl != null);

      expect(settingsViewEl.contains(document.activeElement)).toBe(
        true,
        'focused element is not a descendant of the .settings-view element',
      );
    });
  });
});
