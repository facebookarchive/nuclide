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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIldvcmtpbmdTZXROYW1lQW5kU2F2ZUNvbXBvbmVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O3FDQUNaLGdDQUFnQzs7MEJBQ2pDLFlBQVk7Ozs7SUFjdEIsOEJBQThCO1lBQTlCLDhCQUE4Qjs7QUFJOUIsV0FKQSw4QkFBOEIsQ0FJN0IsS0FBWSxFQUFFOzBCQUpmLDhCQUE4Qjs7QUFLdkMsK0JBTFMsOEJBQThCLDZDQUtqQyxLQUFLLEVBQUU7O0FBRWIsUUFBSSxDQUFDLEtBQUssR0FBRztBQUNYLFVBQUksRUFBRSxLQUFLLENBQUMsV0FBVztLQUN4QixDQUFDOztBQUVGLEFBQUMsUUFBSSxDQUFPLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRCxBQUFDLFFBQUksQ0FBTyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDL0Q7O2VBYlUsOEJBQThCOztXQWV4Qiw2QkFBUyxFQUN6Qjs7O1dBRW1CLGdDQUFTLEVBQzVCOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFLEVBQUU7QUFDMUIsbUJBQVcsR0FDVDs7WUFBWSxTQUFNLDRDQUE0Qzs7U0FFakQsQUFDZCxDQUFDO09BQ0g7O0FBRUQsYUFDRTs7O1FBQ0U7O1lBQUssU0FBUyxFQUFDLDRDQUE0QztVQUN6RDtBQUNFLDJCQUFlLEVBQUMsTUFBTTtBQUN0QixnQkFBSSxFQUFDLElBQUk7QUFDVCxxQkFBUyxFQUFDLHVEQUF1RDtBQUNqRSx1QkFBVyxFQUFFLElBQUksQ0FBQyxVQUFVLEFBQUM7QUFDN0Isd0JBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQUFBQztBQUNyQyxxQkFBUyxFQUFFLElBQUksQ0FBQyxlQUFlLEFBQUM7QUFDaEMsb0JBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQUFBQztZQUM5QjtTQUNFO1FBQ047OztBQUNFLHFCQUFTLEVBQUUsNkJBQVc7QUFDcEIsbUJBQUssRUFBRSxJQUFJO0FBQ1gsMkJBQWEsRUFBRSxJQUFJO0FBQ25CLGtDQUFvQixFQUFFLElBQUk7QUFDMUIsd0JBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxFQUFFO0FBQ2xDLDhDQUFnQyxFQUFFLElBQUk7YUFDdkMsQ0FBQyxBQUFDO0FBQ0gsbUJBQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxBQUFDO1VBQzlCLDRDQUFNLFNBQVMsRUFBQyxnREFBZ0QsR0FBRztTQUM1RDtRQUNSLFdBQVc7T0FDUixDQUNOO0tBQ0g7OztXQUVTLG9CQUFDLElBQVksRUFBUTtBQUM3QixVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDN0I7OztXQUVjLDJCQUFTO0FBQ3RCLFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssRUFBRSxFQUFFO0FBQzFCLFlBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUMzQixpQkFBaUIsRUFDakIsRUFBQyxNQUFNLEVBQUUsMkNBQTJDLEVBQUMsQ0FDdEQsQ0FBQztBQUNGLGVBQU87T0FDUjs7QUFFRCxVQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDOUQsTUFBTTtBQUNMLFlBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDcEM7S0FDRjs7O1NBOUVVLDhCQUE4QjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiV29ya2luZ1NldE5hbWVBbmRTYXZlQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0F0b21JbnB1dCc7XG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcblxudHlwZSBQcm9wcyA9IHtcbiAgaXNFZGl0aW5nOiBib29sZWFuO1xuICBpbml0aWFsTmFtZTogc3RyaW5nO1xuICBvblVwZGF0ZTogKHByZXZOYW1lOiBzdHJpbmcsIG5hbWU6IHN0cmluZykgPT4gdm9pZDtcbiAgb25TYXZlOiAobmFtZTogc3RyaW5nKSA9PiB2b2lkO1xuICBvbkNhbmNlbDogKCkgPT4gdm9pZDtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIG5hbWU6IHN0cmluZztcbn07XG5cbmV4cG9ydCBjbGFzcyBXb3JraW5nU2V0TmFtZUFuZFNhdmVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbmFtZTogcHJvcHMuaW5pdGlhbE5hbWUsXG4gICAgfTtcblxuICAgICh0aGlzOiBhbnkpLl90cmFja05hbWUgPSB0aGlzLl90cmFja05hbWUuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fc2F2ZVdvcmtpbmdTZXQgPSB0aGlzLl9zYXZlV29ya2luZ1NldC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgc2V0TmFtZVRleHQ7XG4gICAgaWYgKHRoaXMuc3RhdGUubmFtZSA9PT0gJycpIHtcbiAgICAgIHNldE5hbWVUZXh0ID0gKFxuICAgICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cIm51Y2xpZGUtZmlsZS10cmVlLXdvcmtpbmctc2V0LW5hbWUtbWlzc2luZ1wiPlxuICAgICAgICAgIE5hbWUgaXMgbWlzc2luZ1xuICAgICAgICA8L2F0b20tcGFuZWw+XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLXdvcmtpbmctc2V0LW5hbWUtb3V0bGluZVwiPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIm5hbWVcIlxuICAgICAgICAgICAgc2l6ZT1cInNtXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm51Y2xpZGUtZmlsZS10cmVlLXdvcmtpbmctc2V0LW5hbWUgaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICAgIG9uRGlkQ2hhbmdlPXt0aGlzLl90cmFja05hbWV9XG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMucHJvcHMuaW5pdGlhbE5hbWV9XG4gICAgICAgICAgICBvbkNvbmZpcm09e3RoaXMuX3NhdmVXb3JraW5nU2V0fVxuICAgICAgICAgICAgb25DYW5jZWw9e3RoaXMucHJvcHMub25DYW5jZWx9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoe1xuICAgICAgICAgICAgJ2J0bic6IHRydWUsXG4gICAgICAgICAgICAnYnRuLXN1Y2Nlc3MnOiB0cnVlLFxuICAgICAgICAgICAgJ2lubGluZS1ibG9jay10aWdodCc6IHRydWUsXG4gICAgICAgICAgICAnZGlzYWJsZWQnOiB0aGlzLnN0YXRlLm5hbWUgPT09ICcnLFxuICAgICAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlLXRvb2xiYXItaWNvbic6IHRydWUsXG4gICAgICAgICAgfSl9XG4gICAgICAgICAgb25DbGljaz17dGhpcy5fc2F2ZVdvcmtpbmdTZXR9PlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImljb24gaWNvbi1jaGVjayBudWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWljb25cIiAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAge3NldE5hbWVUZXh0fVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF90cmFja05hbWUodGV4dDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bmFtZTogdGV4dH0pO1xuICB9XG5cbiAgX3NhdmVXb3JraW5nU2V0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnN0YXRlLm5hbWUgPT09ICcnKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgJ05hbWUgaXMgbWlzc2luZycsXG4gICAgICAgIHtkZXRhaWw6ICdQbGVhc2UgcHJvdmlkZSBhIG5hbWUgZm9yIHRoZSBXb3JraW5nIFNldCd9LFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wcm9wcy5pc0VkaXRpbmcpIHtcbiAgICAgIHRoaXMucHJvcHMub25VcGRhdGUodGhpcy5wcm9wcy5pbml0aWFsTmFtZSwgdGhpcy5zdGF0ZS5uYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcm9wcy5vblNhdmUodGhpcy5zdGF0ZS5uYW1lKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==