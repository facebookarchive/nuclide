'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WORKSPACE_VIEW_URI = undefined;

var _HealthPaneItemComponent;

function _load_HealthPaneItemComponent() {
  return _HealthPaneItemComponent = _interopRequireDefault(require('./ui/HealthPaneItemComponent'));
}

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/health';

class HealthPaneItem extends _react.Component {

  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      childProcessesTree: null
    };
  }

  componentDidMount() {
    // Note: We assume the `stateStram` prop never changes.
    this._stateSubscription = this.props.stateStream.subscribe(state => this.setState(state || {}));
  }

  componentWillUnmount() {
    this._stateSubscription.unsubscribe();
  }

  getTitle() {
    return 'Health';
  }

  getIconName() {
    return 'dashboard';
  }

  // Return false to prevent the tab getting split (since we only update a singleton health pane).
  copy() {
    return false;
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'center';
  }

  render() {
    const {
      toolbarJewel,
      updateToolbarJewel,
      childProcessesTree,
      stats
    } = this.state;

    if (stats == null) {
      return _react.createElement('div', null);
    }

    return _react.createElement(
      'div',
      {
        // Need native-key-bindings and tabIndex={-1} to be able to copy paste
        className: 'pane-item padded nuclide-health-pane-item native-key-bindings',
        tabIndex: -1 },
      _react.createElement((_HealthPaneItemComponent || _load_HealthPaneItemComponent()).default, {
        toolbarJewel: toolbarJewel,
        updateToolbarJewel: updateToolbarJewel,
        cpuPercentage: stats.cpuPercentage,
        heapPercentage: stats.heapPercentage,
        memory: stats.rss,
        activeHandles: stats.activeHandles,
        activeRequests: stats.activeRequests,
        activeHandlesByType: stats.activeHandlesByType,
        childProcessesTree: childProcessesTree
      })
    );
  }
}
exports.default = HealthPaneItem;