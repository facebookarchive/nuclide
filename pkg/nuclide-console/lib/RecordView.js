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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _CodeBlock = require('./CodeBlock');

var _CodeBlock2 = _interopRequireDefault(_CodeBlock);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

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

      var classNames = (0, _classnames2['default'])('nuclide-console-record', 'level-' + (record.level || 'log'), {
        request: record.kind === 'request',
        response: record.kind === 'response'
      });

      var iconName = getIconName(record);
      var icon = iconName ? _reactForAtom.React.createElement('span', { className: 'icon icon-' + iconName }) : null;

      return _reactForAtom.React.createElement(
        'div',
        { className: classNames },
        icon,
        renderContent(record)
      );
    }
  }]);

  return RecordView;
})(_reactForAtom.React.Component);

exports['default'] = RecordView;

function renderContent(record) {
  if (record.kind === 'request') {
    return _reactForAtom.React.createElement(_CodeBlock2['default'], { text: record.text, scopeName: record.scopeName });
  }

  // If there's not text, use a space to make sure the row doesn't collapse.
  var text = record.text || ' ';
  return _reactForAtom.React.createElement(
    'pre',
    null,
    text
  );
}

function getIconName(record) {
  switch (record.kind) {
    case 'request':
      return 'chevron-right';
    case 'response':
      return 'arrow-small-left';
  }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY29yZFZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5QkFhc0IsYUFBYTs7OzswQkFDWixZQUFZOzs7OzRCQUNmLGdCQUFnQjs7SUFNZixVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7OztlQUFWLFVBQVU7O1dBR3ZCLGtCQUFrQjtVQUNmLE1BQU0sR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFwQixNQUFNOztBQUNiLFVBQU0sVUFBVSxHQUFHLDZCQUNqQix3QkFBd0IsY0FDZixNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQSxFQUM5QjtBQUNFLGVBQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVM7QUFDbEMsZ0JBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVU7T0FDckMsQ0FDRixDQUFDOztBQUVGLFVBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyQyxVQUFNLElBQUksR0FBRyxRQUFRLEdBQUcsNENBQU0sU0FBUyxpQkFBZSxRQUFRLEFBQUcsR0FBRyxHQUFHLElBQUksQ0FBQzs7QUFFNUUsYUFDRTs7VUFBSyxTQUFTLEVBQUUsVUFBVSxBQUFDO1FBQ3hCLElBQUk7UUFDSixhQUFhLENBQUMsTUFBTSxDQUFDO09BQ2xCLENBQ047S0FDSDs7O1NBdkJrQixVQUFVO0dBQVMsb0JBQU0sU0FBUzs7cUJBQWxDLFVBQVU7O0FBMkIvQixTQUFTLGFBQWEsQ0FBQyxNQUFjLEVBQWlCO0FBQ3BELE1BQUksTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDN0IsV0FBTyw0REFBVyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQUFBQyxFQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxBQUFDLEdBQUcsQ0FBQztHQUN0RTs7O0FBR0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7QUFDaEMsU0FBTzs7O0lBQU0sSUFBSTtHQUFPLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxXQUFXLENBQUMsTUFBYyxFQUFXO0FBQzVDLFVBQVEsTUFBTSxDQUFDLElBQUk7QUFDakIsU0FBSyxTQUFTO0FBQ1osYUFBTyxlQUFlLENBQUM7QUFBQSxBQUN6QixTQUFLLFVBQVU7QUFDYixhQUFPLGtCQUFrQixDQUFDO0FBQUEsR0FDN0I7QUFDRCxVQUFRLE1BQU0sQ0FBQyxLQUFLO0FBQ2xCLFNBQUssTUFBTTtBQUNULGFBQU8sTUFBTSxDQUFDO0FBQUEsQUFDaEIsU0FBSyxTQUFTO0FBQ1osYUFBTyxPQUFPLENBQUM7QUFBQSxBQUNqQixTQUFLLE9BQU87QUFDVixhQUFPLE1BQU0sQ0FBQztBQUFBLEdBQ2pCO0NBQ0YiLCJmaWxlIjoiUmVjb3JkVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgQ29kZUJsb2NrIGZyb20gJy4vQ29kZUJsb2NrJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICByZWNvcmQ6IFJlY29yZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIGNvbnN0IHtyZWNvcmR9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBjbGFzc05hbWVzID0gY2xhc3NuYW1lcyhcbiAgICAgICdudWNsaWRlLWNvbnNvbGUtcmVjb3JkJyxcbiAgICAgIGBsZXZlbC0ke3JlY29yZC5sZXZlbCB8fCAnbG9nJ31gLFxuICAgICAge1xuICAgICAgICByZXF1ZXN0OiByZWNvcmQua2luZCA9PT0gJ3JlcXVlc3QnLFxuICAgICAgICByZXNwb25zZTogcmVjb3JkLmtpbmQgPT09ICdyZXNwb25zZScsXG4gICAgICB9LFxuICAgICk7XG5cbiAgICBjb25zdCBpY29uTmFtZSA9IGdldEljb25OYW1lKHJlY29yZCk7XG4gICAgY29uc3QgaWNvbiA9IGljb25OYW1lID8gPHNwYW4gY2xhc3NOYW1lPXtgaWNvbiBpY29uLSR7aWNvbk5hbWV9YH0gLz4gOiBudWxsO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWVzfT5cbiAgICAgICAge2ljb259XG4gICAgICAgIHtyZW5kZXJDb250ZW50KHJlY29yZCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29udGVudChyZWNvcmQ6IFJlY29yZCk6IFJlYWN0LkVsZW1lbnQge1xuICBpZiAocmVjb3JkLmtpbmQgPT09ICdyZXF1ZXN0Jykge1xuICAgIHJldHVybiA8Q29kZUJsb2NrIHRleHQ9e3JlY29yZC50ZXh0fSBzY29wZU5hbWU9e3JlY29yZC5zY29wZU5hbWV9IC8+O1xuICB9XG5cbiAgLy8gSWYgdGhlcmUncyBub3QgdGV4dCwgdXNlIGEgc3BhY2UgdG8gbWFrZSBzdXJlIHRoZSByb3cgZG9lc24ndCBjb2xsYXBzZS5cbiAgY29uc3QgdGV4dCA9IHJlY29yZC50ZXh0IHx8ICcgJztcbiAgcmV0dXJuIDxwcmU+e3RleHR9PC9wcmU+O1xufVxuXG5mdW5jdGlvbiBnZXRJY29uTmFtZShyZWNvcmQ6IFJlY29yZCk6ID9zdHJpbmcge1xuICBzd2l0Y2ggKHJlY29yZC5raW5kKSB7XG4gICAgY2FzZSAncmVxdWVzdCc6XG4gICAgICByZXR1cm4gJ2NoZXZyb24tcmlnaHQnO1xuICAgIGNhc2UgJ3Jlc3BvbnNlJzpcbiAgICAgIHJldHVybiAnYXJyb3ctc21hbGwtbGVmdCc7XG4gIH1cbiAgc3dpdGNoIChyZWNvcmQubGV2ZWwpIHtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICByZXR1cm4gJ2FsZXJ0JztcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gJ3N0b3AnO1xuICB9XG59XG4iXX0=