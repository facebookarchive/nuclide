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

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

var _nuclideUiLibNuclideCheckbox = require('../../nuclide-ui/lib/NuclideCheckbox');

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
        var checkbox = _reactForAtom.React.createElement(_nuclideUiLibNuclideCheckbox.NuclideCheckbox, {
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
          _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
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
//# sourceMappingURL=data:application/json;base64,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SUcsbUJBQW1CO0dBQVMsb0JBQU0sU0FBUzs7QUEwSWpELE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRmlsZURpYWxvZ0NvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7QXRvbUlucHV0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnO1xuaW1wb3J0IHtOdWNsaWRlQ2hlY2tib3h9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL051Y2xpZGVDaGVja2JveCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCBwYXRoTW9kdWxlIGZyb20gJ3BhdGgnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IGRpc3BsYXlzIFVJIHRvIGNyZWF0ZSBhIG5ldyBmaWxlLlxuICovXG5jbGFzcyBGaWxlRGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pc0Nsb3NlZDogYm9vbGVhbjtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGljb25DbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8vIE1lc3NhZ2UgaXMgZGlzcGxheWVkIGFib3ZlIHRoZSBpbnB1dC5cbiAgICBtZXNzYWdlOiBQcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkLFxuICAgIC8vIFdpbGwgYmUgY2FsbGVkIChiZWZvcmUgYG9uQ2xvc2VgKSBpZiB0aGUgdXNlciBjb25maXJtcy4gIGBvbkNvbmZpcm1gIHdpbGxcbiAgICAvLyBiZSBjYWxsZWQgd2l0aCB0d28gYXJndW1lbnRzLCB0aGUgdmFsdWUgb2YgdGhlIGlucHV0IGZpZWxkIGFuZCBhIG1hcCBvZlxuICAgIC8vIG9wdGlvbiBuYW1lID0+IGJvb2wgKHRydWUgaWYgb3B0aW9uIHdhcyBzZWxlY3RlZCkuXG4gICAgb25Db25maXJtOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8vIFdpbGwgYmUgY2FsbGVkIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdXNlciBjb25maXJtcy5cbiAgICBvbkNsb3NlOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgIC8vIFdoZXRoZXIgb3Igbm90IHRvIGluaXRpYWxseSBzZWxlY3QgdGhlIGJhc2UgbmFtZSBvZiB0aGUgcGF0aC5cbiAgICAvLyBUaGlzIGlzIHVzZWZ1bCBmb3IgcmVuYW1pbmcgZmlsZXMuXG4gICAgc2VsZWN0QmFzZW5hbWU6IFByb3BUeXBlcy5ib29sLFxuICAgIC8vIEV4dHJhIG9wdGlvbnMgdG8gc2hvdyB0aGUgdXNlci4gIEtleSBpcyB0aGUgbmFtZSBvZiB0aGUgb3B0aW9uIGFuZCB2YWx1ZVxuICAgIC8vIGlzIGEgZGVzY3JpcHRpb24gc3RyaW5nIHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQuXG4gICAgYWRkaXRpb25hbE9wdGlvbnM6IFByb3BUeXBlcy5vYmplY3RPZihQcm9wVHlwZXMuc3RyaW5nKSxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGFkZGl0aW9uYWxPcHRpb25zOiB7fSxcbiAgfTtcblxuICBzdGF0ZToge1xuICAgIG9wdGlvbnM6IE9iamVjdDtcbiAgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgKHRoaXM6IGFueSkuX2Nsb3NlID0gdGhpcy5fY2xvc2UuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5fY29uZmlybSA9IHRoaXMuX2NvbmZpcm0uYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRG9jdW1lbnRDbGljayA9IHRoaXMuX2hhbmRsZURvY3VtZW50Q2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgb3B0aW9uczoge30sXG4gICAgfTtcbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gdGhpcy5wcm9wcy5hZGRpdGlvbmFsT3B0aW9ucykge1xuICAgICAgdGhpcy5zdGF0ZS5vcHRpb25zW25hbWVdID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKGlucHV0KSxcbiAgICAgIHtcbiAgICAgICAgJ2NvcmU6Y29uZmlybSc6IHRoaXMuX2NvbmZpcm0sXG4gICAgICAgICdjb3JlOmNhbmNlbCc6IHRoaXMuX2Nsb3NlLFxuICAgICAgfVxuICAgICkpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdEJhc2VuYW1lKSB7XG4gICAgICBjb25zdCB7ZGlyLCBuYW1lfSA9IHBhdGhNb2R1bGUucGFyc2UocGF0aCk7XG4gICAgICBjb25zdCBzZWxlY3Rpb25TdGFydCA9IGRpciA/IGRpci5sZW5ndGggKyAxIDogMDtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvblN0YXJ0ICsgbmFtZS5sZW5ndGg7XG4gICAgICBpbnB1dC5nZXRUZXh0RWRpdG9yKCkuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzAsIHNlbGVjdGlvblN0YXJ0XSwgWzAsIHNlbGVjdGlvbkVuZF1dKTtcbiAgICB9XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oYW5kbGVEb2N1bWVudENsaWNrKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGFuZGxlRG9jdW1lbnRDbGljayk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgbGFiZWxDbGFzc05hbWU7XG4gICAgaWYgKHRoaXMucHJvcHMuaWNvbkNsYXNzTmFtZSAhPSBudWxsKSB7XG4gICAgICBsYWJlbENsYXNzTmFtZSA9IGBpY29uICR7dGhpcy5wcm9wcy5pY29uQ2xhc3NOYW1lfWA7XG4gICAgfVxuXG4gICAgY29uc3QgY2hlY2tib3hlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgbmFtZSBpbiB0aGlzLnByb3BzLmFkZGl0aW9uYWxPcHRpb25zKSB7XG4gICAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5wcm9wcy5hZGRpdGlvbmFsT3B0aW9uc1tuYW1lXTtcbiAgICAgIGNvbnN0IGNoZWNrZWQgPSB0aGlzLnN0YXRlLm9wdGlvbnNbbmFtZV07XG4gICAgICBjb25zdCBjaGVja2JveCA9XG4gICAgICAgIDxOdWNsaWRlQ2hlY2tib3hcbiAgICAgICAgICBrZXk9e25hbWV9XG4gICAgICAgICAgY2hlY2tlZD17Y2hlY2tlZH1cbiAgICAgICAgICBvbkNoYW5nZT17dGhpcy5faGFuZGxlQWRkaXRpb25hbE9wdGlvbkNoYW5nZWQuYmluZCh0aGlzLCBuYW1lKX1cbiAgICAgICAgICBsYWJlbD17bWVzc2FnZX1cbiAgICAgICAgLz47XG4gICAgICBjaGVja2JveGVzLnB1c2goY2hlY2tib3gpO1xuICAgIH1cblxuICAgIC8vIGAudHJlZS12aWV3LWRpYWxvZ2AgaXMgdW5zdHlsZWQgYnV0IGlzIGFkZGVkIGJ5IEF0b20ncyB0cmVlLXZpZXcgcGFja2FnZVsxXSBhbmQgaXMgc3R5bGVkIGJ5XG4gICAgLy8gM3JkLXBhcnR5IHRoZW1lcy4gQWRkIGl0IHRvIG1ha2UgdGhpcyBwYWNrYWdlJ3MgbW9kYWxzIHN0eWxlYWJsZSB0aGUgc2FtZSBhcyBBdG9tJ3NcbiAgICAvLyB0cmVlLXZpZXcuXG4gICAgLy9cbiAgICAvLyBbMV0gaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdHJlZS12aWV3L2Jsb2IvdjAuMjAwLjAvbGliL2RpYWxvZy5jb2ZmZWUjTDdcbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBvdmVybGF5IGZyb20tdG9wXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidHJlZS12aWV3LWRpYWxvZ1wiIHJlZj1cImRpYWxvZ1wiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9e2xhYmVsQ2xhc3NOYW1lfT57dGhpcy5wcm9wcy5tZXNzYWdlfTwvbGFiZWw+XG4gICAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLmluaXRpYWxWYWx1ZX1cbiAgICAgICAgICAgIHJlZj1cImlucHV0XCJcbiAgICAgICAgICAvPlxuICAgICAgICAgIHtjaGVja2JveGVzfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUFkZGl0aW9uYWxPcHRpb25DaGFuZ2VkKG5hbWU6IHN0cmluZywgaXNDaGVja2VkOiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3Qge29wdGlvbnN9ID0gdGhpcy5zdGF0ZTtcbiAgICBvcHRpb25zW25hbWVdID0gaXNDaGVja2VkO1xuICAgIHRoaXMuc2V0U3RhdGUoe29wdGlvbnM6IG9wdGlvbnN9KTtcbiAgfVxuXG4gIF9oYW5kbGVEb2N1bWVudENsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGRpYWxvZyA9IHRoaXMucmVmc1snZGlhbG9nJ107XG4gICAgLy8gSWYgdGhlIGNsaWNrIGRpZCBub3QgaGFwcGVuIG9uIHRoZSBkaWFsb2cgb3Igb24gYW55IG9mIGl0cyBkZXNjZW5kYW50cyxcbiAgICAvLyB0aGUgY2xpY2sgd2FzIGVsc2V3aGVyZSBvbiB0aGUgZG9jdW1lbnQgYW5kIHNob3VsZCBjbG9zZSB0aGUgbW9kYWwuXG4gICAgaWYgKGV2ZW50LnRhcmdldCAhPT0gZGlhbG9nICYmICFkaWFsb2cuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgdGhpcy5fY2xvc2UoKTtcbiAgICB9XG4gIH1cblxuICBfY29uZmlybSgpIHtcbiAgICB0aGlzLnByb3BzLm9uQ29uZmlybSh0aGlzLnJlZnMuaW5wdXQuZ2V0VGV4dCgpLCB0aGlzLnN0YXRlLm9wdGlvbnMpO1xuICAgIHRoaXMuX2Nsb3NlKCk7XG4gIH1cblxuICBfY2xvc2UoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZURpYWxvZ0NvbXBvbmVudDtcbiJdfQ==