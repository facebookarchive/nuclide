'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ProgressComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _ProgressBar;

function _load_ProgressBar() {
  return _ProgressBar = require('nuclide-commons-ui/ProgressBar');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class ProgressComponent extends _react.Component {
  render() {
    const { message, value, max } = this.props.phase;
    return _react.createElement(
      'div',
      null,
      message,
      ' (',
      value,
      ' / ',
      max,
      ')',
      _react.createElement(
        'div',
        { className: 'nuclide-refactorizer-progress' },
        _react.createElement((_ProgressBar || _load_ProgressBar()).ProgressBar, { value: value, max: max })
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