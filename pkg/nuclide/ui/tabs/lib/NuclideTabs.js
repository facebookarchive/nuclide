'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const React = require('react-for-atom');

const {PropTypes} = React;

const {array} = require('nuclide-commons');
const classnames = require('classnames');

const NuclideTabs = React.createClass({

  propTypes: {
    tabs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      tabContent: PropTypes.node.isRequired,
    })).isRequired,
    activeTabName: PropTypes.string.isRequired,
    onActiveTabChange: PropTypes.func.isRequired,
    triggeringEvent: PropTypes.string.isRequired,
  },

  getDefaultProps(): any {
    return {
      triggeringEvent: 'onClick',
    };
  },

  _handleTabChange(selectedTabName: string) {
    if (typeof this.props.onActiveTabChange === 'function') {
      this.props.onActiveTabChange(
        array.find(this.props.tabs, tab => tab.name === selectedTabName)
      );
    }
  },

  _renderTabMenu(): ReactElement {
    const tabs = this.props.tabs.map(tab => {
      const handler = {};
      handler[this.props.triggeringEvent] = this._handleTabChange.bind(this, tab.name);
      return (
        <li
          className={classnames({
            tab: true,
            active: this.props.activeTabName === tab.name,
          })}
          key={tab.name}
          {...handler}>
          <div className="title">
            {tab.tabContent}
          </div>
        </li>
      );
    });
    return (
      <ul className="tab-bar list-inline inset-panel">
        {tabs}
      </ul>
    );
  },

  render(): ReactElement {
    return (
      <div className="nuclide-tabs">
        {this._renderTabMenu()}
      </div>
    );
  },
});

module.exports = NuclideTabs;
