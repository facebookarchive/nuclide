"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiffPreviewComponent = void 0;

function _FileChanges() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons-ui/FileChanges"));

  _FileChanges = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class DiffPreviewComponent extends React.Component {
  render() {
    const {
      diffs
    } = this.props.phase;
    return React.createElement("div", null, diffs.map((diff, i) => React.createElement(_FileChanges().default, {
      key: i,
      diff: diff
    })));
  }

}

exports.DiffPreviewComponent = DiffPreviewComponent;