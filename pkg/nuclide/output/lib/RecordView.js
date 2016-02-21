Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var RecordView = (function (_React$Component) {
  _inherits(RecordView, _React$Component);

  function RecordView() {
    _classCallCheck(this, RecordView);

    _get(Object.getPrototypeOf(RecordView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RecordView, [{
    key: 'render',
    value: function render() {
      var record = this.props.record;

      var classes = ['nuclide-output-record', 'level-' + record.level];

      var iconName = getIconName(record);
      var icon = iconName ? _reactForAtom.React.createElement('span', { className: 'icon icon-' + iconName }) : null;

      return _reactForAtom.React.createElement(
        'div',
        { className: classes.join(' ') },
        icon,
        renderContent(record)
      );
    }
  }]);

  return RecordView;
})(_reactForAtom.React.Component);

exports['default'] = RecordView;

function renderContent(record) {
  // If there's not text, use a space to make sure the row doesn't collapse.
  var text = record.text || ' ';
  return _reactForAtom.React.createElement(
    'pre',
    null,
    text
  );
}

function getIconName(record) {
  switch (record.level) {
    case 'info':
      return 'info';
    case 'warning':
      return 'alert';
    case 'error':
      return 'stop';
  }
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY29yZFZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFlb0IsZ0JBQWdCOztJQU1mLFVBQVU7WUFBVixVQUFVOztXQUFWLFVBQVU7MEJBQVYsVUFBVTs7K0JBQVYsVUFBVTs7O2VBQVYsVUFBVTs7V0FFdkIsa0JBQWlCO1VBQ2QsTUFBTSxHQUFJLElBQUksQ0FBQyxLQUFLLENBQXBCLE1BQU07O0FBQ2IsVUFBTSxPQUFPLEdBQUcsQ0FDZCx1QkFBdUIsYUFDZCxNQUFNLENBQUMsS0FBSyxDQUN0QixDQUFDOztBQUVGLFVBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyQyxVQUFNLElBQUksR0FBRyxRQUFRLEdBQUcsNENBQU0sU0FBUyxpQkFBZSxRQUFRLEFBQUcsR0FBRyxHQUFHLElBQUksQ0FBQzs7QUFFNUUsYUFDRTs7VUFBSyxTQUFTLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQUFBQztRQUMvQixJQUFJO1FBQ0osYUFBYSxDQUFDLE1BQU0sQ0FBQztPQUNsQixDQUNOO0tBQ0g7OztTQWxCa0IsVUFBVTtHQUFTLG9CQUFNLFNBQVM7O3FCQUFsQyxVQUFVOztBQXNCL0IsU0FBUyxhQUFhLENBQUMsTUFBYyxFQUFnQjs7QUFFbkQsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7QUFDaEMsU0FBTzs7O0lBQU0sSUFBSTtHQUFPLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxXQUFXLENBQUMsTUFBYyxFQUFXO0FBQzVDLFVBQVEsTUFBTSxDQUFDLEtBQUs7QUFDbEIsU0FBSyxNQUFNO0FBQ1QsYUFBTyxNQUFNLENBQUM7QUFBQSxBQUNoQixTQUFLLFNBQVM7QUFDWixhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCLFNBQUssT0FBTztBQUNWLGFBQU8sTUFBTSxDQUFDO0FBQUEsR0FDakI7Q0FDRiIsImZpbGUiOiJSZWNvcmRWaWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgdHlwZSB7UmVjb3JkfSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICByZWNvcmQ6IFJlY29yZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cmVjb3JkfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgY2xhc3NlcyA9IFtcbiAgICAgICdudWNsaWRlLW91dHB1dC1yZWNvcmQnLFxuICAgICAgYGxldmVsLSR7cmVjb3JkLmxldmVsfWAsXG4gICAgXTtcblxuICAgIGNvbnN0IGljb25OYW1lID0gZ2V0SWNvbk5hbWUocmVjb3JkKTtcbiAgICBjb25zdCBpY29uID0gaWNvbk5hbWUgPyA8c3BhbiBjbGFzc05hbWU9e2BpY29uIGljb24tJHtpY29uTmFtZX1gfSAvPiA6IG51bGw7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXMuam9pbignICcpfT5cbiAgICAgICAge2ljb259XG4gICAgICAgIHtyZW5kZXJDb250ZW50KHJlY29yZCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29udGVudChyZWNvcmQ6IFJlY29yZCk6IFJlYWN0RWxlbWVudCB7XG4gIC8vIElmIHRoZXJlJ3Mgbm90IHRleHQsIHVzZSBhIHNwYWNlIHRvIG1ha2Ugc3VyZSB0aGUgcm93IGRvZXNuJ3QgY29sbGFwc2UuXG4gIGNvbnN0IHRleHQgPSByZWNvcmQudGV4dCB8fCAnICc7XG4gIHJldHVybiA8cHJlPnt0ZXh0fTwvcHJlPjtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvbk5hbWUocmVjb3JkOiBSZWNvcmQpOiA/c3RyaW5nIHtcbiAgc3dpdGNoIChyZWNvcmQubGV2ZWwpIHtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICByZXR1cm4gJ2FsZXJ0JztcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gJ3N0b3AnO1xuICB9XG59XG4iXX0=