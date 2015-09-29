'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

class HealthPaneItem extends HTMLElement {

  uri: string;

  initialize(uri: string): HealthPaneItem {
    this.uri = uri;
    this.className = 'pane-item padded nuclide-health-pane-item';
    return this;
  }

  getTitle(): string {
    return 'Health';
  }

  getIconName(): string {
    return 'dashboard';
  }

  getURI(): string {
    return this.uri;
  }

  // Return false to prevent the tab getting split (since we only update a singleton health pane).
  copy() {
    return false;
  }

  destroy(): void {
    React.unmountComponentAtNode(this);
  }

  serialize() {
    return {
      deserializer: 'HealthPaneItem',
      uri: this.getURI(),
    };
  }
}

// $FlowIssue t8493612
module.exports = HealthPaneItem = document.registerElement('nuclide-health-item', {
  prototype: HealthPaneItem.prototype,
});
