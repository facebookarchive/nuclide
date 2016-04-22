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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlRmlsdGVySGVscGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OzBCQWN1QixZQUFZOzs7Ozs7Ozs7Ozs7ZUFEL0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUQzQixLQUFLLFlBQUwsS0FBSzs7QUFJUCxJQUFNLGtCQUFrQixHQUFHLE1BQU0sQ0FBQzs7QUFFbEMsU0FBUyxZQUFZLENBQUMsTUFBTSxFQUFFO0FBQzVCLE1BQUksTUFBTSxHQUFHLE1BQU0sQ0FBQzs7QUFFcEIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNsRCxRQUFNLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUMsVUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztHQUM1Qzs7QUFFRCxTQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELFNBQVMsYUFBYSxDQUFDLElBQVksRUFBRSxNQUFjLEVBQVc7QUFDNUQsU0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0NBQ2hFOztBQUVELFNBQVMsVUFBVSxDQUFDLElBQVksRUFBRSxNQUFjLEVBQUUsVUFBbUIsRUFBUztBQUM1RSxNQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7O0FBQ2pCLFVBQU0sT0FBTyxHQUFHLDZCQUFXO0FBQ3pCLDJDQUFtQyxFQUFFLElBQUk7QUFDekMsd0JBQWdCLEVBQUUsQ0FBQyxVQUFVO09BQzlCLENBQUMsQ0FBQzs7QUFFSDtXQUFPLElBQUksQ0FDUixLQUFLLENBQUMsSUFBSSxNQUFNLFlBQVUsWUFBWSxDQUFDLE1BQU0sQ0FBQyxTQUFNLElBQUksQ0FBQyxDQUFDLENBQzFELEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBRSxDQUFDLEVBQUs7QUFDaEIsY0FBSSxhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFO0FBQy9CLG1CQUNFOztnQkFBTSxHQUFHLEVBQUUsTUFBTSxHQUFHLENBQUMsQUFBQztjQUNwQjs7a0JBQU0sU0FBUyxFQUFFLE9BQU8sQUFBQztnQkFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztlQUN6QjtjQUNQOzs7Z0JBQ0csSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO2VBQ3RCO2FBQ0YsQ0FDUDtXQUNIO0FBQ0QsaUJBQ0U7O2NBQU0sR0FBRyxFQUFFLE1BQU0sR0FBRyxDQUFDLEFBQUM7WUFDbkIsSUFBSTtXQUNBLENBQ1A7U0FDSCxDQUFDO1FBQUM7Ozs7R0FDTjtBQUNELFNBQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLFlBQVUsRUFBVixVQUFVO0FBQ1YsZUFBYSxFQUFiLGFBQWE7Q0FDZCxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlRmlsdGVySGVscGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1xuICBSZWFjdCxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbmNvbnN0IFNQRUNJQUxfQ0hBUkFDVEVSUyA9ICcuL0BfJztcblxuZnVuY3Rpb24gZm9ybWF0RmlsdGVyKGZpbHRlcikge1xuICBsZXQgcmVzdWx0ID0gZmlsdGVyO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgU1BFQ0lBTF9DSEFSQUNURVJTLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY2hhciA9IFNQRUNJQUxfQ0hBUkFDVEVSUy5jaGFyQXQoaSk7XG4gICAgcmVzdWx0ID0gcmVzdWx0LnJlcGxhY2UoY2hhciwgJ1xcXFwnICsgY2hhcik7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBtYXRjaGVzRmlsdGVyKG5hbWU6IHN0cmluZywgZmlsdGVyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKGZpbHRlci50b0xvd2VyQ2FzZSgpKSAhPT0gLTE7XG59XG5cbmZ1bmN0aW9uIGZpbHRlck5hbWUobmFtZTogc3RyaW5nLCBmaWx0ZXI6IHN0cmluZywgaXNTZWxlY3RlZDogYm9vbGVhbik6IG1peGVkIHtcbiAgaWYgKGZpbHRlci5sZW5ndGgpIHtcbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NuYW1lcyh7XG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtZW50cnktaGlnaGxpZ2h0JzogdHJ1ZSxcbiAgICAgICd0ZXh0LWhpZ2hsaWdodCc6ICFpc1NlbGVjdGVkLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIG5hbWVcbiAgICAgIC5zcGxpdChuZXcgUmVnRXhwKGAoPzooPz0ke2Zvcm1hdEZpbHRlcihmaWx0ZXIpfSkpYCwgJ2lnJykpXG4gICAgICAubWFwKCh0ZXh0LCBpKSA9PiB7XG4gICAgICAgIGlmIChtYXRjaGVzRmlsdGVyKHRleHQsIGZpbHRlcikpIHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHNwYW4ga2V5PXtmaWx0ZXIgKyBpfT5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtjbGFzc2VzfT5cbiAgICAgICAgICAgICAgICB7dGV4dC5zdWJzdHIoMCwgZmlsdGVyLmxlbmd0aCl9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4+XG4gICAgICAgICAgICAgICAge3RleHQuc3Vic3RyKGZpbHRlci5sZW5ndGgpfVxuICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzcGFuIGtleT17ZmlsdGVyICsgaX0+XG4gICAgICAgICAgICB7dGV4dH1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgfVxuICByZXR1cm4gbmFtZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGZpbHRlck5hbWUsXG4gIG1hdGNoZXNGaWx0ZXIsXG59O1xuIl19