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

import BasicStatsSectionComponent from './sections/BasicStatsSectionComponent';
import ActiveHandlesSectionComponent from './sections/ActiveHandlesSectionComponent';

export default class HealthPaneItemComponent extends React.Component {

  static propTypes = {
    cpuPercentage: PropTypes.number.isRequired,
    memory: PropTypes.number.isRequired,
    heapPercentage: PropTypes.number.isRequired,
    lastKeyLatency: PropTypes.number.isRequired,
    activeHandles: PropTypes.number.isRequired,
    activeRequests: PropTypes.number.isRequired,
    activeHandleObjects: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  render(): ReactElement {

    const sections = {
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
