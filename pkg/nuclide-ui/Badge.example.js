"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BadgeExamples = void 0;

var React = _interopRequireWildcard(require("react"));

function _Block() {
  const data = require("../../modules/nuclide-commons-ui/Block");

  _Block = function () {
    return data;
  };

  return data;
}

function _Badge() {
  const data = require("./Badge");

  _Badge = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const BadgeBasicExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Badge().Badge, {
  value: 1
}), " ", React.createElement(_Badge().Badge, {
  value: 11
}), " ", React.createElement(_Badge().Badge, {
  value: 123
})));

const BadgeColorExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, "Info: ", React.createElement(_Badge().Badge, {
  color: _Badge().BadgeColors.info,
  value: 123
})), React.createElement(_Block().Block, null, "Success: ", React.createElement(_Badge().Badge, {
  color: _Badge().BadgeColors.success,
  value: 123
})), React.createElement(_Block().Block, null, "Warning: ", React.createElement(_Badge().Badge, {
  color: _Badge().BadgeColors.warning,
  value: 123
})), React.createElement(_Block().Block, null, "Error: ", React.createElement(_Badge().Badge, {
  color: _Badge().BadgeColors.error,
  value: 123
})));

const BadgeSizeExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, "Small: ", React.createElement(_Badge().Badge, {
  size: _Badge().BadgeSizes.small,
  value: 123
})), React.createElement(_Block().Block, null, "Medium: ", React.createElement(_Badge().Badge, {
  size: _Badge().BadgeSizes.medium,
  value: 123
})), React.createElement(_Block().Block, null, "Large: ", React.createElement(_Badge().Badge, {
  size: _Badge().BadgeSizes.large,
  value: 123
})));

const BadgeIconExample = () => React.createElement("div", null, React.createElement(_Block().Block, null, React.createElement(_Badge().Badge, {
  icon: "gear",
  value: 13
}), ' ', React.createElement(_Badge().Badge, {
  icon: "cloud-download",
  color: _Badge().BadgeColors.info,
  value: 23
}), ' ', React.createElement(_Badge().Badge, {
  icon: "octoface",
  color: _Badge().BadgeColors.success,
  value: 42
})));

const BadgeExamples = {
  sectionName: 'Badges',
  description: 'Badges are typically used to display numbers.',
  examples: [{
    title: 'Basic badges',
    component: BadgeBasicExample
  }, {
    title: 'Colored badges',
    component: BadgeColorExample
  }, {
    title: 'Badges with explicit size',
    component: BadgeSizeExample
  }, {
    title: 'Badges with Icons',
    component: BadgeIconExample
  }]
};
exports.BadgeExamples = BadgeExamples;