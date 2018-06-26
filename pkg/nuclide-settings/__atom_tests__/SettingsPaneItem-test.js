'use strict';

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _openSettingsView;

function _load_openSettingsView() {
  return _openSettingsView = _interopRequireDefault(require('../lib/openSettingsView'));
}

var _SettingsPaneItem;

function _load_SettingsPaneItem() {
  return _SettingsPaneItem = require('../lib/SettingsPaneItem');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: T30807047 make it an e2e test
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

describe.skip('SettingsPaneItem', () => {
  beforeEach(() => {
    (0, (_nullthrows || _load_nullthrows()).default)(document.body).appendChild(atom.views.getView(atom.workspace));
    atom.workspace.addOpener((_openSettingsView || _load_openSettingsView()).default);
  });

  it('sets focus to the filter input after the pane is opened', async () => {
    await atom.workspace.open((_SettingsPaneItem || _load_SettingsPaneItem()).WORKSPACE_VIEW_URI);
    const settingsViewEl = document.querySelector('.settings-view');

    if (!(settingsViewEl != null)) {
      throw new Error('Invariant violation: "settingsViewEl != null"');
    }

    console.log(settingsViewEl.innerHTML);
    expect(settingsViewEl.contains(document.activeElement)).toBe(true);
  });
});