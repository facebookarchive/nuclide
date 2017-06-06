'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressComponent = undefined;

var _react = _interopRequireDefault(require('react'));

var _ProgressBar;

function _load_ProgressBar() {
  return _ProgressBar = require('nuclide-commons-ui/ProgressBar');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ProgressComponent extends _react.default.Component {

  render() {
    const { message, value, max } = this.props.phase;
    return _react.default.createElement(
      'div',
      null,
      message,
      ' (',
      value,
      ' / ',
      max,
      ')',
      _react.default.createElement(
        'div',
        { className: 'nuclide-refactorizer-progress' },
        _react.default.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, { value: value, max: max })
      )
    );
  }
}
exports.ProgressComponent = ProgressComponent; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */