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

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3FDQUNaLGdDQUFnQzs7MEJBQ2pDLFlBQVk7Ozs7SUFjdEIsOEJBQThCO1lBQTlCLDhCQUE4Qjs7QUFJOUIsV0FKQSw4QkFBOEIsQ0FJN0IsS0FBWSxFQUFFOzBCQUpmLDhCQUE4Qjs7QUFLdkMsK0JBTFMsOEJBQThCLDZDQUtqQyxLQUFLLEVBQUU7O0FBRWIsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFVBQUksRUFBRSxLQUFLLENBQUMsV0FBVztLQUN4QixDQUFDOztBQUVGLEFBQUMsUUFBSSxDQUFPLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRCxBQUFDLFFBQUksQ0FBTyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDL0Q7O2VBYlUsOEJBQThCOztXQWV4Qiw2QkFBUyxFQUN6Qjs7O1dBRW1CLGdDQUFTLEVBQzVCOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDMUIsbUJBQVcsR0FDVDs7WUFBWSxTQUFNLDRDQUE0Qzs7U0FFakQsQUFDZCxDQUFDO09BQ0g7O0FBRUQsYUFDRTs7O1FBQ0U7O1lBQUssU0FBUyxFQUFDLDRDQUE0QztVQUN6RDtBQUNFLDJCQUFlLEVBQUMsTUFBTTtBQUN0QixnQkFBSSxFQUFDLElBQUk7QUFDVCxxQkFBUyxFQUFDLHVEQUF1RDtBQUNqRSx1QkFBVyxFQUFFLElBQUksQ0FBQyxVQUFVLEFBQUM7QUFDN0Isd0JBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQUFBQztBQUNyQyxxQkFBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7QUFDaEMsb0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQztZQUM5QjtTQUNFO1FBQ047OztBQUNFLHFCQUFTLEVBQUUsNkJBQVc7QUFDcEIsbUJBQUssRUFBRSxJQUFJO0FBQ1gsMkJBQWEsRUFBRSxJQUFJO0FBQ25CLGtDQUFvQixFQUFFLElBQUk7QUFDMUIsd0JBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFO0FBQ2xDLDhDQUFnQyxFQUFFLElBQUk7YUFDdkMsQ0FBQyxBQUFDO0FBQ0gsbUJBQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDO1VBQzlCLDRDQUFNLFNBQVMsRUFBQyxnREFBZ0QsR0FBRztTQUM1RDtRQUNSLFdBQVc7T0FDUixDQUNOO0tBQ0g7OztXQUVTLG9CQUFDLElBQVksRUFBUTtBQUM3QixVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDN0I7OztXQUVjLDJCQUFTO0FBQ3RCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQzFCLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUMzQixpQkFBaUIsRUFDakIsRUFBQyxNQUFNLEVBQUUsMkNBQTJDLEVBQUMsQ0FDdEQsQ0FBQztBQUNGLGVBQU87T0FDUjs7QUFFRCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUQsTUFBTTtBQUNMLFlBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDcEM7S0FDRjs7O1NBOUVVLDhCQUE4QjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiV29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21JbnB1dCc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgaXNFZGl0aW5nOiBib29sZWFuO1xuICBpbml0aWFsTmFtZTogc3RyaW5nO1xuICBvblVwZGF0ZTogKHByZXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4gdm9pZDtcbiAgb25TYXZlOiAobmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkNhbmNlbDogKCkgPT4gdm9pZDtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgV29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG5hbWU6IHByb3BzLmluaXRpYWxOYW1lLFxuICAgIH07XG5cbiAgICAodGhpczogYW55KS5fdHJhY2tOYW1lID0gdGhpcy5fdHJhY2tOYW1lLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3NhdmVXb3JraW5nU2V0ID0gdGhpcy5fc2F2ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgbGV0IHNldE5hbWVUZXh0O1xuICAgIGlmICh0aGlzLnN0YXRlLm5hbWUgPT09ICcnKSB7XG4gICAgICBzZXROYW1lVGV4dCA9IChcbiAgICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJudWNsaWRlLWZpbGUtdHJlZS13b3JraW5nLXNldC1uYW1lLW1pc3NpbmdcIj5cbiAgICAgICAgICBOYW1lIGlzIG1pc3NpbmdcbiAgICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS13b3JraW5nLXNldC1uYW1lLW91dGxpbmVcIj5cbiAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJuYW1lXCJcbiAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJudWNsaWRlLWZpbGUtdHJlZS13b3JraW5nLXNldC1uYW1lIGlubGluZS1ibG9jay10aWdodFwiXG4gICAgICAgICAgICBvbkRpZENoYW5nZT17dGhpcy5fdHJhY2tOYW1lfVxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLmluaXRpYWxOYW1lfVxuICAgICAgICAgICAgb25Db25maXJtPXt0aGlzLl9zYXZlV29ya2luZ1NldH1cbiAgICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLnByb3BzLm9uQ2FuY2VsfVxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAgICdidG4nOiB0cnVlLFxuICAgICAgICAgICAgJ2J0bi1zdWNjZXNzJzogdHJ1ZSxcbiAgICAgICAgICAgICdpbmxpbmUtYmxvY2stdGlnaHQnOiB0cnVlLFxuICAgICAgICAgICAgJ2Rpc2FibGVkJzogdGhpcy5zdGF0ZS5uYW1lID09PSAnJyxcbiAgICAgICAgICAgICdudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb24nOiB0cnVlLFxuICAgICAgICAgIH0pfVxuICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3NhdmVXb3JraW5nU2V0fT5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpY29uIGljb24tY2hlY2sgbnVjbGlkZS1maWxlLXRyZWUtdG9vbGJhci1pY29uXCIgLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIHtzZXROYW1lVGV4dH1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfdHJhY2tOYW1lKHRleHQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuc2V0U3RhdGUoe25hbWU6IHRleHR9KTtcbiAgfVxuXG4gIF9zYXZlV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5uYW1lID09PSAnJykge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXG4gICAgICAgICdOYW1lIGlzIG1pc3NpbmcnLFxuICAgICAgICB7ZGV0YWlsOiAnUGxlYXNlIHByb3ZpZGUgYSBuYW1lIGZvciB0aGUgV29ya2luZyBTZXQnfSxcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJvcHMuaXNFZGl0aW5nKSB7XG4gICAgICB0aGlzLnByb3BzLm9uVXBkYXRlKHRoaXMucHJvcHMuaW5pdGlhbE5hbWUsIHRoaXMuc3RhdGUubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvcHMub25TYXZlKHRoaXMuc3RhdGUubmFtZSk7XG4gICAgfVxuICB9XG59XG4iXX0=