'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _classnames;













function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}
var _react = _interopRequireWildcard(require('react'));var _BreakpointListComponent;
function _load_BreakpointListComponent() {return _BreakpointListComponent = _interopRequireDefault(require('./BreakpointListComponent'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         *  strict-local
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         */class BreakpointsView extends _react.PureComponent {render() {const { service } = this.props;return (
      _react.createElement('div', {
          className: (0, (_classnames || _load_classnames()).default)(
          'debugger-container-new',
          'debugger-breakpoint-list') },

        _react.createElement('div', { className: 'debugger-pane-content ' },
          _react.createElement((_BreakpointListComponent || _load_BreakpointListComponent()).default, { service: service }))));



  }}exports.default = BreakpointsView;