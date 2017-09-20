/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as React from 'react';

type DefaultProps = {
  contained: boolean,
};

type Props = {
  children?: React.Element<any>,
  contained: boolean,
};

// NOTE: This constant must be kept in sync with the keybinding in
//       ../nuclide-tab-focus/keymaps/nuclide-tab-focus.json
export const TABBABLE = 'nuclide-tabbable';

export class TabbableContainer extends React.Component<Props> {
  static defaultProps: DefaultProps = {
    contained: false,
  };

  render(): React.Node {
    return (
      <div className={TABBABLE} data-contained={this.props.contained}>
        {this.props.children}
      </div>
    );
  }
}
