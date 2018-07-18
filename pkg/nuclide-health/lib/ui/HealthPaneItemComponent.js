"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _BasicStatsSectionComponent() {
  const data = _interopRequireDefault(require("./sections/BasicStatsSectionComponent"));

  _BasicStatsSectionComponent = function () {
    return data;
  };

  return data;
}

function _ActiveHandlesSectionComponent() {
  const data = _interopRequireDefault(require("./sections/ActiveHandlesSectionComponent"));

  _ActiveHandlesSectionComponent = function () {
    return data;
  };

  return data;
}

function _ChildProcessTreeComponent() {
  const data = _interopRequireDefault(require("./sections/ChildProcessTreeComponent"));

  _ChildProcessTreeComponent = function () {
    return data;
  };

  return data;
}

function _CommandsSectionComponent() {
  const data = _interopRequireDefault(require("./sections/CommandsSectionComponent"));

  _CommandsSectionComponent = function () {
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
 *  strict-local
 * @format
 */
class HealthPaneItemComponent extends React.Component {
  render() {
    const sections = {
      Stats: React.createElement(_BasicStatsSectionComponent().default, this.props),
      Subprocesses: React.createElement(_ChildProcessTreeComponent().default, {
        childProcessesTree: this.props.childProcessesTree
      }),
      Handles: React.createElement(_ActiveHandlesSectionComponent().default, {
        activeHandlesByType: this.props.activeHandlesByType
      }),
      Commands: React.createElement(_CommandsSectionComponent().default, null)
    }; // For each section, we use settings-view to get a familiar look for table cells.

    return React.createElement("div", null, Object.keys(sections).map((title, s) => React.createElement("div", {
      className: "nuclide-health-pane-item-section",
      key: s
    }, React.createElement("h2", null, title), React.createElement("div", {
      className: "settings-view"
    }, sections[title]))));
  }

}

exports.default = HealthPaneItemComponent;