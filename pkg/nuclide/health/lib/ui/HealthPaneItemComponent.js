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

class HealthPaneItemComponent extends React.Component {

  render(): ReactElement {

    var BasicStatsSectionComponent = require('./sections/BasicStatsSectionComponent');
    var ActiveHandlesSectionComponent = require('./sections/ActiveHandlesSectionComponent');

    var sections = {
      'Stats':
        <BasicStatsSectionComponent {...this.props} />,
      'Handles':
        <ActiveHandlesSectionComponent activeHandleObjects={this.props.activeHandleObjects} />,
    };

    // For each section, we use settings-view to get a familiar look for table cells.
    return (
      <div>
        <button
          className="btn icon icon-gear pull-right"
          onClick={() => atom.workspace.open('atom://config/packages/nuclide-health')}>
          Settings
        </button>
        {Object.keys(sections).map((title, s) =>
          <div className="nuclide-health-pane-item-section" key={s}>
            <h2>{title}</h2>
            <div className="settings-view">
              {sections[title]}
            </div>
          </div>
        )}
      </div>
    );
  }
}

HealthPaneItemComponent.propTypes = {
  cpuPercentage: React.PropTypes.number.isRequired,
  memory: React.PropTypes.number.isRequired,
  heapPercentage: React.PropTypes.number.isRequired,
  lastKeyLatency: React.PropTypes.number.isRequired,
  activeHandles: React.PropTypes.number.isRequired,
  activeRequests: React.PropTypes.number.isRequired,

  activeHandleObjects: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
};

module.exports = HealthPaneItemComponent;
