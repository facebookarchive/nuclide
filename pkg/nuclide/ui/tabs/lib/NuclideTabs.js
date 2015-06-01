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

var {PropTypes} = React;

var assign = Object.assign || require('object-assign');
var cx = require('react-classset');

var NuclideTabs = React.createClass({

  propTypes: {
    tabs: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      tabContent: PropTypes.node.isRequired,
    })).isRequired,
    activeTabName: PropTypes.string.isRequired,
    onActiveTabChange: PropTypes.func,
    content: PropTypes.node,
    triggeringEvent: PropTypes.string.isRequired,
  },

  getDefaultProps(): mixed {
    return {
      triggeringEvent: 'onClick',
    };
  },

  _handleTabChange(selectedTabName: string) {
    if (typeof this.props.onActiveTabChange === 'function') {
      this.props.onActiveTabChange(selectedTabName);
    }
  },

  _renderTabMenu(): ReactElement {
    var tabs = this.props.tabs.map(tab => {
      var handler = {};
      handler[this.props.triggeringEvent] = this._handleTabChange.bind(this, tab.name);
      return (
        <li
          className={cx({
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
        {this.props.content}
      </div>
    )
  },
});

module.exports = NuclideTabs;
