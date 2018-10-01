"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _HealthPaneItem() {
  const data = require("../lib/HealthPaneItem");

  _HealthPaneItem = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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
const sleep = n => new Promise(r => setTimeout(r, n));

const openHealthPane = () => {
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.workspace.open(_HealthPaneItem().WORKSPACE_VIEW_URI, {
    searchAllPanes: true
  });
};

function findHealthPaneAndItem() {
  for (const pane of atom.workspace.getPanes()) {
    for (const item of pane.getItems()) {
      if (item.getTitle() === 'Health') {
        return {
          pane,
          item
        };
      }
    }
  }

  return {
    pane: null,
    item: null
  };
}

describe.skip('Health', () => {
  beforeEach(async () => {
    await atom.packages.activatePackage(_nuclideUri().default.join(__dirname, '..'));
  });
  it('contains stats after its first refresh', async () => {
    let pane;
    let item;
    openHealthPane();
    await sleep(2000);
    await (0, _waits_for().default)(() => {
      const {
        pane: pane_,
        item: item_
      } = findHealthPaneAndItem();
      pane = pane_;
      item = item_;
      return item != null && pane != null;
    });

    if (!(item != null)) {
      throw new Error("Invariant violation: \"item != null\"");
    }

    expect(item.getTitle()).toEqual('Health');
    const element = atom.views.getView(item);
    await (0, _waits_for().default)(() => element.innerHTML.trim() !== '');
    expect(element.innerHTML).toContain('Stats');
    expect(element.innerHTML).toContain('CPU');
    expect(element.innerHTML).toContain('Heap');
    expect(element.innerHTML).toContain('Memory');
    expect(element.innerHTML).toContain('Handles');
    expect(element.innerHTML).toContain('Event loop');
  });
  it('disappears when closed', async () => {
    openHealthPane();
    let pane;
    let item;
    await (0, _waits_for().default)(() => {
      const {
        pane: pane_,
        item: item_
      } = findHealthPaneAndItem();
      pane = pane_;
      item = item_;
      return item != null && pane != null;
    });

    if (!(pane != null)) {
      throw new Error("Invariant violation: \"pane != null\"");
    }

    if (!(item != null)) {
      throw new Error("Invariant violation: \"item != null\"");
    }

    pane.activateItem(item);
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:close');
    await sleep(500); // Explicitly cast the result to boolean rather than using `.toBeFalsy()`
    // since Jasmine crashes when trying to pretty print the item.

    expect(Boolean(findHealthPaneAndItem().item)).toBe(false);
  });
});