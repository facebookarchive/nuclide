"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TaskButton = void 0;

function _Button() {
  const data = require("../../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
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
class TaskButton extends React.Component {
  _getLabel() {
    if (!this.props.isRunning) {
      return this.props.name;
    }

    const progress = this.props.progress != null ? `${this.props.progress.toFixed(2)}%` : 'running';
    return React.createElement("i", null, this.props.name, " (", progress, "). Click to cancel");
  }

  render() {
    return React.createElement(_Button().Button, {
      size: _Button().ButtonSizes.SMALL,
      onClick: this.props.isRunning ? this.props.cancel : this.props.start
    }, this._getLabel());
  }

}

exports.TaskButton = TaskButton;