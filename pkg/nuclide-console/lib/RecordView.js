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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY29yZFZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5QkFhc0IsYUFBYTs7OzswQkFDWixZQUFZOzs7OzRCQUNmLGdCQUFnQjs7SUFNZixVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7OztlQUFWLFVBQVU7O1dBR3ZCLGtCQUFpQjtVQUNkLE1BQU0sR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFwQixNQUFNOztBQUNiLFVBQU0sVUFBVSxHQUFHLDZCQUNqQix3QkFBd0IsY0FDZixNQUFNLENBQUMsS0FBSyxJQUFJLEtBQUssQ0FBQSxFQUM5QjtBQUNFLGVBQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVM7QUFDbEMsZ0JBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVU7T0FDckMsQ0FDRixDQUFDOztBQUVGLFVBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNyQyxVQUFNLElBQUksR0FBRyxRQUFRLEdBQUcsNENBQU0sU0FBUyxpQkFBZSxRQUFRLEFBQUcsR0FBRyxHQUFHLElBQUksQ0FBQzs7QUFFNUUsYUFDRTs7VUFBSyxTQUFTLEVBQUUsVUFBVSxBQUFDO1FBQ3hCLElBQUk7UUFDSixhQUFhLENBQUMsTUFBTSxDQUFDO09BQ2xCLENBQ047S0FDSDs7O1NBdkJrQixVQUFVO0dBQVMsb0JBQU0sU0FBUzs7cUJBQWxDLFVBQVU7O0FBMkIvQixTQUFTLGFBQWEsQ0FBQyxNQUFjLEVBQWdCO0FBQ25ELE1BQUksTUFBTSxDQUFDLElBQUksS0FBSyxTQUFTLEVBQUU7QUFDN0IsV0FBTyw0REFBVyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksQUFBQyxFQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxBQUFDLEdBQUcsQ0FBQztHQUN0RTs7O0FBR0QsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUM7QUFDaEMsU0FBTzs7O0lBQU0sSUFBSTtHQUFPLENBQUM7Q0FDMUI7O0FBRUQsU0FBUyxXQUFXLENBQUMsTUFBYyxFQUFXO0FBQzVDLFVBQVEsTUFBTSxDQUFDLElBQUk7QUFDakIsU0FBSyxTQUFTO0FBQ1osYUFBTyxlQUFlLENBQUM7QUFBQSxBQUN6QixTQUFLLFVBQVU7QUFDYixhQUFPLGtCQUFrQixDQUFDO0FBQUEsR0FDN0I7QUFDRCxVQUFRLE1BQU0sQ0FBQyxLQUFLO0FBQ2xCLFNBQUssTUFBTTtBQUNULGFBQU8sTUFBTSxDQUFDO0FBQUEsQUFDaEIsU0FBSyxTQUFTO0FBQ1osYUFBTyxPQUFPLENBQUM7QUFBQSxBQUNqQixTQUFLLE9BQU87QUFDVixhQUFPLE1BQU0sQ0FBQztBQUFBLEdBQ2pCO0NBQ0YiLCJmaWxlIjoiUmVjb3JkVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQgQ29kZUJsb2NrIGZyb20gJy4vQ29kZUJsb2NrJztcbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICByZWNvcmQ6IFJlY29yZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlY29yZFZpZXcgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge3JlY29yZH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGNsYXNzTmFtZXMgPSBjbGFzc25hbWVzKFxuICAgICAgJ251Y2xpZGUtY29uc29sZS1yZWNvcmQnLFxuICAgICAgYGxldmVsLSR7cmVjb3JkLmxldmVsIHx8ICdsb2cnfWAsXG4gICAgICB7XG4gICAgICAgIHJlcXVlc3Q6IHJlY29yZC5raW5kID09PSAncmVxdWVzdCcsXG4gICAgICAgIHJlc3BvbnNlOiByZWNvcmQua2luZCA9PT0gJ3Jlc3BvbnNlJyxcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIGNvbnN0IGljb25OYW1lID0gZ2V0SWNvbk5hbWUocmVjb3JkKTtcbiAgICBjb25zdCBpY29uID0gaWNvbk5hbWUgPyA8c3BhbiBjbGFzc05hbWU9e2BpY29uIGljb24tJHtpY29uTmFtZX1gfSAvPiA6IG51bGw7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzTmFtZXN9PlxuICAgICAgICB7aWNvbn1cbiAgICAgICAge3JlbmRlckNvbnRlbnQocmVjb3JkKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiByZW5kZXJDb250ZW50KHJlY29yZDogUmVjb3JkKTogUmVhY3RFbGVtZW50IHtcbiAgaWYgKHJlY29yZC5raW5kID09PSAncmVxdWVzdCcpIHtcbiAgICByZXR1cm4gPENvZGVCbG9jayB0ZXh0PXtyZWNvcmQudGV4dH0gc2NvcGVOYW1lPXtyZWNvcmQuc2NvcGVOYW1lfSAvPjtcbiAgfVxuXG4gIC8vIElmIHRoZXJlJ3Mgbm90IHRleHQsIHVzZSBhIHNwYWNlIHRvIG1ha2Ugc3VyZSB0aGUgcm93IGRvZXNuJ3QgY29sbGFwc2UuXG4gIGNvbnN0IHRleHQgPSByZWNvcmQudGV4dCB8fCAnICc7XG4gIHJldHVybiA8cHJlPnt0ZXh0fTwvcHJlPjtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvbk5hbWUocmVjb3JkOiBSZWNvcmQpOiA/c3RyaW5nIHtcbiAgc3dpdGNoIChyZWNvcmQua2luZCkge1xuICAgIGNhc2UgJ3JlcXVlc3QnOlxuICAgICAgcmV0dXJuICdjaGV2cm9uLXJpZ2h0JztcbiAgICBjYXNlICdyZXNwb25zZSc6XG4gICAgICByZXR1cm4gJ2Fycm93LXNtYWxsLWxlZnQnO1xuICB9XG4gIHN3aXRjaCAocmVjb3JkLmxldmVsKSB7XG4gICAgY2FzZSAnaW5mbyc6XG4gICAgICByZXR1cm4gJ2luZm8nO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuICdhbGVydCc7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuICdzdG9wJztcbiAgfVxufVxuIl19