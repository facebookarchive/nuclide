'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _reactForAtom = require('react-for-atom');

var _HandlesTableComponent;

function _load_HandlesTableComponent() {
  return _HandlesTableComponent = _interopRequireDefault(require('./HandlesTableComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let ChildProcessTreeComponent = class ChildProcessTreeComponent extends _reactForAtom.React.Component {

  render() {
    const childProcessesTree = this.props.childProcessesTree;

    if (!childProcessesTree) {
      return _reactForAtom.React.createElement('div', null);
    }

    const handles = [];
    flatten(handles, childProcessesTree, 0);

    return _reactForAtom.React.createElement(
      'div',
      null,
      _reactForAtom.React.createElement((_HandlesTableComponent || _load_HandlesTableComponent()).default, {
        title: 'Process tree',
        handles: handles,
        keyed: (_ref) => {
          let process = _ref.process,
              level = _ref.level;
          return '\u00A0'.repeat(level * 3) + process.pid;
        },
        columns: [{
          title: 'CPU %',
          value: (_ref2) => {
            let process = _ref2.process,
                level = _ref2.level;
            return process.cpuPercentage;
          },
          widthPercentage: 5
        }, {
          title: 'In',
          value: (_ref3) => {
            let process = _ref3.process;
            return process.ioBytesStats && process.ioBytesStats.stdin;
          },
          widthPercentage: 3
        }, {
          title: 'Out',
          value: (_ref4) => {
            let process = _ref4.process;
            return process.ioBytesStats && process.ioBytesStats.stdout;
          },
          widthPercentage: 3
        }, {
          title: 'Err',
          value: (_ref5) => {
            let process = _ref5.process;
            return process.ioBytesStats && process.ioBytesStats.stderr;
          },
          widthPercentage: 3
        }, {
          title: 'Command',
          value: (_ref6) => {
            let process = _ref6.process,
                level = _ref6.level;
            return process.command;
          },
          widthPercentage: 56
        }]
      })
    );
  }
};
exports.default = ChildProcessTreeComponent;


function flatten(handles, process, level) {
  handles.push({ process: process, level: level });
  process.children.forEach(child => flatten(handles, child, level + 1));
}
module.exports = exports['default'];