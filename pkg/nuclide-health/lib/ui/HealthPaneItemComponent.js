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

var _BasicStatsSectionComponent;

function _load_BasicStatsSectionComponent() {
  return _BasicStatsSectionComponent = _interopRequireDefault(require('./sections/BasicStatsSectionComponent'));
}

var _ActiveHandlesSectionComponent;

function _load_ActiveHandlesSectionComponent() {
  return _ActiveHandlesSectionComponent = _interopRequireDefault(require('./sections/ActiveHandlesSectionComponent'));
}

var _ChildProcessTreeComponent;

function _load_ChildProcessTreeComponent() {
  return _ChildProcessTreeComponent = _interopRequireDefault(require('./sections/ChildProcessTreeComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let HealthPaneItemComponent = class HealthPaneItemComponent extends _reactForAtom.React.Component {

  render() {

    const sections = {
      Stats: _reactForAtom.React.createElement((_BasicStatsSectionComponent || _load_BasicStatsSectionComponent()).default, this.props),
      Subprocesses: _reactForAtom.React.createElement((_ChildProcessTreeComponent || _load_ChildProcessTreeComponent()).default, { childProcessesTree: this.props.childProcessesTree }),
      Handles: _reactForAtom.React.createElement((_ActiveHandlesSectionComponent || _load_ActiveHandlesSectionComponent()).default, { activeHandlesByType: this.props.activeHandlesByType })
    };

    // For each section, we use settings-view to get a familiar look for table cells.
    return _reactForAtom.React.createElement(
      'div',
      null,
      Object.keys(sections).map((title, s) => _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-health-pane-item-section', key: s },
        _reactForAtom.React.createElement(
          'h2',
          null,
          title
        ),
        _reactForAtom.React.createElement(
          'div',
          { className: 'settings-view' },
          sections[title]
        )
      ))
    );
  }

};
exports.default = HealthPaneItemComponent;
module.exports = exports['default'];