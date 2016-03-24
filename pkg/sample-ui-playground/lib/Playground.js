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

export class Playground extends React.Component {
  static gadgetId = 'sample-ui-playground-gadget';
  static defaultLocation = 'right';

  getTitle(): string {
    return 'Nuclide UI Playground';
  }

  getIconName(): string {
    return 'puzzle';
  }

  render(): ReactElement {
    return (
      <div className="nuclide-ui-playground">
      </div>
    );
  }
}
