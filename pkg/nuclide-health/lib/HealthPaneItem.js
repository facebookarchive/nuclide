"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.WORKSPACE_VIEW_URI = void 0;

function _HealthPaneItemComponent() {
  const data = _interopRequireDefault(require("./ui/HealthPaneItemComponent"));

  _HealthPaneItemComponent = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const WORKSPACE_VIEW_URI = 'atom://nuclide/health';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

class HealthPaneItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stats: null,
      domCounters: null,
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
  } // Return false to prevent the tab getting split (since we only update a singleton health pane).


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
      childProcessesTree,
      stats,
      domCounters
    } = this.state;

    if (stats == null) {
      return React.createElement("div", null);
    }

    return React.createElement("div", {
      // Need native-key-bindings and tabIndex={-1} to be able to copy paste
      className: "pane-item padded nuclide-health-pane-item native-key-bindings",
      tabIndex: -1
    }, React.createElement(_HealthPaneItemComponent().default, {
      cpuPercentage: stats.cpuPercentage,
      heapPercentage: stats.heapPercentage,
      memory: stats.rss,
      activeHandles: stats.activeHandles,
      activeRequests: stats.activeRequests,
      activeHandlesByType: stats.activeHandlesByType,
      attachedDomNodes: domCounters && domCounters.attachedNodes,
      domNodes: domCounters && domCounters.nodes,
      domListeners: domCounters && domCounters.jsEventListeners,
      childProcessesTree: childProcessesTree
    }));
  }

}

exports.default = HealthPaneItem;