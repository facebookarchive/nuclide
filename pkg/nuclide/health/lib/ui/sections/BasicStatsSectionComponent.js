'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

class BasicStatsSectionComponent extends React.Component {

  render(): ReactElement {
    var stats = [
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

BasicStatsSectionComponent.propTypes = {
  cpuPercentage: React.PropTypes.number.isRequired,
  memory: React.PropTypes.number.isRequired,
  heapPercentage: React.PropTypes.number.isRequired,
  lastKeyLatency: React.PropTypes.number.isRequired,
  activeHandles: React.PropTypes.number.isRequired,
  activeRequests: React.PropTypes.number.isRequired,
};

module.exports = BasicStatsSectionComponent;
