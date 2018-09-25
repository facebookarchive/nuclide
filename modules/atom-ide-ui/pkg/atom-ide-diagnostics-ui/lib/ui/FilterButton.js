"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FilterButton;

function _Button() {
  const data = require("../../../../../nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

function GroupUtils() {
  const data = _interopRequireWildcard(require("../GroupUtils"));

  GroupUtils = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
function FilterButton(props) {
  const {
    selected,
    group
  } = props;
  const displayName = GroupUtils().getDisplayName(group);
  const title = props.selected ? `Hide ${displayName}` : `Show ${displayName}`;
  return React.createElement(_Button().Button, {
    icon: GroupUtils().getIcon(group),
    size: _Button().ButtonSizes.SMALL,
    selected: selected,
    onClick: props.onClick,
    tooltip: {
      title
    }
  });
}