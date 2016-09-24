'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {PanelComponent} from '../../../nuclide-ui/PanelComponent';
import {View} from '../../../nuclide-ui/View';
import {React} from 'react-for-atom';

type Props = {
  initialSize: ?number,
  item: ?Object,
  position: 'top' | 'right' | 'bottom' | 'left',
  onResize: (size: number) => void,
};

export class Panel extends React.Component {
  props: Props;

  _getInitialSize(): ?number {
    if (this.props.initialSize != null) {
      return this.props.initialSize;
    }

    const {item} = this.props;
    if (item == null) { return null; }
    switch (this.props.position) {
      case 'top':
      case 'bottom':
        return typeof item.getPreferredInitialHeight === 'function'
          ? item.getPreferredInitialHeight()
          : null;
      case 'left':
      case 'right':
        return typeof item.getPreferredInitialWidth === 'function'
          ? item.getPreferredInitialWidth()
          : null;
      default:
        throw new Error(`Invalid position: ${this.props.position}`);
    }
  }

  render(): ?React.Element<any> {
    if (this.props.item == null) { return null; }
    return (
      <PanelComponent
        initialLength={this._getInitialSize() || undefined}
        noScroll={true}
        onResize={this.props.onResize}
        dock={this.props.position}>
        <View item={this.props.item} />
      </PanelComponent>
    );
  }

}
