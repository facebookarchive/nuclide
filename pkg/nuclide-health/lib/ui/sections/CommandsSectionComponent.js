"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _process() {
  const data = require("../../../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

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
class CommandsSectionComponent extends React.Component {
  shouldComponentUpdate() {
    return this._lastRenderCount !== _process().loggedCalls.length;
  }

  render() {
    this._lastRenderCount = _process().loggedCalls.length;
    return React.createElement("table", {
      className: "table"
    }, React.createElement("thead", null, React.createElement("th", {
      width: "10%"
    }, "Time"), React.createElement("th", {
      width: "10%"
    }, "Duration (ms)"), React.createElement("th", null, "Command")), React.createElement("tbody", null, _process().loggedCalls.map((call, i) => React.createElement("tr", {
      key: i
    }, React.createElement("td", null, call.time.toTimeString().replace(/ .+/, '')), React.createElement("td", null, call.duration), React.createElement("td", null, call.command)))));
  }

}

exports.default = CommandsSectionComponent;