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

export default class BasicStatsSectionComponent extends React.Component {

  static propTypes = {
    cpuPercentage: PropTypes.number.isRequired,
    memory: PropTypes.number.isRequired,
    heapPercentage: PropTypes.number.isRequired,
    lastKeyLatency: PropTypes.number.isRequired,
    activeHandles: PropTypes.number.isRequired,
    activeRequests: PropTypes.number.isRequired,
  };

  render(): ReactElement {
    const stats = [
      {
        name: 'CPU',
        value: `${this.props.cpuPercentage.toFixed(0)}%`,
      }, {
        name: 'Heap',
        value: `${this.props.heapPercentage.toFixed(1)}%`,
      }, {
        name: 'Memory',
        value: `${Math.floor(this.props.memory / 1024 / 1024)}MB`,
      }, {
        name: 'Key latency',
        value: `${this.props.lastKeyLatency}ms`,
      }, {
        name: 'Handles',
        value: `${this.props.activeHandles}`,
      }, {
        name: 'Event loop',
        value: `${this.props.activeRequests}`,
      },
    ];

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat, s) =>
            <tr key={s}>
              <th>{stat.name}</th>
              <td>{stat.value}</td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}
