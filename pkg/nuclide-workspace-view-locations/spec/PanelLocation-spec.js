'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {PanelLocation} from '../lib/PanelLocation';
import invariant from 'assert';

describe('PanelLocation', () => {

  it('serializes the state', () => {
    const location = new PanelLocation('top-panel');
    location._handlePanelResize(720);
    location.setState({visible: true});
    const serialized = location.serialize();
    invariant(serialized != null);
    expect(serialized.data.size).toBe(720);
    expect(serialized.data.visible).toBe(true);
    expect(serialized.data.paneContainer).toBeDefined();
  });

  it('restores the serialized state', () => {
    const serialized = {
      deserializer: 'PanelLocation',
      data: {
        paneContainer: null,
        size: 720,
        visible: true,
      },
    };
    const location = new PanelLocation('top-panel', serialized);
    expect(location._size).toBe(720);
    expect(location.state.visible).toBe(true);
  });
});
