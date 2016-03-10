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

var _uiAtomInput = require('../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var _uiCheckbox = require('../../ui/checkbox');

var _uiCheckbox2 = _interopRequireDefault(_uiCheckbox);

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var PropTypes = _reactForAtom.React.PropTypes;

/**
 * Component that displays UI to create a new file.
 */

var FileDialogComponent = (function (_React$Component) {
  _inherits(FileDialogComponent, _React$Component);

  _createClass(FileDialogComponent, null, [{
    key: 'propTypes',
    value: {
      iconClassName: PropTypes.string,
      initialValue: PropTypes.string,
      // Message is displayed above the input.
      message: PropTypes.element.isRequired,
      // Will be called (before `onClose`) if the user confirms.  `onConfirm` will
      // be called with two arguments, the value of the input field and a map of
      // option name => bool (true if option was selected).
      onConfirm: PropTypes.func.isRequired,
      // Will be called regardless of whether the user confirms.
      onClose: PropTypes.func.isRequired,
      // Whether or not to initially select the base name of the path.
      // This is useful for renaming files.
      selectBasename: PropTypes.bool,
      // Extra options to show the user.  Key is the name of the option and value
      // is a description string that will be displayed.
      additionalOptions: PropTypes.objectOf(PropTypes.string)
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      additionalOptions: {}
    },
    enumerable: true
  }]);

  function FileDialogComponent() {
    _classCallCheck(this, FileDialogComponent);

    _get(Object.getPrototypeOf(FileDialogComponent.prototype), 'constructor', this).apply(this, arguments);
    this._isClosed = false;
    this._subscriptions = new _atom.CompositeDisposable();
    this._close = this._close.bind(this);
    this._confirm = this._confirm.bind(this);
    this._handleDocumentClick = this._handleDocumentClick.bind(this);
    this.state = {
      options: {}
    };
    for (var _name in this.props.additionalOptions) {
      this.state.options[_name] = true;
    }
  }

  _createClass(FileDialogComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var input = this.refs.input;
      this._subscriptions.add(atom.commands.add(_reactForAtom.ReactDOM.findDOMNode(input), {
        'core:confirm': this._confirm,
        'core:cancel': this._close
      }));
      var path = this.props.initialValue;
      input.focus();
      if (this.props.selectBasename) {
        var _pathModule$parse = _path2['default'].parse(path);

        var dir = _pathModule$parse.dir;
        var _name2 = _pathModule$parse.name;

        var selectionStart = dir ? dir.length + 1 : 0;
        var selectionEnd = selectionStart + _name2.length;
        input.getTextEditor().setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
      }
      document.addEventListener('click', this._handleDocumentClick);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
      document.removeEventListener('click', this._handleDocumentClick);
    }
  }, {
    key: 'render',
    value: function render() {
      var labelClassName = undefined;
      if (this.props.iconClassName != null) {
        labelClassName = 'icon ' + this.props.iconClassName;
      }

      var checkboxes = [];
      for (var _name3 in this.props.additionalOptions) {
        var message = this.props.additionalOptions[_name3];
        var checked = this.state.options[_name3];
        var checkbox = _reactForAtom.React.createElement(_uiCheckbox2['default'], {
          key: _name3,
          checked: checked,
          onChange: this._handleAdditionalOptionChanged.bind(this, _name3),
          label: message
        });
        checkboxes.push(checkbox);
      }

      // `.tree-view-dialog` is unstyled but is added by Atom's tree-view package[1] and is styled by
      // 3rd-party themes. Add it to make this package's modals styleable the same as Atom's
      // tree-view.
      //
      // [1] https://github.com/atom/tree-view/blob/v0.200.0/lib/dialog.coffee#L7
      return _reactForAtom.React.createElement(
        'atom-panel',
        { 'class': 'modal overlay from-top' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'tree-view-dialog', ref: 'dialog' },
          _reactForAtom.React.createElement(
            'label',
            { className: labelClassName },
            this.props.message
          ),
          _reactForAtom.React.createElement(_uiAtomInput2['default'], {
            initialValue: this.props.initialValue,
            ref: 'input'
          }),
          checkboxes
        )
      );
    }
  }, {
    key: '_handleAdditionalOptionChanged',
    value: function _handleAdditionalOptionChanged(name, isChecked) {
      var options = this.state.options;

      options[name] = isChecked;
      this.setState({ options: options });
    }
  }, {
    key: '_handleDocumentClick',
    value: function _handleDocumentClick(event) {
      var dialog = this.refs['dialog'];
      // If the click did not happen on the dialog or on any of its descendants,
      // the click was elsewhere on the document and should close the modal.
      if (event.target !== dialog && !dialog.contains(event.target)) {
        this._close();
      }
    }
  }, {
    key: '_confirm',
    value: function _confirm() {
      this.props.onConfirm(this.refs.input.getText(), this.state.options);
      this._close();
    }
  }, {
    key: '_close',
    value: function _close() {
      if (!this._isClosed) {
        this._isClosed = true;
        this.props.onClose();
      }
    }
  }]);

  return FileDialogComponent;
})(_reactForAtom.React.Component);

module.exports = FileDialogComponent;
//# sourceMappingURL=data:application/json;base64,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QXZJRyxtQkFBbUI7R0FBUyxvQkFBTSxTQUFTOztBQTBJakQsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJGaWxlRGlhbG9nQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi91aS9hdG9tLWlucHV0JztcbmltcG9ydCBOdWNsaWRlQ2hlY2tib3ggZnJvbSAnLi4vLi4vdWkvY2hlY2tib3gnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQgcGF0aE1vZHVsZSBmcm9tICdwYXRoJztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuLyoqXG4gKiBDb21wb25lbnQgdGhhdCBkaXNwbGF5cyBVSSB0byBjcmVhdGUgYSBuZXcgZmlsZS5cbiAqL1xuY2xhc3MgRmlsZURpYWxvZ0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfaXNDbG9zZWQ6IGJvb2xlYW47XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpY29uQ2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIGluaXRpYWxWYWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAvLyBNZXNzYWdlIGlzIGRpc3BsYXllZCBhYm92ZSB0aGUgaW5wdXQuXG4gICAgbWVzc2FnZTogUHJvcFR5cGVzLmVsZW1lbnQuaXNSZXF1aXJlZCxcbiAgICAvLyBXaWxsIGJlIGNhbGxlZCAoYmVmb3JlIGBvbkNsb3NlYCkgaWYgdGhlIHVzZXIgY29uZmlybXMuICBgb25Db25maXJtYCB3aWxsXG4gICAgLy8gYmUgY2FsbGVkIHdpdGggdHdvIGFyZ3VtZW50cywgdGhlIHZhbHVlIG9mIHRoZSBpbnB1dCBmaWVsZCBhbmQgYSBtYXAgb2ZcbiAgICAvLyBvcHRpb24gbmFtZSA9PiBib29sICh0cnVlIGlmIG9wdGlvbiB3YXMgc2VsZWN0ZWQpLlxuICAgIG9uQ29uZmlybTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvLyBXaWxsIGJlIGNhbGxlZCByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHVzZXIgY29uZmlybXMuXG4gICAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvLyBXaGV0aGVyIG9yIG5vdCB0byBpbml0aWFsbHkgc2VsZWN0IHRoZSBiYXNlIG5hbWUgb2YgdGhlIHBhdGguXG4gICAgLy8gVGhpcyBpcyB1c2VmdWwgZm9yIHJlbmFtaW5nIGZpbGVzLlxuICAgIHNlbGVjdEJhc2VuYW1lOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAvLyBFeHRyYSBvcHRpb25zIHRvIHNob3cgdGhlIHVzZXIuICBLZXkgaXMgdGhlIG5hbWUgb2YgdGhlIG9wdGlvbiBhbmQgdmFsdWVcbiAgICAvLyBpcyBhIGRlc2NyaXB0aW9uIHN0cmluZyB0aGF0IHdpbGwgYmUgZGlzcGxheWVkLlxuICAgIGFkZGl0aW9uYWxPcHRpb25zOiBQcm9wVHlwZXMub2JqZWN0T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gIH07XG5cbiAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IHtcbiAgICBhZGRpdGlvbmFsT3B0aW9uczoge30sXG4gIH07XG5cbiAgc3RhdGU6IHtcbiAgICBvcHRpb25zOiBPYmplY3Q7XG4gIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgICh0aGlzOiBhbnkpLl9jbG9zZSA9IHRoaXMuX2Nsb3NlLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2NvbmZpcm0gPSB0aGlzLl9jb25maXJtLmJpbmQodGhpcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZURvY3VtZW50Q2xpY2sgPSB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG9wdGlvbnM6IHt9LFxuICAgIH07XG4gICAgZm9yIChjb25zdCBuYW1lIGluIHRoaXMucHJvcHMuYWRkaXRpb25hbE9wdGlvbnMpIHtcbiAgICAgIHRoaXMuc3RhdGUub3B0aW9uc1tuYW1lXSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLnJlZnMuaW5wdXQ7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBSZWFjdERPTS5maW5kRE9NTm9kZShpbnB1dCksXG4gICAgICB7XG4gICAgICAgICdjb3JlOmNvbmZpcm0nOiB0aGlzLl9jb25maXJtLFxuICAgICAgICAnY29yZTpjYW5jZWwnOiB0aGlzLl9jbG9zZSxcbiAgICAgIH1cbiAgICApKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wcm9wcy5pbml0aWFsVmFsdWU7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RCYXNlbmFtZSkge1xuICAgICAgY29uc3Qge2RpciwgbmFtZX0gPSBwYXRoTW9kdWxlLnBhcnNlKHBhdGgpO1xuICAgICAgY29uc3Qgc2VsZWN0aW9uU3RhcnQgPSBkaXIgPyBkaXIubGVuZ3RoICsgMSA6IDA7XG4gICAgICBjb25zdCBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25TdGFydCArIG5hbWUubGVuZ3RoO1xuICAgICAgaW5wdXQuZ2V0VGV4dEVkaXRvcigpLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1swLCBzZWxlY3Rpb25TdGFydF0sIFswLCBzZWxlY3Rpb25FbmRdXSk7XG4gICAgfVxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGljayk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2spO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgbGV0IGxhYmVsQ2xhc3NOYW1lO1xuICAgIGlmICh0aGlzLnByb3BzLmljb25DbGFzc05hbWUgIT0gbnVsbCkge1xuICAgICAgbGFiZWxDbGFzc05hbWUgPSBgaWNvbiAke3RoaXMucHJvcHMuaWNvbkNsYXNzTmFtZX1gO1xuICAgIH1cblxuICAgIGNvbnN0IGNoZWNrYm94ZXMgPSBbXTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5wcm9wcy5hZGRpdGlvbmFsT3B0aW9ucykge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IHRoaXMucHJvcHMuYWRkaXRpb25hbE9wdGlvbnNbbmFtZV07XG4gICAgICBjb25zdCBjaGVja2VkID0gdGhpcy5zdGF0ZS5vcHRpb25zW25hbWVdO1xuICAgICAgY29uc3QgY2hlY2tib3ggPVxuICAgICAgICA8TnVjbGlkZUNoZWNrYm94XG4gICAgICAgICAga2V5PXtuYW1lfVxuICAgICAgICAgIGNoZWNrZWQ9e2NoZWNrZWR9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX2hhbmRsZUFkZGl0aW9uYWxPcHRpb25DaGFuZ2VkLmJpbmQodGhpcywgbmFtZSl9XG4gICAgICAgICAgbGFiZWw9e21lc3NhZ2V9XG4gICAgICAgIC8+O1xuICAgICAgY2hlY2tib3hlcy5wdXNoKGNoZWNrYm94KTtcbiAgICB9XG5cbiAgICAvLyBgLnRyZWUtdmlldy1kaWFsb2dgIGlzIHVuc3R5bGVkIGJ1dCBpcyBhZGRlZCBieSBBdG9tJ3MgdHJlZS12aWV3IHBhY2thZ2VbMV0gYW5kIGlzIHN0eWxlZCBieVxuICAgIC8vIDNyZC1wYXJ0eSB0aGVtZXMuIEFkZCBpdCB0byBtYWtlIHRoaXMgcGFja2FnZSdzIG1vZGFscyBzdHlsZWFibGUgdGhlIHNhbWUgYXMgQXRvbSdzXG4gICAgLy8gdHJlZS12aWV3LlxuICAgIC8vXG4gICAgLy8gWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjIwMC4wL2xpYi9kaWFsb2cuY29mZmVlI0w3XG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibW9kYWwgb3ZlcmxheSBmcm9tLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRyZWUtdmlldy1kaWFsb2dcIiByZWY9XCJkaWFsb2dcIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPXtsYWJlbENsYXNzTmFtZX0+e3RoaXMucHJvcHMubWVzc2FnZX08L2xhYmVsPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVmFsdWV9XG4gICAgICAgICAgICByZWY9XCJpbnB1dFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgICB7Y2hlY2tib3hlc31cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2F0b20tcGFuZWw+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVBZGRpdGlvbmFsT3B0aW9uQ2hhbmdlZChuYW1lOiBzdHJpbmcsIGlzQ2hlY2tlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IHtvcHRpb25zfSA9IHRoaXMuc3RhdGU7XG4gICAgb3B0aW9uc1tuYW1lXSA9IGlzQ2hlY2tlZDtcbiAgICB0aGlzLnNldFN0YXRlKHtvcHRpb25zOiBvcHRpb25zfSk7XG4gIH1cblxuICBfaGFuZGxlRG9jdW1lbnRDbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBkaWFsb2cgPSB0aGlzLnJlZnNbJ2RpYWxvZyddO1xuICAgIC8vIElmIHRoZSBjbGljayBkaWQgbm90IGhhcHBlbiBvbiB0aGUgZGlhbG9nIG9yIG9uIGFueSBvZiBpdHMgZGVzY2VuZGFudHMsXG4gICAgLy8gdGhlIGNsaWNrIHdhcyBlbHNld2hlcmUgb24gdGhlIGRvY3VtZW50IGFuZCBzaG91bGQgY2xvc2UgdGhlIG1vZGFsLlxuICAgIGlmIChldmVudC50YXJnZXQgIT09IGRpYWxvZyAmJiAhZGlhbG9nLmNvbnRhaW5zKGV2ZW50LnRhcmdldCkpIHtcbiAgICAgIHRoaXMuX2Nsb3NlKCk7XG4gICAgfVxuICB9XG5cbiAgX2NvbmZpcm0oKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0odGhpcy5yZWZzLmlucHV0LmdldFRleHQoKSwgdGhpcy5zdGF0ZS5vcHRpb25zKTtcbiAgICB0aGlzLl9jbG9zZSgpO1xuICB9XG5cbiAgX2Nsb3NlKCkge1xuICAgIGlmICghdGhpcy5faXNDbG9zZWQpIHtcbiAgICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVEaWFsb2dDb21wb25lbnQ7XG4iXX0=