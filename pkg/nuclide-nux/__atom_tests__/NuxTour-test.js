"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _NuxManager() {
  const data = require("../lib/NuxManager");

  _NuxManager = function () {
    return data;
  };

  return data;
}

function _NuxStore() {
  const data = require("../lib/NuxStore");

  _NuxStore = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */

/* global localStorage */
const NUX_TOUR_SPEC_EXAMPLE_NUX_ID = -1;
const NUX_TOUR_SPEC_EXAMPLE_NUX_NAME = 'nuclide-nux-spec.nux-tour-sample';
describe('NuxTour', () => {
  function generateTestNuxTour(id, name, numViews = 1) {
    const nuxViewModel = {
      content: 'Content',
      selector: '.something',
      position: 'auto',
      completionPredicate: null
    };
    return {
      id,
      name,
      nuxList: Array(numViews).fill(nuxViewModel)
    };
  }

  let nuxStore;
  let disposables;
  let nuclideNuxState;
  beforeEach(() => {
    disposables = new (_UniversalDisposable().default)(); // Save viewed state of NUXes

    nuclideNuxState = localStorage.getItem(_NuxStore().NUX_SAVED_STORE);
    localStorage.clear();
    nuxStore = new (_NuxStore().NuxStore)();
    disposables.add(nuxStore);
  });
  afterEach(() => {
    disposables.dispose(); // Restore viewed state of NUXes

    localStorage.setItem(_NuxStore().NUX_SAVED_STORE, String(nuclideNuxState));
  });
  it("stores a NuxTour's state in the NuxStore", () => {
    nuxStore.addNewNux(generateTestNuxTour(-1, 'a'));
    nuxStore.addNewNux(generateTestNuxTour(-2, 'b'));
    expect(nuxStore._nuxMap.size).toBe(2);
  });
  it('creates a NuxTour from a NuxTourModel', () => {
    const nuxManager = new (_NuxManager().NuxManager)(nuxStore, () => {});
    disposables.add(nuxManager);
    nuxStore.addNewNux(generateTestNuxTour(NUX_TOUR_SPEC_EXAMPLE_NUX_ID, NUX_TOUR_SPEC_EXAMPLE_NUX_NAME));
    expect(nuxStore._nuxMap.size).toBe(1);
  });
  it('creates a NuxTour that waits for a trigger', () => {
    const nuxManager = new (_NuxManager().NuxManager)(nuxStore, () => {});
    disposables.add(nuxManager);
    const nuxTour = generateTestNuxTour(NUX_TOUR_SPEC_EXAMPLE_NUX_ID, NUX_TOUR_SPEC_EXAMPLE_NUX_NAME);
    nuxTour.trigger = {
      triggerType: 'editor',
      triggerCallback: () => false
    };
    nuxStore.addNewNux(nuxTour);
    expect(nuxStore._nuxMap.size).toBe(1);
    expect(nuxManager._readyToDisplayNuxes.length).toBe(0);
    expect(nuxManager._pendingNuxes.size).toBe(1);
    expect(nuxManager._activeNuxTour != null).toBeFalsy();
  });
});