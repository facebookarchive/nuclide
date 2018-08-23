"use strict";

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _openSettingsView() {
  const data = _interopRequireDefault(require("../lib/openSettingsView"));

  _openSettingsView = function () {
    return data;
  };

  return data;
}

function _SettingsPaneItem() {
  const data = require("../lib/SettingsPaneItem");

  _SettingsPaneItem = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
// TODO: T30807047 make it an e2e test
describe.skip('SettingsPaneItem', () => {
  beforeEach(() => {
    (0, _nullthrows().default)(document.body).appendChild(atom.views.getView(atom.workspace));
    atom.workspace.addOpener(_openSettingsView().default);
  });
  it('sets focus to the filter input after the pane is opened', async () => {
    await atom.workspace.open(_SettingsPaneItem().WORKSPACE_VIEW_URI);
    const settingsViewEl = document.querySelector('.settings-view');

    if (!(settingsViewEl != null)) {
      throw new Error("Invariant violation: \"settingsViewEl != null\"");
    }

    expect(settingsViewEl.contains(document.activeElement)).toBe(true);
  });
});