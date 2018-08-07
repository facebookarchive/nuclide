"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getHiddenTopics = getHiddenTopics;
exports.setHiddenTopics = setHiddenTopics;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
function getHiddenTopics() {
  const topics = _featureConfig().default.get('nuclide-welcome-page.hiddenTopics');

  return new Set(topics);
}

function setHiddenTopics(hiddenTopics) {
  _featureConfig().default.set('nuclide-welcome-page.hiddenTopics', Array.from(hiddenTopics));
}