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
      this._subscriptions.add(atom.commands.add(_reactForAtom.ReactDOM.findDOMNode(input), {
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
//# sourceMappingURL=data:application/json;base64,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QVM7VUFDOUQ7QUFDRSx3QkFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxBQUFDO0FBQ3RDLGtCQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQztBQUNwQixlQUFHLEVBQUMsT0FBTztZQUNYO1NBQ0U7T0FDSyxDQUNiO0tBQ0g7OztXQUVPLG9CQUFHO0FBQ1QsVUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNoRCxVQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDZjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNuQixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixZQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3RCO0tBQ0Y7OztTQXBGRyxtQkFBbUI7R0FBUyxvQkFBTSxTQUFTOztBQXVGakQsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQyIsImZpbGUiOiJGaWxlRGlhbG9nQ29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi91aS9hdG9tLWlucHV0JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IHBhdGhNb2R1bGUgZnJvbSAncGF0aCc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbi8qKlxuICogQ29tcG9uZW50IHRoYXQgZGlzcGxheXMgVUkgdG8gY3JlYXRlIGEgbmV3IGZpbGUuXG4gKi9cbmNsYXNzIEZpbGVEaWFsb2dDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2lzQ2xvc2VkOiBib29sZWFuO1xuXG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaWNvbkNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICBpbml0aWFsVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgLy8gTWVzc2FnZSBpcyBkaXNwbGF5ZWQgYWJvdmUgdGhlIGlucHV0LlxuICAgIG1lc3NhZ2U6IFByb3BUeXBlcy5lbGVtZW50LmlzUmVxdWlyZWQsXG4gICAgLy8gV2lsbCBiZSBjYWxsZWQgKGJlZm9yZSBgb25DbG9zZWApIGlmIHRoZSB1c2VyIGNvbmZpcm1zLlxuICAgIG9uQ29uZmlybTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvLyBXaWxsIGJlIGNhbGxlZCByZWdhcmRsZXNzIG9mIHdoZXRoZXIgdGhlIHVzZXIgY29uZmlybXMuXG4gICAgb25DbG9zZTogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgICAvLyBXaGV0aGVyIG9yIG5vdCB0byBpbml0aWFsbHkgc2VsZWN0IHRoZSBiYXNlIG5hbWUgb2YgdGhlIHBhdGguXG4gICAgLy8gVGhpcyBpcyB1c2VmdWwgZm9yIHJlbmFtaW5nIGZpbGVzLlxuICAgIHNlbGVjdEJhc2VuYW1lOiBQcm9wVHlwZXMuYm9vbCxcbiAgfTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlciguLi5hcmd1bWVudHMpO1xuICAgIHRoaXMuX2lzQ2xvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fY2xvc2UgPSB0aGlzLl9jbG9zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2NvbmZpcm0gPSB0aGlzLl9jb25maXJtLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBpbnB1dCA9IHRoaXMucmVmcy5pbnB1dDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgIFJlYWN0RE9NLmZpbmRET01Ob2RlKGlucHV0KSxcbiAgICAgIHtcbiAgICAgICAgJ2NvcmU6Y29uZmlybSc6IHRoaXMuX2NvbmZpcm0sXG4gICAgICAgICdjb3JlOmNhbmNlbCc6IHRoaXMuX2Nsb3NlLFxuICAgICAgfVxuICAgICkpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZTtcbiAgICBpbnB1dC5mb2N1cygpO1xuICAgIGlmICh0aGlzLnByb3BzLnNlbGVjdEJhc2VuYW1lKSB7XG4gICAgICBjb25zdCB7ZGlyLCBuYW1lfSA9IHBhdGhNb2R1bGUucGFyc2UocGF0aCk7XG4gICAgICBjb25zdCBzZWxlY3Rpb25TdGFydCA9IGRpciA/IGRpci5sZW5ndGggKyAxIDogMDtcbiAgICAgIGNvbnN0IHNlbGVjdGlvbkVuZCA9IHNlbGVjdGlvblN0YXJ0ICsgbmFtZS5sZW5ndGg7XG4gICAgICBpbnB1dC5nZXRUZXh0RWRpdG9yKCkuc2V0U2VsZWN0ZWRCdWZmZXJSYW5nZShbWzAsIHNlbGVjdGlvblN0YXJ0XSwgWzAsIHNlbGVjdGlvbkVuZF1dKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGxldCBsYWJlbENsYXNzTmFtZTtcbiAgICBpZiAodGhpcy5wcm9wcy5pY29uQ2xhc3NOYW1lICE9IG51bGwpIHtcbiAgICAgIGxhYmVsQ2xhc3NOYW1lID0gYGljb24gJHt0aGlzLnByb3BzLmljb25DbGFzc05hbWV9YDtcbiAgICB9XG5cbiAgICAvLyBgLnRyZWUtdmlldy1kaWFsb2dgIGlzIHVuc3R5bGVkIGJ1dCBpcyBhZGRlZCBieSBBdG9tJ3MgdHJlZS12aWV3IHBhY2thZ2VbMV0gYW5kIGlzIHN0eWxlZCBieVxuICAgIC8vIDNyZC1wYXJ0eSB0aGVtZXMuIEFkZCBpdCB0byBtYWtlIHRoaXMgcGFja2FnZSdzIG1vZGFscyBzdHlsZWFibGUgdGhlIHNhbWUgYXMgQXRvbSdzXG4gICAgLy8gdHJlZS12aWV3LlxuICAgIC8vXG4gICAgLy8gWzFdIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjIwMC4wL2xpYi9kaWFsb2cuY29mZmVlI0w3XG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXBhbmVsIGNsYXNzPVwibW9kYWwgb3ZlcmxheSBmcm9tLXRvcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRyZWUtdmlldy1kaWFsb2dcIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPXtsYWJlbENsYXNzTmFtZX0+e3RoaXMucHJvcHMubWVzc2FnZX08L2xhYmVsPlxuICAgICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZT17dGhpcy5wcm9wcy5pbml0aWFsVmFsdWV9XG4gICAgICAgICAgICBvbkJsdXI9e3RoaXMuX2Nsb3NlfVxuICAgICAgICAgICAgcmVmPVwiaW5wdXRcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9hdG9tLXBhbmVsPlxuICAgICk7XG4gIH1cblxuICBfY29uZmlybSgpIHtcbiAgICB0aGlzLnByb3BzLm9uQ29uZmlybSh0aGlzLnJlZnMuaW5wdXQuZ2V0VGV4dCgpKTtcbiAgICB0aGlzLl9jbG9zZSgpO1xuICB9XG5cbiAgX2Nsb3NlKCkge1xuICAgIGlmICghdGhpcy5faXNDbG9zZWQpIHtcbiAgICAgIHRoaXMuX2lzQ2xvc2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMucHJvcHMub25DbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVEaWFsb2dDb21wb25lbnQ7XG4iXX0=