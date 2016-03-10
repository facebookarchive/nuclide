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

/*eslint-disable react/prop-types */

var _reactForAtom = require('react-for-atom');

var _uiAtomInput = require('../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

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
          _reactForAtom.React.createElement(_uiAtomInput2['default'], {
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
          'button',
          {
            className: (0, _classnames2['default'])({
              'btn': true,
              'btn-success': true,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7MkJBQ2QscUJBQXFCOzs7OzBCQUNwQixZQUFZOzs7O0lBY3RCLDhCQUE4QjtZQUE5Qiw4QkFBOEI7O0FBSTlCLFdBSkEsOEJBQThCLENBSTdCLEtBQVksRUFBRTswQkFKZiw4QkFBOEI7O0FBS3ZDLCtCQUxTLDhCQUE4Qiw2Q0FLakMsS0FBSyxFQUFFOztBQUViLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxVQUFJLEVBQUUsS0FBSyxDQUFDLFdBQVc7S0FDeEIsQ0FBQzs7QUFFRixBQUFDLFFBQUksQ0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQUFBQyxRQUFJLENBQU8sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQy9EOztlQWJVLDhCQUE4Qjs7V0FleEIsNkJBQVMsRUFDekI7OztXQUVtQixnQ0FBUyxFQUM1Qjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLFdBQVcsWUFBQSxDQUFDO0FBQ2hCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQzFCLG1CQUFXLEdBQ1Q7O1lBQVksU0FBTSw0Q0FBNEM7O1NBRWpELEFBQ2QsQ0FBQztPQUNIOztBQUVELGFBQ0U7OztRQUNFOztZQUFLLFNBQVMsRUFBQyw0Q0FBNEM7VUFDekQ7QUFDRSwyQkFBZSxFQUFDLE1BQU07QUFDdEIsZ0JBQUksRUFBQyxJQUFJO0FBQ1QscUJBQVMsRUFBQyx1REFBdUQ7QUFDakUsdUJBQVcsRUFBRSxJQUFJLENBQUMsVUFBVSxBQUFDO0FBQzdCLHdCQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEFBQUM7QUFDckMscUJBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDO0FBQ2hDLG9CQUFRLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEFBQUM7WUFDOUI7U0FDRTtRQUNOOzs7QUFDRSxxQkFBUyxFQUFFLDZCQUFXO0FBQ3BCLG1CQUFLLEVBQUUsSUFBSTtBQUNYLDJCQUFhLEVBQUUsSUFBSTtBQUNuQixrQ0FBb0IsRUFBRSxJQUFJO0FBQzFCLHdCQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRTtBQUNsQyw4Q0FBZ0MsRUFBRSxJQUFJO2FBQ3ZDLENBQUMsQUFBQztBQUNILG1CQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztVQUM5Qiw0Q0FBTSxTQUFTLEVBQUMsZ0RBQWdELEdBQUc7U0FDNUQ7UUFDUixXQUFXO09BQ1IsQ0FDTjtLQUNIOzs7V0FFUyxvQkFBQyxJQUFZLEVBQVE7QUFDN0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO0tBQzdCOzs7V0FFYywyQkFBUztBQUN0QixVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUMxQixZQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FDM0IsaUJBQWlCLEVBQ2pCLEVBQUMsTUFBTSxFQUFFLDJDQUEyQyxFQUFDLENBQ3RELENBQUM7QUFDRixlQUFPO09BQ1I7O0FBRUQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRTtBQUN4QixZQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzlELE1BQU07QUFDTCxZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ3BDO0tBQ0Y7OztTQTlFVSw4QkFBOEI7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgQXRvbUlucHV0IGZyb20gJy4uLy4uL3VpL2F0b20taW5wdXQnO1xuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGlzRWRpdGluZzogYm9vbGVhbjtcbiAgaW5pdGlhbE5hbWU6IHN0cmluZztcbiAgb25VcGRhdGU6IChwcmV2TmFtZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpID0+IHZvaWQ7XG4gIG9uU2F2ZTogKG5hbWU6IHN0cmluZykgPT4gdm9pZDtcbiAgb25DYW5jZWw6ICgpID0+IHZvaWQ7XG59XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIFdvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHByb3BzOiBQcm9wcztcbiAgc3RhdGU6IFN0YXRlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBuYW1lOiBwcm9wcy5pbml0aWFsTmFtZSxcbiAgICB9O1xuXG4gICAgKHRoaXM6IGFueSkuX3RyYWNrTmFtZSA9IHRoaXMuX3RyYWNrTmFtZS5iaW5kKHRoaXMpO1xuICAgICh0aGlzOiBhbnkpLl9zYXZlV29ya2luZ1NldCA9IHRoaXMuX3NhdmVXb3JraW5nU2V0LmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBzZXROYW1lVGV4dDtcbiAgICBpZiAodGhpcy5zdGF0ZS5uYW1lID09PSAnJykge1xuICAgICAgc2V0TmFtZVRleHQgPSAoXG4gICAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtbmFtZS1taXNzaW5nXCI+XG4gICAgICAgICAgTmFtZSBpcyBtaXNzaW5nXG4gICAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtbmFtZS1vdXRsaW5lXCI+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwibmFtZVwiXG4gICAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibnVjbGlkZS1maWxlLXRyZWUtd29ya2luZy1zZXQtbmFtZSBpbmxpbmUtYmxvY2stdGlnaHRcIlxuICAgICAgICAgICAgb25EaWRDaGFuZ2U9e3RoaXMuX3RyYWNrTmFtZX1cbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsTmFtZX1cbiAgICAgICAgICAgIG9uQ29uZmlybT17dGhpcy5fc2F2ZVdvcmtpbmdTZXR9XG4gICAgICAgICAgICBvbkNhbmNlbD17dGhpcy5wcm9wcy5vbkNhbmNlbH1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyh7XG4gICAgICAgICAgICAnYnRuJzogdHJ1ZSxcbiAgICAgICAgICAgICdidG4tc3VjY2Vzcyc6IHRydWUsXG4gICAgICAgICAgICAnaW5saW5lLWJsb2NrLXRpZ2h0JzogdHJ1ZSxcbiAgICAgICAgICAgICdkaXNhYmxlZCc6IHRoaXMuc3RhdGUubmFtZSA9PT0gJycsXG4gICAgICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1pY29uJzogdHJ1ZSxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9zYXZlV29ya2luZ1NldH0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWNoZWNrIG51Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItaWNvblwiIC8+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICB7c2V0TmFtZVRleHR9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3RyYWNrTmFtZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtuYW1lOiB0ZXh0fSk7XG4gIH1cblxuICBfc2F2ZVdvcmtpbmdTZXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdGUubmFtZSA9PT0gJycpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFxuICAgICAgICAnTmFtZSBpcyBtaXNzaW5nJyxcbiAgICAgICAge2RldGFpbDogJ1BsZWFzZSBwcm92aWRlIGEgbmFtZSBmb3IgdGhlIFdvcmtpbmcgU2V0J30sXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnByb3BzLmlzRWRpdGluZykge1xuICAgICAgdGhpcy5wcm9wcy5vblVwZGF0ZSh0aGlzLnByb3BzLmluaXRpYWxOYW1lLCB0aGlzLnN0YXRlLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByb3BzLm9uU2F2ZSh0aGlzLnN0YXRlLm5hbWUpO1xuICAgIH1cbiAgfVxufVxuIl19