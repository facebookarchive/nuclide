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

type Position = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  initialSize: ?number,
  paneContainer: atom$PaneContainer,
  position: Position,
  onResize: (size: number) => void,
};

export class Panel extends React.Component {
  props: Props;

  _getInitialSize(): ?number {
    if (this.props.initialSize != null) {
      return this.props.initialSize;
    }

    // The item may not have been activated yet. If that's the case, just use the first item.
    const activePaneItem =
      this.props.paneContainer.getActivePaneItem() || this.props.paneContainer.getPaneItems()[0];
    if (activePaneItem != null) {
      return getPreferredInitialSize(activePaneItem, this.props.position);
    }
  }

  render(): ?React.Element<any> {
    if (this.props.paneContainer == null) { return null; }
    return (
      <div className="nuclide-workspace-views-panel">
        <PanelComponent
          initialLength={this._getInitialSize() || undefined}
          noScroll={true}
          onResize={this.props.onResize}
          dock={this.props.position}>
          <View item={this.props.paneContainer} />
        </PanelComponent>
      </div>
    );
  }

}

function getPreferredInitialSize(item: Object, position: Position): ?number {
  switch (position) {
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
      throw new Error(`Invalid position: ${position}`);
  }
}
