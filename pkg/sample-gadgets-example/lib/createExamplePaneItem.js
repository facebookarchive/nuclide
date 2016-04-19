'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

export class ExamplePaneItem extends React.Component {
  static gadgetId = 'sample-gadget';
  static defaultLocation = 'right';

  render(): React.Element {
    return (
      <div className="pane-item padded sample-gadgets-pane">
        The simplest possible Gadget.
      </div>
    );
  }

  getTitle(): string {
    return 'Sample Gadget';
  }

  getIconName(): string {
    return 'squirrel';
  }
}
