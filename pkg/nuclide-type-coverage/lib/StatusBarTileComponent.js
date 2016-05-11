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

import {addTooltip} from '../../nuclide-atom-helpers';

type Props = {
  percentage: ?number;
  pending: boolean;
  onClick: Function;
};

export class StatusBarTileComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
  }

  render(): ?React.Element {
    const percentage = this.props.percentage;
    if (percentage != null) {
      const className = this.props.pending ?
        'type-coverage-status-bar-pending' :
        'type-coverage-status-bar-ready';
      const formattedPercentage: string = `${Math.floor(percentage)}%`;
      const titleString = `This file is ${formattedPercentage} covered by the type system.<br/>` +
        'Click to toggle display of uncovered areas.';
      return (
        <div
            style={{cursor: 'pointer'}}
            onClick={this.props.onClick}
            className={className}
            ref={addTooltip({
              title: titleString,
              delay: 0,
              placement: 'top',
            })}>
          {formattedPercentage}
        </div>
      );
    } else {
      return null;
    }
  }
}
