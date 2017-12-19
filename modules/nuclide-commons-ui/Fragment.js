'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// TODO: T23460026 Use the JSX construct for this exact component when it is published.
class Fragment extends _react.Component {
  render() {
    return this.props.children;
  }
}
exports.default = Fragment; /**
                             * Copyright (c) 2017-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the BSD-style license found in the
                             * LICENSE file in the root directory of this source tree. An additional grant
                             * of patent rights can be found in the PATENTS file in the same directory.
                             *
                             * 
                             * @format
                             */