'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BreakpointsView = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireWildcard(require('react'));

var _BreakpointListComponent;

function _load_BreakpointListComponent() {
  return _BreakpointListComponent = require('./BreakpointListComponent');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BreakpointsView extends _react.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { model } = this.props;
    const actions = model.getActions();

    return _react.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)('nuclide-debugger-container-new', 'nuclide-debugger-breakpoint-list') },
      _react.createElement(
        'div',
        { className: 'nuclide-debugger-pane-content ' },
        _react.createElement((_BreakpointListComponent || _load_BreakpointListComponent()).BreakpointListComponent, {
          actions: actions,
          breakpointStore: model.getBreakpointStore()
        })
      )
    );
  }
}
exports.BreakpointsView = BreakpointsView; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            * @format
                                            */