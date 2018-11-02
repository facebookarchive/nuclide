"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getThemeChangeEvents = getThemeChangeEvents;
exports.getThemeColors = getThemeColors;

function _kebabCase2() {
  const data = _interopRequireDefault(require("lodash/kebabCase"));

  _kebabCase2 = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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
// TODO: This should be extracted to a separate module which can be shared by
// other packages.
const ID_PREFIX = 'nuclide-theme-detector';

function idFromColorName(colorName) {
  return `${ID_PREFIX}-${(0, _kebabCase2().default)(colorName)}`;
} // NOTE: Each of these keys must also be implemented as an ID-selector in this
// packages .less files. They must also be added to the `COLOR_NAMES` array below.


const COLOR_NAMES = ['backgroundColorHighlight', 'syntaxSelectionColor', 'syntaxCursorColor', 'syntaxGutterBackgroundColorSelected', 'syntaxTextColor', 'backgroundColorInfo'];

function getThemeChangeEvents() {
  return _rxjsCompatUmdMin.Observable.merge(atom.packages.hasActivatedInitialPackages() ? _rxjsCompatUmdMin.Observable.of(null) : _rxjsCompatUmdMin.Observable.empty(), (0, _event().observableFromSubscribeFunction)(cb => atom.packages.onDidActivateInitialPackages(cb)).mapTo(null), (0, _event().observableFromSubscribeFunction)(cb => atom.themes.onDidChangeActiveThemes(cb)) // TODO: It seems like the colors are not actually ready yet when
  // `onDidChangeActiveThemes` fires. Ideally we would figure out exactly
  // why and actually know when things are ready, but for now...
  .delay(100).mapTo(null));
}

function getThemeColors() {
  const tester = document.createElement('div'); // $FlowIgnore

  document.body.appendChild(tester); // $FlowIgnore

  const colors = {};
  COLOR_NAMES.forEach(colorName => {
    tester.id = idFromColorName(colorName);
    colors[colorName] = window.getComputedStyle(tester).backgroundColor;
  }); // $FlowIgnore

  document.body.removeChild(tester);
  return colors;
}