"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProcessTaskButton = void 0;

function _Dropdown() {
  const data = require("../../../../modules/nuclide-commons-ui/Dropdown");

  _Dropdown = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _Icon() {
  const data = require("../../../../modules/nuclide-commons-ui/Icon");

  _Icon = function () {
    return data;
  };

  return data;
}

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
class ProcessTaskButton extends React.Component {
  _getTaskOptions() {
    return this.props.tasks.filter(task => task.type === this.props.taskType && task.isSupported(this.props.proc)).map(task => ({
      value: task,
      label: task.name
    }));
  }

  render() {
    const options = this._getTaskOptions();

    if (options.length === 0) {
      return React.createElement("div", null);
    } else if (options.length === 1) {
      return React.createElement("span", {
        onClick: () => options[0].value.run(this.props.proc)
      }, React.createElement(_Icon().Icon, {
        icon: this.props.icon,
        title: options[0].label,
        className: this.props.className
      }));
    } else {
      const placeholder = React.createElement(_Icon().Icon, {
        icon: this.props.icon,
        title: this.props.nameIfManyTasks
      });
      return (// $FlowFixMe(>=0.53.0) Flow suppress
        React.createElement(_Dropdown().Dropdown, {
          isFlat: true,
          options: options,
          placeholder: placeholder,
          size: "xs",
          onChange: task => task != null && task.run(this.props.proc)
        })
      );
    }
  }

}

exports.ProcessTaskButton = ProcessTaskButton;