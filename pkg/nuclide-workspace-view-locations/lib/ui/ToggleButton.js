/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {IconName} from '../../../nuclide-ui/types';

import {Icon} from '../../../nuclide-ui/Icon';
import classnames from 'classnames';
import {React} from 'react-for-atom';

type Position = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  onDragEnter: () => void,
  position: Position,
  visible: boolean,
  open: boolean,
  toggle: () => void,
};

export class ToggleButton extends React.Component {
  props: Props;

  render(): React.Element<any> {
    const className = classnames(
      'nuclide-workspace-views-toggle-button',
      this.props.position,
      {
        'nuclide-workspace-views-toggle-button-visible': this.props.visible,
      },
    );
    return (
      <div
        className={className}
        onClick={this.props.toggle}
        onDragEnter={this.props.onDragEnter}>
        <div className="nuclide-workspace-views-toggle-button-inner">
          <Icon icon={getIconName(this.props.position, this.props.open)} />
        </div>
      </div>
    );
  }
}

function getIconName(position: Position, open: boolean): IconName {
  switch (position) {
    case 'top': return open ? 'chevron-up' : 'chevron-down';
    case 'right': return open ? 'chevron-right' : 'chevron-left';
    case 'bottom': return open ? 'chevron-down' : 'chevron-up';
    case 'left': return open ? 'chevron-left' : 'chevron-right';
    default: throw new Error(`Invalid position: ${position}`);
  }
}
