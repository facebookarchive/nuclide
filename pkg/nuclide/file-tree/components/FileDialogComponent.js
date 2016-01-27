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
      // Will be called (before `onClose`) if the user confirms.
      onConfirm: PropTypes.func.isRequired,
      // Will be called regardless of whether the user confirms.
      onClose: PropTypes.func.isRequired,
      // Whether or not to initially select the base name of the path.
      // This is useful for renaming files.
      selectBasename: PropTypes.bool
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
  }

  _createClass(FileDialogComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var input = this.refs.input;
      this._subscriptions.add(atom.commands.add(_reactForAtom.React.findDOMNode(input), {
        'core:confirm': this._confirm,
        'core:cancel': this._close
      }));
      var path = this.props.initialValue;
      input.focus();
      if (this.props.selectBasename) {
        var _pathModule$parse = _path2['default'].parse(path);

        var dir = _pathModule$parse.dir;
        var _name = _pathModule$parse.name;

        var selectionStart = dir ? dir.length + 1 : 0;
        var selectionEnd = selectionStart + _name.length;
        input.getTextEditor().setSelectedBufferRange([[0, selectionStart], [0, selectionEnd]]);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      var labelClassName = undefined;
      if (this.props.iconClassName != null) {
        labelClassName = 'icon ' + this.props.iconClassName;
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
          { className: 'tree-view-dialog' },
          _reactForAtom.React.createElement(
            'label',
            { className: labelClassName },
            this.props.message
          ),
          _reactForAtom.React.createElement(_uiAtomInput2['default'], {
            initialValue: this.props.initialValue,
            onBlur: this._close,
            ref: 'input'
          })
        )
      );
    }
  }, {
    key: '_confirm',
    value: function _confirm() {
      this.props.onConfirm(this.refs.input.getText());
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
//# sourceMappingURL=data:application/json;base64,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QVM7VUFDOUQ7QUFDRSx3QkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxBQUFDO0FBQ3RDLGtCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQztBQUNwQixlQUFHLEVBQUMsT0FBTztZQUNYO1NBQ0U7T0FDSyxDQUNiO0tBQ0g7OztXQUVPLG9CQUFHO0FBQ1QsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoRCxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNuQixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3RCO0tBQ0Y7OztTQXBGRyxtQkFBbUI7R0FBUyxvQkFBTSxTQUFTOztBQXVGakQsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJGaWxlRGlhbG9nQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi91aS9hdG9tLWlucHV0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCBwYXRoTW9kdWxlIGZyb20gJ3BhdGgnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IGRpc3BsYXlzIFVJIHRvIGNyZWF0ZSBhIG5ldyBmaWxlLlxuICovXG5jbGFzcyBGaWxlRGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pc0Nsb3NlZDogYm9vbGVhbjtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGljb25DbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIC8vIE1lc3NhZ2UgaXMgZGlzcGxheWVkIGFib3ZlIHRoZSBpbnB1dC5cbiAgICBtZXNzYWdlOiBQcm9wVHlwZXMuZWxlbWVudC5pc1JlcXVpcmVkLFxuICAgIC8vIFdpbGwgYmUgY2FsbGVkIChiZWZvcmUgYG9uQ2xvc2VgKSBpZiB0aGUgdXNlciBjb25maXJtcy5cbiAgICBvbkNvbmZpcm06IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLy8gV2lsbCBiZSBjYWxsZWQgcmVnYXJkbGVzcyBvZiB3aGV0aGVyIHRoZSB1c2VyIGNvbmZpcm1zLlxuICAgIG9uQ2xvc2U6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gICAgLy8gV2hldGhlciBvciBub3QgdG8gaW5pdGlhbGx5IHNlbGVjdCB0aGUgYmFzZSBuYW1lIG9mIHRoZSBwYXRoLlxuICAgIC8vIFRoaXMgaXMgdXNlZnVsIGZvciByZW5hbWluZyBmaWxlcy5cbiAgICBzZWxlY3RCYXNlbmFtZTogUHJvcFR5cGVzLmJvb2wsXG4gIH07XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoLi4uYXJndW1lbnRzKTtcbiAgICB0aGlzLl9pc0Nsb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2Nsb3NlID0gdGhpcy5fY2xvc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9jb25maXJtID0gdGhpcy5fY29uZmlybS5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3QgaW5wdXQgPSB0aGlzLnJlZnMuaW5wdXQ7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICBSZWFjdC5maW5kRE9NTm9kZShpbnB1dCksXG4gICAgICB7XG4gICAgICAgICdjb3JlOmNvbmZpcm0nOiB0aGlzLl9jb25maXJtLFxuICAgICAgICAnY29yZTpjYW5jZWwnOiB0aGlzLl9jbG9zZSxcbiAgICAgIH1cbiAgICApKTtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5wcm9wcy5pbml0aWFsVmFsdWU7XG4gICAgaW5wdXQuZm9jdXMoKTtcbiAgICBpZiAodGhpcy5wcm9wcy5zZWxlY3RCYXNlbmFtZSkge1xuICAgICAgY29uc3Qge2RpciwgbmFtZX0gPSBwYXRoTW9kdWxlLnBhcnNlKHBhdGgpO1xuICAgICAgY29uc3Qgc2VsZWN0aW9uU3RhcnQgPSBkaXIgPyBkaXIubGVuZ3RoICsgMSA6IDA7XG4gICAgICBjb25zdCBzZWxlY3Rpb25FbmQgPSBzZWxlY3Rpb25TdGFydCArIG5hbWUubGVuZ3RoO1xuICAgICAgaW5wdXQuZ2V0VGV4dEVkaXRvcigpLnNldFNlbGVjdGVkQnVmZmVyUmFuZ2UoW1swLCBzZWxlY3Rpb25TdGFydF0sIFswLCBzZWxlY3Rpb25FbmRdXSk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgbGFiZWxDbGFzc05hbWU7XG4gICAgaWYgKHRoaXMucHJvcHMuaWNvbkNsYXNzTmFtZSAhPSBudWxsKSB7XG4gICAgICBsYWJlbENsYXNzTmFtZSA9IGBpY29uICR7dGhpcy5wcm9wcy5pY29uQ2xhc3NOYW1lfWA7XG4gICAgfVxuXG4gICAgLy8gYC50cmVlLXZpZXctZGlhbG9nYCBpcyB1bnN0eWxlZCBidXQgaXMgYWRkZWQgYnkgQXRvbSdzIHRyZWUtdmlldyBwYWNrYWdlWzFdIGFuZCBpcyBzdHlsZWQgYnlcbiAgICAvLyAzcmQtcGFydHkgdGhlbWVzLiBBZGQgaXQgdG8gbWFrZSB0aGlzIHBhY2thZ2UncyBtb2RhbHMgc3R5bGVhYmxlIHRoZSBzYW1lIGFzIEF0b20nc1xuICAgIC8vIHRyZWUtdmlldy5cbiAgICAvL1xuICAgIC8vIFsxXSBodHRwczovL2dpdGh1Yi5jb20vYXRvbS90cmVlLXZpZXcvYmxvYi92MC4yMDAuMC9saWIvZGlhbG9nLmNvZmZlZSNMN1xuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS1wYW5lbCBjbGFzcz1cIm1vZGFsIG92ZXJsYXkgZnJvbS10b3BcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0cmVlLXZpZXctZGlhbG9nXCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT17bGFiZWxDbGFzc05hbWV9Pnt0aGlzLnByb3BzLm1lc3NhZ2V9PC9sYWJlbD5cbiAgICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgICBpbml0aWFsVmFsdWU9e3RoaXMucHJvcHMuaW5pdGlhbFZhbHVlfVxuICAgICAgICAgICAgb25CbHVyPXt0aGlzLl9jbG9zZX1cbiAgICAgICAgICAgIHJlZj1cImlucHV0XCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvYXRvbS1wYW5lbD5cbiAgICApO1xuICB9XG5cbiAgX2NvbmZpcm0oKSB7XG4gICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0odGhpcy5yZWZzLmlucHV0LmdldFRleHQoKSk7XG4gICAgdGhpcy5fY2xvc2UoKTtcbiAgfVxuXG4gIF9jbG9zZSgpIHtcbiAgICBpZiAoIXRoaXMuX2lzQ2xvc2VkKSB7XG4gICAgICB0aGlzLl9pc0Nsb3NlZCA9IHRydWU7XG4gICAgICB0aGlzLnByb3BzLm9uQ2xvc2UoKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlRGlhbG9nQ29tcG9uZW50O1xuIl19