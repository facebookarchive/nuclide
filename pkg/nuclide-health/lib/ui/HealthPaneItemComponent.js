'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

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

var _CommandsSectionComponent;

function _load_CommandsSectionComponent() {
  return _CommandsSectionComponent = _interopRequireDefault(require('./sections/CommandsSectionComponent'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class HealthPaneItemComponent extends _react.Component {
  render() {
    const sections = {
      Stats: _react.createElement((_BasicStatsSectionComponent || _load_BasicStatsSectionComponent()).default, this.props),
      Subprocesses: _react.createElement((_ChildProcessTreeComponent || _load_ChildProcessTreeComponent()).default, {
        childProcessesTree: this.props.childProcessesTree
      }),
      Handles: _react.createElement((_ActiveHandlesSectionComponent || _load_ActiveHandlesSectionComponent()).default, {
        activeHandlesByType: this.props.activeHandlesByType
      }),
      Commands: _react.createElement((_CommandsSectionComponent || _load_CommandsSectionComponent()).default, null)
    };

    // For each section, we use settings-view to get a familiar look for table cells.
    return _react.createElement(
      'div',
      null,
      Object.keys(sections).map((title, s) => _react.createElement(
        'div',
        { className: 'nuclide-health-pane-item-section', key: s },
        _react.createElement(
          'h2',
          null,
          title
        ),
        _react.createElement(
          'div',
          { className: 'settings-view' },
          sections[title]
        )
      ))
    );
  }
}
exports.default = HealthPaneItemComponent;