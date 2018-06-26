'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _HealthPaneItem;

function _load_HealthPaneItem() {
  return _HealthPaneItem = require('../lib/HealthPaneItem');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const sleep = n => new Promise(r => setTimeout(r, n)); /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */

const openHealthPane = () => {
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.workspace.open((_HealthPaneItem || _load_HealthPaneItem()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
};

function findHealthPaneAndItem() {
  for (const pane of atom.workspace.getPanes()) {
    for (const item of pane.getItems()) {
      if (item.getTitle() === 'Health') {
        return { pane, item };
      }
    }
  }
  return { pane: null, item: null };
}

describe.skip('Health', () => {
  beforeEach(async () => {
    await atom.packages.activatePackage((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..'));
  });

  it('contains stats after its first refresh', async () => {
    let element;
    let pane;
    let item;
    openHealthPane();
    await sleep(2000);
    await (0, (_waits_for || _load_waits_for()).default)(() => {
      const { pane: pane_, item: item_ } = findHealthPaneAndItem();
      pane = pane_;
      item = item_;
      return item != null && pane != null;
    });

    if (!(item != null)) {
      throw new Error('Invariant violation: "item != null"');
    }

    expect(item.getTitle()).toEqual('Health');
    element = atom.views.getView(item);
    await (0, (_waits_for || _load_waits_for()).default)(() => element.innerHTML.trim() !== '');
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
    await (0, (_waits_for || _load_waits_for()).default)(() => {
      const { pane: pane_, item: item_ } = findHealthPaneAndItem();
      pane = pane_;
      item = item_;
      return item != null && pane != null;
    });

    if (!(pane != null)) {
      throw new Error('Invariant violation: "pane != null"');
    }

    if (!(item != null)) {
      throw new Error('Invariant violation: "item != null"');
    }

    pane.activateItem(item);
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:close');
    await sleep(500);
    // Explicitly cast the result to boolean rather than using `.toBeFalsy()`
    // since Jasmine crashes when trying to pretty print the item.
    expect(Boolean(findHealthPaneAndItem().item)).toBe(false);
  });
});