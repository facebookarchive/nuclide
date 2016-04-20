Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var WorkingSetNameAndSaveComponent = (function (_React$Component) {
  _inherits(WorkingSetNameAndSaveComponent, _React$Component);

  function WorkingSetNameAndSaveComponent(props) {
    _classCallCheck(this, WorkingSetNameAndSaveComponent);

    _get(Object.getPrototypeOf(WorkingSetNameAndSaveComponent.prototype), 'constructor', this).call(this, props);

    this.state = {
      name: props.initialName
    };

    this._trackName = this._trackName.bind(this);
    this._saveWorkingSet = this._saveWorkingSet.bind(this);
  }

  _createClass(WorkingSetNameAndSaveComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {}
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'render',
    value: function render() {
      var setNameText = undefined;
      if (this.state.name === '') {
        setNameText = _reactForAtom.React.createElement(
          'atom-panel',
          { 'class': 'nuclide-file-tree-working-set-name-missing' },
          'Name is missing'
        );
      }

      return _reactForAtom.React.createElement(
        'div',
        null,
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-file-tree-working-set-name-outline' },
          _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
            placeholderText: 'name',
            size: 'sm',
            className: 'nuclide-file-tree-working-set-name inline-block-tight',
            onDidChange: this._trackName,
            initialValue: this.props.initialName,
            onConfirm: this._saveWorkingSet,
            onCancel: this.props.onCancel
          })
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibButton.Button,
          {
            buttonType: _nuclideUiLibButton.ButtonTypes.SUCCESS,
            className: (0, _classnames2['default'])({
              'inline-block-tight': true,
              'disabled': this.state.name === '',
              'nuclide-file-tree-toolbar-icon': true
            }),
            onClick: this._saveWorkingSet },
          _reactForAtom.React.createElement('span', { className: 'icon icon-check nuclide-file-tree-toolbar-icon' })
        ),
        setNameText
      );
    }
  }, {
    key: '_trackName',
    value: function _trackName(text) {
      this.setState({ name: text });
    }
  }, {
    key: '_saveWorkingSet',
    value: function _saveWorkingSet() {
      if (this.state.name === '') {
        atom.notifications.addWarning('Name is missing', { detail: 'Please provide a name for the Working Set' });
        return;
      }

      if (this.props.isEditing) {
        this.props.onUpdate(this.props.initialName, this.state.name);
      } else {
        this.props.onSave(this.state.name);
      }
    }
  }]);

  return WorkingSetNameAndSaveComponent;
})(_reactForAtom.React.Component);

exports.WorkingSetNameAndSaveComponent = WorkingSetNameAndSaveComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBCQVd1QixZQUFZOzs7OzRCQUNmLGdCQUFnQjs7cUNBQ1osZ0NBQWdDOztrQ0FJakQsNkJBQTZCOztJQWN2Qiw4QkFBOEI7WUFBOUIsOEJBQThCOztBQUk5QixXQUpBLDhCQUE4QixDQUk3QixLQUFZLEVBQUU7MEJBSmYsOEJBQThCOztBQUt2QywrQkFMUyw4QkFBOEIsNkNBS2pDLEtBQUssRUFBRTs7QUFFYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsVUFBSSxFQUFFLEtBQUssQ0FBQyxXQUFXO0tBQ3hCLENBQUM7O0FBRUYsQUFBQyxRQUFJLENBQU8sVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3BELEFBQUMsUUFBSSxDQUFPLGVBQWUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMvRDs7ZUFiVSw4QkFBOEI7O1dBZXhCLDZCQUFTLEVBQ3pCOzs7V0FFbUIsZ0NBQVMsRUFDNUI7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUMxQixtQkFBVyxHQUNUOztZQUFZLFNBQU0sNENBQTRDOztTQUVqRCxBQUNkLENBQUM7T0FDSDs7QUFFRCxhQUNFOzs7UUFDRTs7WUFBSyxTQUFTLEVBQUMsNENBQTRDO1VBQ3pEO0FBQ0UsMkJBQWUsRUFBQyxNQUFNO0FBQ3RCLGdCQUFJLEVBQUMsSUFBSTtBQUNULHFCQUFTLEVBQUMsdURBQXVEO0FBQ2pFLHVCQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQUFBQztBQUM3Qix3QkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDO0FBQ3JDLHFCQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztBQUNoQyxvQkFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDO1lBQzlCO1NBQ0U7UUFDTjs7O0FBQ0Usc0JBQVUsRUFBRSxnQ0FBWSxPQUFPLEFBQUM7QUFDaEMscUJBQVMsRUFBRSw2QkFBVztBQUNwQixrQ0FBb0IsRUFBRSxJQUFJO0FBQzFCLHdCQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRTtBQUNsQyw4Q0FBZ0MsRUFBRSxJQUFJO2FBQ3ZDLENBQUMsQUFBQztBQUNILG1CQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztVQUM5Qiw0Q0FBTSxTQUFTLEVBQUMsZ0RBQWdELEdBQUc7U0FDNUQ7UUFDUixXQUFXO09BQ1IsQ0FDTjtLQUNIOzs7V0FFUyxvQkFBQyxJQUFZLEVBQVE7QUFDN0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUMxQixZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FDM0IsaUJBQWlCLEVBQ2pCLEVBQUMsTUFBTSxFQUFFLDJDQUEyQyxFQUFDLENBQ3RELENBQUM7QUFDRixlQUFPO09BQ1I7O0FBRUQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN4QixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlELE1BQU07QUFDTCxZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3BDO0tBQ0Y7OztTQTdFVSw4QkFBOEI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21JbnB1dCc7XG5pbXBvcnQge1xuICBCdXR0b24sXG4gIEJ1dHRvblR5cGVzLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuXG50eXBlIFByb3BzID0ge1xuICBpc0VkaXRpbmc6IGJvb2xlYW47XG4gIGluaXRpYWxOYW1lOiBzdHJpbmc7XG4gIG9uVXBkYXRlOiAocHJldk5hbWU6IHN0cmluZywgbmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICBvblNhdmU6IChuYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uQ2FuY2VsOiAoKSA9PiB2b2lkO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xufTtcblxuZXhwb3J0IGNsYXNzIFdvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBuYW1lOiBwcm9wcy5pbml0aWFsTmFtZSxcbiAgICB9O1xuXG4gICAgKHRoaXM6IGFueSkuX3RyYWNrTmFtZSA9IHRoaXMuX3RyYWNrTmFtZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9zYXZlV29ya2luZ1NldCA9IHRoaXMuX3NhdmVXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBzZXROYW1lVGV4dDtcbiAgICBpZiAodGhpcy5zdGF0ZS5uYW1lID09PSAnJykge1xuICAgICAgc2V0TmFtZVRleHQgPSAoXG4gICAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtbmFtZS1taXNzaW5nXCI+XG4gICAgICAgICAgTmFtZSBpcyBtaXNzaW5nXG4gICAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtbmFtZS1vdXRsaW5lXCI+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwibmFtZVwiXG4gICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtbmFtZSBpbmxpbmUtYmxvY2stdGlnaHRcIlxuICAgICAgICAgICAgb25EaWRDaGFuZ2U9e3RoaXMuX3RyYWNrTmFtZX1cbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsTmFtZX1cbiAgICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5fc2F2ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIGJ1dHRvblR5cGU9e0J1dHRvblR5cGVzLlNVQ0NFU1N9XG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAgICdpbmxpbmUtYmxvY2stdGlnaHQnOiB0cnVlLFxuICAgICAgICAgICAgJ2Rpc2FibGVkJzogdGhpcy5zdGF0ZS5uYW1lID09PSAnJyxcbiAgICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb24nOiB0cnVlLFxuICAgICAgICAgIH0pfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3NhdmVXb3JraW5nU2V0fT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tY2hlY2sgbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1pY29uXCIgLz5cbiAgICAgICAgPC9CdXR0b24+XG4gICAgICAgIHtzZXROYW1lVGV4dH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfdHJhY2tOYW1lKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe25hbWU6IHRleHR9KTtcbiAgfVxuXG4gIF9zYXZlV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5uYW1lID09PSAnJykge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICdOYW1lIGlzIG1pc3NpbmcnLFxuICAgICAgICB7ZGV0YWlsOiAnUGxlYXNlIHByb3ZpZGUgYSBuYW1lIGZvciB0aGUgV29ya2luZyBTZXQnfSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaXNFZGl0aW5nKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVXBkYXRlKHRoaXMucHJvcHMuaW5pdGlhbE5hbWUsIHRoaXMuc3RhdGUubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMub25TYXZlKHRoaXMuc3RhdGUubmFtZSk7XG4gICAgfVxuICB9XG59XG4iXX0=