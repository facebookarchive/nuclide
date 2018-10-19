"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _reactRedux() {
  const data = require("react-redux");

  _reactRedux = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _TruncatedButton() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-ui/TruncatedButton"));

  _TruncatedButton = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class ProjectSelection extends React.PureComponent {
  componentDidUpdate() {
    this.props.remeasureHeight();
  }

  render() {
    // The only time we re-render is when this prop changes, so no need to memoize this. If this
    // component had a bunch of other props, the story might be different.
    const renderedExtraContent = this.props.extraContent.isEmpty() ? null : this.props.extraContent.toArray();
    return React.createElement("div", {
      className: "padded"
    }, React.createElement(_TruncatedButton().default, {
      onClick: () => this.runCommand('application:add-project-folder'),
      icon: "device-desktop",
      label: "Add Local Folder"
    }), React.createElement(_TruncatedButton().default, {
      onClick: () => this.runCommand('nuclide-remote-projects:connect'),
      icon: "cloud-upload",
      label: "Add Remote Folder"
    }), renderedExtraContent);
  }

  runCommand(command) {
    atom.commands.dispatch(atom.views.getView(atom.workspace), command);
  }

}

const mapStateToProps = state => ({
  extraContent: Selectors().getExtraProjectSelectionContent(state)
});

var _default = (0, _reactRedux().connect)(mapStateToProps, () => ({}))(ProjectSelection);

exports.default = _default;