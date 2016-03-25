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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY29yZFZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7SUFNZixVQUFVO1lBQVYsVUFBVTs7V0FBVixVQUFVOzBCQUFWLFVBQVU7OytCQUFWLFVBQVU7OztlQUFWLFVBQVU7O1dBR3ZCLGtCQUFpQjtVQUNkLE1BQU0sR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFwQixNQUFNOztBQUNiLFVBQU0sT0FBTyxHQUFHLENBQ2QsdUJBQXVCLGFBQ2QsTUFBTSxDQUFDLEtBQUssQ0FDdEIsQ0FBQzs7QUFFRixVQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDckMsVUFBTSxJQUFJLEdBQUcsUUFBUSxHQUFHLDRDQUFNLFNBQVMsaUJBQWUsUUFBUSxBQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7O0FBRTVFLGFBQ0U7O1VBQUssU0FBUyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEFBQUM7UUFDL0IsSUFBSTtRQUNKLGFBQWEsQ0FBQyxNQUFNLENBQUM7T0FDbEIsQ0FDTjtLQUNIOzs7U0FuQmtCLFVBQVU7R0FBUyxvQkFBTSxTQUFTOztxQkFBbEMsVUFBVTs7QUF1Qi9CLFNBQVMsYUFBYSxDQUFDLE1BQWMsRUFBZ0I7O0FBRW5ELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDO0FBQ2hDLFNBQU87OztJQUFNLElBQUk7R0FBTyxDQUFDO0NBQzFCOztBQUVELFNBQVMsV0FBVyxDQUFDLE1BQWMsRUFBVztBQUM1QyxVQUFRLE1BQU0sQ0FBQyxLQUFLO0FBQ2xCLFNBQUssTUFBTTtBQUNULGFBQU8sTUFBTSxDQUFDO0FBQUEsQUFDaEIsU0FBSyxTQUFTO0FBQ1osYUFBTyxPQUFPLENBQUM7QUFBQSxBQUNqQixTQUFLLE9BQU87QUFDVixhQUFPLE1BQU0sQ0FBQztBQUFBLEdBQ2pCO0NBQ0YiLCJmaWxlIjoiUmVjb3JkVmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtSZWNvcmR9IGZyb20gJy4vdHlwZXMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHJlY29yZDogUmVjb3JkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVjb3JkVmlldyBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7cmVjb3JkfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgY2xhc3NlcyA9IFtcbiAgICAgICdudWNsaWRlLW91dHB1dC1yZWNvcmQnLFxuICAgICAgYGxldmVsLSR7cmVjb3JkLmxldmVsfWAsXG4gICAgXTtcblxuICAgIGNvbnN0IGljb25OYW1lID0gZ2V0SWNvbk5hbWUocmVjb3JkKTtcbiAgICBjb25zdCBpY29uID0gaWNvbk5hbWUgPyA8c3BhbiBjbGFzc05hbWU9e2BpY29uIGljb24tJHtpY29uTmFtZX1gfSAvPiA6IG51bGw7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e2NsYXNzZXMuam9pbignICcpfT5cbiAgICAgICAge2ljb259XG4gICAgICAgIHtyZW5kZXJDb250ZW50KHJlY29yZCl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZnVuY3Rpb24gcmVuZGVyQ29udGVudChyZWNvcmQ6IFJlY29yZCk6IFJlYWN0RWxlbWVudCB7XG4gIC8vIElmIHRoZXJlJ3Mgbm90IHRleHQsIHVzZSBhIHNwYWNlIHRvIG1ha2Ugc3VyZSB0aGUgcm93IGRvZXNuJ3QgY29sbGFwc2UuXG4gIGNvbnN0IHRleHQgPSByZWNvcmQudGV4dCB8fCAnICc7XG4gIHJldHVybiA8cHJlPnt0ZXh0fTwvcHJlPjtcbn1cblxuZnVuY3Rpb24gZ2V0SWNvbk5hbWUocmVjb3JkOiBSZWNvcmQpOiA/c3RyaW5nIHtcbiAgc3dpdGNoIChyZWNvcmQubGV2ZWwpIHtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAnaW5mbyc7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICByZXR1cm4gJ2FsZXJ0JztcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gJ3N0b3AnO1xuICB9XG59XG4iXX0=