'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';
const {PropTypes} = React;

export default class HealthStatusBarComponent extends React.Component {

  static propTypes = {
    onClickIcon: PropTypes.func.isRequired,
    cpuPercentage: PropTypes.number,
    memory: PropTypes.number,
    heapPercentage: PropTypes.number,
    lastKeyLatency: PropTypes.number,
    activeHandles: PropTypes.number,
    activeRequests: PropTypes.number,
  };

  render(): void {
    const stats = [];

    if (this.props.hasOwnProperty('cpuPercentage')) {
      stats.push(`CPU: ${this.props.cpuPercentage.toFixed(0)}%`);
    }

    if (this.props.hasOwnProperty('heapPercentage')) {
      stats.push(`Heap: ${this.props.heapPercentage.toFixed(1)}%`);
    }

    if (this.props.hasOwnProperty('memory')) {
      stats.push(`Memory: ${Math.floor(this.props.memory / 1024 / 1024)}MB`);
    }

    if (this.props.hasOwnProperty('lastKeyLatency')) {
      stats.push(`Key: ${this.props.lastKeyLatency}ms`);
    }

    if (this.props.hasOwnProperty('activeHandles')) {
      stats.push(`Handles: ${this.props.activeHandles}`);
    }

    if (this.props.hasOwnProperty('activeRequests')) {
      stats.push(`Event loop: ${this.props.activeRequests}`);
    }

    return (
      <div>
        <span
          className="icon icon-dashboard nuclide-health-icon"
          onClick={this.props.onClickIcon}
        />
        {stats.map(stat =>
          <span className="nuclide-health-stat">{stat}</span>
        )}
      </div>
    );
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object): boolean {
    return React.addons.PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
  }

}
