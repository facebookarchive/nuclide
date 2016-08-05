'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Viewable} from '../../nuclide-workspace-views/lib/types';

import {PanelLocation} from '../lib/PanelLocation';
import invariant from 'assert';

describe('PanelLocation', () => {

  describe('showItem', () => {

    it("adds items that aren't already present", () => {
      const location = createLocation();
      const item = createMockViewable();
      location.showItem(item);
      expect(location.state.items).toContain(item);
    });

  });

  describe('hideItem', () => {

    it("has no effect if the item is already hidden (isn't active)", () => {
      const location = createLocation();
      const itemA = createMockViewable();
      const itemB = createMockViewable();
      location.setState({
        items: [itemA, itemB],
        activeItemIndex: 0,
        visible: true,
      });
      location.hideItem(itemB);
      expect(location.state.items).toEqual([itemA, itemB]);
      expect(location.state.activeItemIndex).toBe(0);
      expect(location.state.visible).toBe(true);
    });

    it('hides the active item', () => {
      const location = createLocation();
      const itemA = createMockViewable();
      const itemB = createMockViewable();
      location.setState({
        items: [itemA, itemB],
        activeItemIndex: 0,
        visible: true,
      });
      location.hideItem(itemA);
      expect(location.state.visible).toBe(false);
    });

  });

  describe('serialize', () => {

    it('serializes the items', () => {
      const location = createLocation();
      const itemA = createMockViewable();
      const itemB = createMockViewable();
      const itemC = createMockViewable();
      location.state = {
        ...location.state,
        items: [itemA, itemB],
      };
      spyOn(itemA, 'serialize').andReturn({a: 1});
      spyOn(itemB, 'serialize').andReturn({b: 2});
      spyOn(itemC, 'serialize').andReturn(null);
      const serialized = location.serialize();
      invariant(serialized != null);
      expect(serialized.data.items).toEqual([{a: 1}, {b: 2}]);
    });

  });

});

function createLocation(): PanelLocation {
  const location = new PanelLocation('top-panel', {});
  spyOn(location, '_createPanel'); // Don't actually create the panel.
  return location;
}

function createMockViewable(): Viewable {
  return {
    getTitle: () => 'Title',
    serialize: () => ({}),
  };
}
