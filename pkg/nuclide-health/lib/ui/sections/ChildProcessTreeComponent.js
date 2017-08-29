'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

var _HandlesTableComponent;

function _load_HandlesTableComponent() {
  return _HandlesTableComponent = _interopRequireDefault(require('./HandlesTableComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ChildProcessTreeComponent extends _react.Component {
  render() {
    const { childProcessesTree } = this.props;
    if (!childProcessesTree) {
      return _react.createElement('div', null);
    }

    const handles = [];
    flatten(handles, childProcessesTree, 0);

    return _react.createElement(
      'div',
      null,
      _react.createElement((_HandlesTableComponent || _load_HandlesTableComponent()).default, {
        title: 'Process tree',
        handles: handles,
        keyed: ({ process, level }) => '\u00A0'.repeat(level * 3) + process.pid,
        columns: [{
          title: 'CPU %',
          value: ({ process, level }) => process.cpuPercentage,
          widthPercentage: 5
        }, {
          title: 'In',
          value: ({ process }) => process.ioBytesStats && process.ioBytesStats.stdin,
          widthPercentage: 3
        }, {
          title: 'Out',
          value: ({ process }) => process.ioBytesStats && process.ioBytesStats.stdout,
          widthPercentage: 3
        }, {
          title: 'Err',
          value: ({ process }) => process.ioBytesStats && process.ioBytesStats.stderr,
          widthPercentage: 3
        }, {
          title: 'Command',
          value: ({ process, level }) => process.command,
          widthPercentage: 56
        }]
      })
    );
  }
}

exports.default = ChildProcessTreeComponent; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */

function flatten(handles, process, level) {
  handles.push({ process, level });
  process.children.forEach(child => flatten(handles, child, level + 1));
}