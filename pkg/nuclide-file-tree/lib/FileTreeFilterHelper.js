function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('react-for-atom');

var React = _require.React;

var SPECIAL_CHARACTERS = './@_';

function formatFilter(filter) {
  var result = filter;

  for (var i = 0; i < SPECIAL_CHARACTERS.length; i++) {
    var char = SPECIAL_CHARACTERS.charAt(i);
    result = result.replace(char, '\\' + char);
  }

  return result;
}

function matchesFilter(name, filter) {
  return name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
}

function filterName(name, filter, isSelected) {
  if (filter.length) {
    var _ret = (function () {
      var classes = (0, _classnames2['default'])({
        'nuclide-file-tree-entry-highlight': true,
        'text-highlight': !isSelected
      });

      return {
        v: name.split(new RegExp('(?:(?=' + formatFilter(filter) + '))', 'ig')).map(function (text, i) {
          if (matchesFilter(text, filter)) {
            return React.createElement(
              'span',
              { key: filter + i },
              React.createElement(
                'span',
                { className: classes },
                text.substr(0, filter.length)
              ),
              React.createElement(
                'span',
                null,
                text.substr(filter.length)
              )
            );
          }
          return React.createElement(
            'span',
            { key: filter + i },
            text
          );
        })
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  }
  return name;
}

module.exports = {
  filterName: filterName,
  matchesFilter: matchesFilter
};