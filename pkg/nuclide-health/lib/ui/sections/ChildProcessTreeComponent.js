"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _HandlesTableComponent() {
  const data = _interopRequireDefault(require("./HandlesTableComponent"));

  _HandlesTableComponent = function () {
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
class ChildProcessTreeComponent extends React.Component {
  render() {
    const {
      childProcessesTree
    } = this.props;

    if (!childProcessesTree) {
      return React.createElement("div", null);
    }

    const handles = [];
    flatten(handles, childProcessesTree, 0);
    return React.createElement("div", null, React.createElement(_HandlesTableComponent().default, {
      title: "Process tree",
      handles: handles,
      keyed: ({
        process,
        level
      }) => '\u00A0'.repeat(level * 3) + process.pid,
      columns: [{
        title: 'CPU %',
        value: ({
          process,
          level
        }) => process.cpuPercentage,
        widthPercentage: 5
      }, {
        title: 'In',
        value: ({
          process
        }) => process.ioBytesStats && process.ioBytesStats.stdin,
        widthPercentage: 3
      }, {
        title: 'Out',
        value: ({
          process
        }) => process.ioBytesStats && process.ioBytesStats.stdout,
        widthPercentage: 3
      }, {
        title: 'Err',
        value: ({
          process
        }) => process.ioBytesStats && process.ioBytesStats.stderr,
        widthPercentage: 3
      }, {
        title: 'Command',
        value: ({
          process,
          level
        }) => process.command,
        widthPercentage: 56
      }]
    }));
  }

}

exports.default = ChildProcessTreeComponent;

function flatten(handles, process, level) {
  handles.push({
    process,
    level
  });
  process.children.forEach(child => flatten(handles, child, level + 1));
}