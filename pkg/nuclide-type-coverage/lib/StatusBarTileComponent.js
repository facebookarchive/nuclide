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
import classnames from 'classnames';

type Props = {
  percentage: ?number;
  pending: boolean;
  onClick: Function;
};

const REALLY_BAD_THRESHOLD = 50;
const NOT_GREAT_THRESHOLD = 80;

export class StatusBarTileComponent extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
  }

  render(): ?React.Element {
    const percentage = this.props.percentage;
    if (percentage != null) {
      const classes: string = classnames({
        'type-coverage-status-bar-pending': this.props.pending,
        'type-coverage-status-bar-ready': !this.props.pending,
        'type-coverage-status-bar-really-bad': percentage <= REALLY_BAD_THRESHOLD,
        'type-coverage-status-bar-not-great':
          percentage > REALLY_BAD_THRESHOLD && percentage <= NOT_GREAT_THRESHOLD,
        'type-coverage-status-bar-good': percentage > NOT_GREAT_THRESHOLD,
      });
      const formattedPercentage: string = `${Math.floor(percentage)}%`;
      const titleString = `This file is ${formattedPercentage} covered by the type system.<br/>` +
        'Click to toggle display of uncovered areas.';
      return (
        <div
            style={{cursor: 'pointer'}}
            onClick={this.props.onClick}
            className={classes}
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
