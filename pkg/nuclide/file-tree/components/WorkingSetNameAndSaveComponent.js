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
      return _reactForAtom.React.createElement(
        'div',
        null,
        _reactForAtom.React.createElement(_uiAtomInput2['default'], {
          placeholderText: 'name',
          size: 'sm',
          className: 'nuclide-file-tree-working-set-name inline-block-tight',
          onDidChange: this._trackName,
          initialValue: this.props.initialName,
          onConfirm: this._saveWorkingSet,
          onCancel: this.props.onCancel
        }),
        _reactForAtom.React.createElement(
          'button',
          {
            className: (0, _classnames2['default'])({
              'btn': true,
              'btn-success': true,
              'inline-block-tight': true,
              'disabled': this.state.name === ''
            }),
            onClick: this._saveWorkingSet },
          _reactForAtom.React.createElement('span', { className: 'icon icon-check' })
        )
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBYW9CLGdCQUFnQjs7MkJBQ2QscUJBQXFCOzs7OzBCQUNwQixZQUFZOzs7O0lBY3RCLDhCQUE4QjtZQUE5Qiw4QkFBOEI7O0FBSTlCLFdBSkEsOEJBQThCLENBSTdCLEtBQVksRUFBRTswQkFKZiw4QkFBOEI7O0FBS3ZDLCtCQUxTLDhCQUE4Qiw2Q0FLakMsS0FBSyxFQUFFOztBQUViLFFBQUksQ0FBQyxLQUFLLEdBQUc7QUFDWCxVQUFJLEVBQUUsS0FBSyxDQUFDLFdBQVc7S0FDeEIsQ0FBQzs7QUFFRixBQUFDLFFBQUksQ0FBTyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEQsQUFBQyxRQUFJLENBQU8sZUFBZSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQy9EOztlQWJVLDhCQUE4Qjs7V0FleEIsNkJBQVMsRUFDekI7OztXQUVtQixnQ0FBUyxFQUM1Qjs7O1dBRUssa0JBQUc7QUFDUCxhQUNFOzs7UUFDRTtBQUNFLHlCQUFlLEVBQUMsTUFBTTtBQUN0QixjQUFJLEVBQUMsSUFBSTtBQUNULG1CQUFTLEVBQUMsdURBQXVEO0FBQ2pFLHFCQUFXLEVBQUUsSUFBSSxDQUFDLFVBQVUsQUFBQztBQUM3QixzQkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxBQUFDO0FBQ3JDLG1CQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztBQUNoQyxrQkFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxBQUFDO1VBQzlCO1FBQ0Y7OztBQUNFLHFCQUFTLEVBQUUsNkJBQVc7QUFDcEIsbUJBQUssRUFBRSxJQUFJO0FBQ1gsMkJBQWEsRUFBRSxJQUFJO0FBQ25CLGtDQUFvQixFQUFFLElBQUk7QUFDMUIsd0JBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFO2FBQ25DLENBQUMsQUFBQztBQUNILG1CQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsQUFBQztVQUM5Qiw0Q0FBTSxTQUFTLEVBQUMsaUJBQWlCLEdBQUc7U0FDN0I7T0FDTCxDQUNOO0tBQ0g7OztXQUVTLG9CQUFDLElBQVksRUFBUTtBQUM3QixVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDN0I7OztXQUVjLDJCQUFTO0FBQ3RCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQzFCLGVBQU87T0FDUjs7QUFFRCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUQsTUFBTTtBQUNMLFlBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDcEM7S0FDRjs7O1NBN0RVLDhCQUE4QjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiV29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBBdG9tSW5wdXQgZnJvbSAnLi4vLi4vdWkvYXRvbS1pbnB1dCc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgaXNFZGl0aW5nOiBib29sZWFuO1xuICBpbml0aWFsTmFtZTogc3RyaW5nO1xuICBvblVwZGF0ZTogKHByZXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4gdm9pZDtcbiAgb25TYXZlOiAobmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkNhbmNlbDogKCkgPT4gdm9pZDtcbn1cblxudHlwZSBTdGF0ZSA9IHtcbiAgbmFtZTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgV29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG5hbWU6IHByb3BzLmluaXRpYWxOYW1lLFxuICAgIH07XG5cbiAgICAodGhpczogYW55KS5fdHJhY2tOYW1lID0gdGhpcy5fdHJhY2tOYW1lLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX3NhdmVXb3JraW5nU2V0ID0gdGhpcy5fc2F2ZVdvcmtpbmdTZXQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJuYW1lXCJcbiAgICAgICAgICBzaXplPVwic21cIlxuICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLXdvcmtpbmctc2V0LW5hbWUgaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICBvbkRpZENoYW5nZT17dGhpcy5fdHJhY2tOYW1lfVxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsTmFtZX1cbiAgICAgICAgICBvbkNvbmZpcm09e3RoaXMuX3NhdmVXb3JraW5nU2V0fVxuICAgICAgICAgIG9uQ2FuY2VsPXt0aGlzLnByb3BzLm9uQ2FuY2VsfVxuICAgICAgICAvPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc25hbWVzKHtcbiAgICAgICAgICAgICdidG4nOiB0cnVlLFxuICAgICAgICAgICAgJ2J0bi1zdWNjZXNzJzogdHJ1ZSxcbiAgICAgICAgICAgICdpbmxpbmUtYmxvY2stdGlnaHQnOiB0cnVlLFxuICAgICAgICAgICAgJ2Rpc2FibGVkJzogdGhpcy5zdGF0ZS5uYW1lID09PSAnJyxcbiAgICAgICAgICB9KX1cbiAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9zYXZlV29ya2luZ1NldH0+XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaWNvbiBpY29uLWNoZWNrXCIgLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX3RyYWNrTmFtZSh0ZXh0OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLnNldFN0YXRlKHtuYW1lOiB0ZXh0fSk7XG4gIH1cblxuICBfc2F2ZVdvcmtpbmdTZXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuc3RhdGUubmFtZSA9PT0gJycpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5pc0VkaXRpbmcpIHtcbiAgICAgIHRoaXMucHJvcHMub25VcGRhdGUodGhpcy5wcm9wcy5pbml0aWFsTmFtZSwgdGhpcy5zdGF0ZS5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5vblNhdmUodGhpcy5zdGF0ZS5uYW1lKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==