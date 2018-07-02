"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchesFilter = matchesFilter;
exports.filterName = filterName;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const SPECIAL_CHARACTERS = './@_';

function formatFilter(filter) {
  let result = filter;

  for (let i = 0; i < SPECIAL_CHARACTERS.length; i++) {
    const char = SPECIAL_CHARACTERS.charAt(i);
    result = result.replace(char, '\\' + char);
  }

  return result;
}

function matchesFilter(name, filter) {
  return name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
}

function filterName(name, filter, isSelected) {
  if (filter.length) {
    const classes = (0, _classnames().default)({
      'nuclide-file-tree-entry-highlight': true,
      'text-highlight': !isSelected
    });
    return name.split(new RegExp(`(?:(?=${formatFilter(filter)}))`, 'ig')).map((text, i) => {
      if (matchesFilter(text, filter)) {
        return React.createElement("span", {
          key: filter + i
        }, React.createElement("span", {
          className: classes
        }, text.substr(0, filter.length)), React.createElement("span", null, text.substr(filter.length)));
      }

      return React.createElement("span", {
        key: filter + i
      }, text);
    });
  }

  return name;
}