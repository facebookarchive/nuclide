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
class HandlesTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.previousHandleSummaries = {};
  }

  getHandleSummaries(handles) {
    const handleSummaries = {};
    handles.forEach((handle, h) => {
      const summarizedHandle = {};
      this.props.columns.forEach((column, c) => {
        summarizedHandle[c] = column.value(handle, h);
      });
      handleSummaries[this.props.keyed(handle, h)] = summarizedHandle;
    });
    return handleSummaries;
  }

  render() {
    if (this.props.handles.length === 0) {
      return React.createElement("div", null);
    }

    const handleSummaries = this.getHandleSummaries(this.props.handles);
    const component = React.createElement("div", null, React.createElement("h3", null, this.props.title), React.createElement("table", {
      className: "table"
    }, React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", {
      width: "10%"
    }, "ID"), this.props.columns.map((column, c) => React.createElement("th", {
      key: c,
      width: `${column.widthPercentage}%`
    }, column.title)))), React.createElement("tbody", null, Object.keys(handleSummaries).map(key => {
      const handleSummary = handleSummaries[key];
      const previousHandle = this.previousHandleSummaries[key];
      return React.createElement("tr", {
        key: key,
        className: previousHandle ? '' : 'nuclide-health-handle-new'
      }, React.createElement("th", null, key), this.props.columns.map((column, c) => {
        let className = '';

        if (previousHandle && previousHandle[c] !== handleSummary[c]) {
          className = 'nuclide-health-handle-updated';
        }

        return React.createElement("td", {
          key: c,
          className: className
        }, handleSummary[c]);
      }));
    }))));
    this.previousHandleSummaries = handleSummaries;
    return component;
  }

}

exports.default = HandlesTableComponent;