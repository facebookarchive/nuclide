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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var PropTypes = _reactForAtom2['default'].PropTypes;

/**
 * Component that displays UI to create a new file.
 */

var FileDialogComponent = (function (_React$Component) {
  _inherits(FileDialogComponent, _React$Component);

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
      this._subscriptions.add(atom.commands.add(_reactForAtom2['default'].findDOMNode(input), {
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

      return _reactForAtom2['default'].createElement(
        'atom-panel',
        { 'class': 'modal from-top', key: 'add-dialog' },
        _reactForAtom2['default'].createElement(
          'label',
          { className: labelClassName },
          this.props.message
        ),
        _reactForAtom2['default'].createElement(_uiAtomInput2['default'], {
          initialValue: this.props.initialValue,
          onBlur: this._close,
          ref: 'input'
        })
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
})(_reactForAtom2['default'].Component);

FileDialogComponent.propTypes = {
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
};

module.exports = FileDialogComponent;
//# sourceMappingURL=data:application/json;base64,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SyxrQkFBRztBQUNQLFVBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7S0FDRjs7O1NBL0RHLG1CQUFtQjtHQUFTLDBCQUFNLFNBQVM7O0FBa0VqRCxtQkFBbUIsQ0FBQyxTQUFTLEdBQUc7QUFDOUIsZUFBYSxFQUFFLFNBQVMsQ0FBQyxNQUFNO0FBQy9CLGNBQVksRUFBRSxTQUFTLENBQUMsTUFBTTs7QUFFOUIsU0FBTyxFQUFFLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVTs7QUFFckMsV0FBUyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTs7QUFFcEMsU0FBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVTs7O0FBR2xDLGdCQUFjLEVBQUUsU0FBUyxDQUFDLElBQUk7Q0FDL0IsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDIiwiZmlsZSI6IkZpbGVEaWFsb2dDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgQXRvbUlucHV0IGZyb20gJy4uLy4uL3VpL2F0b20taW5wdXQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCBwYXRoTW9kdWxlIGZyb20gJ3BhdGgnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vKipcbiAqIENvbXBvbmVudCB0aGF0IGRpc3BsYXlzIFVJIHRvIGNyZWF0ZSBhIG5ldyBmaWxlLlxuICovXG5jbGFzcyBGaWxlRGlhbG9nQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9pc0Nsb3NlZDogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY2xvc2UgPSB0aGlzLl9jbG9zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NvbmZpcm0gPSB0aGlzLl9jb25maXJtLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIFJlYWN0LmZpbmRET01Ob2RlKGlucHV0KSxcbiAgICAgIHtcbiAgICAgICAgJ2NvcmU6Y29uZmlybSc6IHRoaXMuX2NvbmZpcm0sXG4gICAgICAgICdjb3JlOmNhbmNlbCc6IHRoaXMuX2Nsb3NlLFxuICAgICAgfVxuICAgICkpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdEJhc2VuYW1lKSB7XG4gICAgICBjb25zdCB7ZGlyLCBuYW1lfSA9IHBhdGhNb2R1bGUucGFyc2UocGF0aCk7XG4gICAgICBjb25zdCBzZWxlY3Rpb25TdGFydCA9IGRpciA/IGRpci5sZW5ndGggKyAxIDogMDtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvblN0YXJ0ICsgbmFtZS5sZW5ndGg7XG4gICAgICBpbnB1dC5nZXRUZXh0RWRpdG9yKCkuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzAsIHNlbGVjdGlvblN0YXJ0XSwgWzAsIHNlbGVjdGlvbkVuZF1dKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBsYWJlbENsYXNzTmFtZTtcbiAgICBpZiAodGhpcy5wcm9wcy5pY29uQ2xhc3NOYW1lICE9IG51bGwpIHtcbiAgICAgIGxhYmVsQ2xhc3NOYW1lID0gYGljb24gJHt0aGlzLnByb3BzLmljb25DbGFzc05hbWV9YDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tcGFuZWwgY2xhc3M9XCJtb2RhbCBmcm9tLXRvcFwiIGtleT1cImFkZC1kaWFsb2dcIj5cbiAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT17bGFiZWxDbGFzc05hbWV9Pnt0aGlzLnByb3BzLm1lc3NhZ2V9PC9sYWJlbD5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVmFsdWV9XG4gICAgICAgICAgb25CbHVyPXt0aGlzLl9jbG9zZX1cbiAgICAgICAgICByZWY9XCJpbnB1dFwiXG4gICAgICAgIC8+XG4gICAgICA8L2F0b20tcGFuZWw+XG4gICAgKTtcbiAgfVxuXG4gIF9jb25maXJtKCkge1xuICAgIHRoaXMucHJvcHMub25Db25maXJtKHRoaXMucmVmcy5pbnB1dC5nZXRUZXh0KCkpO1xuICAgIHRoaXMuX2Nsb3NlKCk7XG4gIH1cblxuICBfY2xvc2UoKSB7XG4gICAgaWYgKCF0aGlzLl9pc0Nsb3NlZCkge1xuICAgICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuICAgICAgdGhpcy5wcm9wcy5vbkNsb3NlKCk7XG4gICAgfVxuICB9XG59XG5cbkZpbGVEaWFsb2dDb21wb25lbnQucHJvcFR5cGVzID0ge1xuICBpY29uQ2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICBpbml0aWFsVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIC8vIE1lc3NhZ2UgaXMgZGlzcGxheWVkIGFib3ZlIHRoZSBpbnB1dC5cbiAgbWVzc2FnZTogUHJvcFR5cGVzLmVsZW1lbnQuaXNSZXF1aXJlZCxcbiAgLy8gV2lsbCBiZSBjYWxsZWQgKGJlZm9yZSBgb25DbG9zZWApIGlmIHRoZSB1c2VyIGNvbmZpcm1zLlxuICBvbkNvbmZpcm06IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIC8vIFdpbGwgYmUgY2FsbGVkIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgdXNlciBjb25maXJtcy5cbiAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgLy8gV2hldGhlciBvciBub3QgdG8gaW5pdGlhbGx5IHNlbGVjdCB0aGUgYmFzZSBuYW1lIG9mIHRoZSBwYXRoLlxuICAvLyBUaGlzIGlzIHVzZWZ1bCBmb3IgcmVuYW1pbmcgZmlsZXMuXG4gIHNlbGVjdEJhc2VuYW1lOiBQcm9wVHlwZXMuYm9vbCxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZURpYWxvZ0NvbXBvbmVudDtcbiJdfQ==