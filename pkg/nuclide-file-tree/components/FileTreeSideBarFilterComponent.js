var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom = require('react-for-atom');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var FileTreeSidebarFilterComponent = (function (_React$Component) {
  _inherits(FileTreeSidebarFilterComponent, _React$Component);

  function FileTreeSidebarFilterComponent() {
    _classCallCheck(this, FileTreeSidebarFilterComponent);

    _get(Object.getPrototypeOf(FileTreeSidebarFilterComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FileTreeSidebarFilterComponent, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var filter = _props.filter;
      var found = _props.found;

      var classes = (0, _classnames2['default'])({
        'nuclide-file-tree-filter': true,
        'show': filter && filter.length,
        'not-found': !found
      });
      var text = 'search for: ' + filter;

      return _reactForAtom.React.createElement(
        'div',
        { className: classes },
        text
      );
    }
  }]);

  return FileTreeSidebarFilterComponent;
})(_reactForAtom.React.Component);

module.exports = FileTreeSidebarFilterComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlU2lkZUJhckZpbHRlckNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYU8sZ0JBQWdCOzswQkFDQSxZQUFZOzs7O0lBTzdCLDhCQUE4QjtZQUE5Qiw4QkFBOEI7O1dBQTlCLDhCQUE4QjswQkFBOUIsOEJBQThCOzsrQkFBOUIsOEJBQThCOzs7ZUFBOUIsOEJBQThCOztXQUc1QixrQkFBRzttQkFDaUIsSUFBSSxDQUFDLEtBQUs7VUFBM0IsTUFBTSxVQUFOLE1BQU07VUFBRSxLQUFLLFVBQUwsS0FBSzs7QUFFcEIsVUFBTSxPQUFPLEdBQUcsNkJBQVc7QUFDekIsa0NBQTBCLEVBQUUsSUFBSTtBQUNoQyxjQUFNLEVBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNO0FBQy9CLG1CQUFXLEVBQUUsQ0FBQyxLQUFLO09BQ3BCLENBQUMsQ0FBQztBQUNILFVBQU0sSUFBSSxvQkFBa0IsTUFBTSxBQUFFLENBQUM7O0FBRXJDLGFBQ0U7O1VBQUssU0FBUyxFQUFFLE9BQU8sQUFBQztRQUFFLElBQUk7T0FBTyxDQUNyQztLQUNIOzs7U0FoQkcsOEJBQThCO0dBQVMsb0JBQU0sU0FBUzs7QUFtQjVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsOEJBQThCLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVTaWRlQmFyRmlsdGVyQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtcbiAgUmVhY3QsXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuXG50eXBlIFByb3BzID0ge1xuICBmaWx0ZXI6IHN0cmluZztcbiAgZm91bmQ6IGJvb2xlYW47XG59O1xuXG5jbGFzcyBGaWxlVHJlZVNpZGViYXJGaWx0ZXJDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtmaWx0ZXIsIGZvdW5kfSA9IHRoaXMucHJvcHM7XG5cbiAgICBjb25zdCBjbGFzc2VzID0gY2xhc3NuYW1lcyh7XG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWUtZmlsdGVyJzogdHJ1ZSxcbiAgICAgICdzaG93JzogZmlsdGVyICYmIGZpbHRlci5sZW5ndGgsXG4gICAgICAnbm90LWZvdW5kJzogIWZvdW5kLFxuICAgIH0pO1xuICAgIGNvbnN0IHRleHQgPSBgc2VhcmNoIGZvcjogJHtmaWx0ZXJ9YDtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlc30+e3RleHR9PC9kaXY+XG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlU2lkZWJhckZpbHRlckNvbXBvbmVudDtcbiJdfQ==