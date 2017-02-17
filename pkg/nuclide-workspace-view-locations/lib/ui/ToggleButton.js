/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';

type Position = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  onDragEnter: () => void,
  position: Position,
  visible: boolean,
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
      <div className={className} onDragEnter={this.props.onDragEnter}>
        <div className="nuclide-workspace-views-toggle-button-inner" />
      </div>
    );
  }
}
