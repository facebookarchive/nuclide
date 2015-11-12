'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import NuclideCustomPaneItem from 'nuclide-ui-pane-item';
import Panel from './Panel';
import React from 'react-for-atom';

class PaneItem extends NuclideCustomPaneItem {

  __renderPaneItem(): ReactElement {
    return (
      <Panel />
    );
  }

  serialize(): Object {
    return {
      deserializer: 'ReactNativeInspectorPaneItem',
      uri: this.getURI(),
    };
  }
}

module.exports = document.registerElement('react-native-inspector-pane-item', {
  prototype: PaneItem.prototype,
});
