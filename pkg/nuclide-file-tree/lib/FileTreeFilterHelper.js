'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchesFilter = matchesFilter;
exports.filterName = filterName;

var _react = _interopRequireDefault(require('react'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
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
    const classes = (0, (_classnames || _load_classnames()).default)({
      'nuclide-file-tree-entry-highlight': true,
      'text-highlight': !isSelected
    });

    return name.split(new RegExp(`(?:(?=${formatFilter(filter)}))`, 'ig')).map((text, i) => {
      if (matchesFilter(text, filter)) {
        return _react.default.createElement(
          'span',
          { key: filter + i },
          _react.default.createElement(
            'span',
            { className: classes },
            text.substr(0, filter.length)
          ),
          _react.default.createElement(
            'span',
            null,
            text.substr(filter.length)
          )
        );
      }
      return _react.default.createElement(
        'span',
        { key: filter + i },
        text
      );
    });
  }
  return name;
}