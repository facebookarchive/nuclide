"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class BasicStatsSectionComponent extends React.Component {
  render() {
    const stats = [{
      name: 'CPU',
      value: `${this.props.cpuPercentage.toFixed(0)}%`
    }, {
      name: 'Heap',
      value: `${this.props.heapPercentage.toFixed(1)}%`
    }, {
      name: 'Memory',
      value: `${Math.floor(this.props.memory / 1024 / 1024)}MB`
    }, {
      name: 'Handles',
      value: `${this.props.activeHandles}`
    }, {
      name: 'Child processes',
      value: `${this.props.activeHandlesByType.childprocess.length}`
    }, {
      name: 'Event loop',
      value: `${this.props.activeRequests}`
    }, {
      name: 'Attached DOM Nodes',
      value: `${this.props.attachedDomNodes != null ? this.props.attachedDomNodes : 'N/A - are your devtools open?'}`
    }, {
      name: 'Retained DOM Nodes',
      value: `${this.props.domNodes != null ? this.props.domNodes : 'N/A - are your devtools open?'}`
    }, {
      name: 'DOM Listeners',
      value: `${this.props.domListeners != null ? this.props.domListeners : 'N/A - are your devtools open?'}`
    }];
    return React.createElement("table", {
      className: "table"
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
      width: "30%"
    }, "Metric"), React.createElement("th", {
      width: "50%"
    }, "Value"), React.createElement("th", {
      width: "20%",
      className: "text-right"
    }, "Toolbar"))), React.createElement("tbody", null, stats.map((stat, s) => {
      const props = {};
      return React.createElement("tr", Object.assign({}, props, {
        key: s
      }), React.createElement("th", null, stat.name), React.createElement("td", null, stat.value));
    })));
  }

}

exports.default = BasicStatsSectionComponent;