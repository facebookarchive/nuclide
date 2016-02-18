var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var classNames = require('classnames');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('react-for-atom');

var React = _require2.React;
var ReactDOM = _require2.ReactDOM;

var ENTER_KEY_CODE = 13;
var ESCAPE_KEY_CODE = 27;

/**
 * An input field rendered as an <atom-text-editor mini />.
 */

var AtomInput = (function (_React$Component) {
  _inherits(AtomInput, _React$Component);

  _createClass(AtomInput, null, [{
    key: 'defaultProps',
    value: {
      disabled: false,
      initialValue: '',
      placeholderText: null,
      onClick: function onClick() {},
      onDidChange: function onDidChange() {},
      onFocus: function onFocus() {},
      onBlur: function onBlur() {},
      unstyled: false
    },
    enumerable: true
  }]);

  function AtomInput(props) {
    _classCallCheck(this, AtomInput);

    _get(Object.getPrototypeOf(AtomInput.prototype), 'constructor', this).call(this, props);
    this.state = {
      value: props.initialValue
    };

    this._analyzeKeyCodes = this._analyzeKeyCodes.bind(this);
  }

  _createClass(AtomInput, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var disposables = this._disposables = new CompositeDisposable();

      // There does not appear to be any sort of infinite loop where calling
      // setState({value}) in response to onDidChange() causes another change
      // event.

      var textEditor = this.getTextEditor();
      disposables.add(textEditor.onDidChange(function () {
        _this.setState({ value: textEditor.getText() });
        _this.props.onDidChange.call(null, textEditor.getText());
      }));
      var placeholderText = this.props.placeholderText;
      if (placeholderText !== null) {
        textEditor.setPlaceholderText(placeholderText);
      }
      if (this.props.disabled) {
        this._updateDisabledState(true);
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.disabled !== this.props.disabled) {
        this._updateDisabledState(nextProps.disabled);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      // Note that destroy() is not part of TextEditor's public API.
      this.getTextEditor().destroy();

      if (this._disposables) {
        this._disposables.dispose();
        this._disposables = null;
      }
    }
  }, {
    key: '_updateDisabledState',
    value: function _updateDisabledState(isDisabled) {
      // Hack to set TextEditor to read-only mode, per https://github.com/atom/atom/issues/6880
      if (isDisabled) {
        this._getTextEditorElement().removeAttribute('tabindex');
      } else {
        this._getTextEditorElement().setAttribute('tabindex', '-1');
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var className = classNames(this.props.className, _defineProperty({
        'atom-text-editor-unstyled': this.props.unstyled
      }, 'atom-text-editor-' + this.props.size, this.props.size != null));

      return React.createElement(
        'atom-text-editor',
        {
          'class': className,
          mini: true,
          onClick: this.props.onClick,
          onFocus: this.props.onFocus,
          onKeyUp: this._analyzeKeyCodes,
          onBlur: this.props.onBlur },
        this.state.value
      );
    }
  }, {
    key: 'getText',
    value: function getText() {
      return this.state.value;
    }
  }, {
    key: 'setText',
    value: function setText(text) {
      this.getTextEditor().setText(text);
    }
  }, {
    key: 'getTextEditor',
    value: function getTextEditor() {
      return this._getTextEditorElement().getModel();
    }
  }, {
    key: 'onDidChange',
    value: function onDidChange(callback) {
      return this.getTextEditor().onDidChange(callback);
    }
  }, {
    key: '_getTextEditorElement',
    value: function _getTextEditorElement() {
      return ReactDOM.findDOMNode(this);
    }
  }, {
    key: '_analyzeKeyCodes',
    value: function _analyzeKeyCodes(event) {
      switch (event.keyCode) {
        case ENTER_KEY_CODE:
          if (this.props.onConfirm != null) {
            this.props.onConfirm();
          }
          break;
        case ESCAPE_KEY_CODE:
          if (this.props.onCancel != null) {
            this.props.onCancel();
          }
          break;
      }
    }
  }, {
    key: 'focus',
    value: function focus() {
      this.getTextEditor().moveToEndOfLine();
      this._getTextEditorElement().focus();
    }
  }]);

  return AtomInput;
})(React.Component);

module.exports = AtomInput;
//# sourceMappingURL=data:application/json;base64,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OUMsYUFBTyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25DOzs7V0FFZSwwQkFBQyxLQUE2QixFQUFRO0FBQ3BELGNBQVEsS0FBSyxDQUFDLE9BQU87QUFDbkIsYUFBSyxjQUFjO0FBQ2pCLGNBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxFQUFFO0FBQ2hDLGdCQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1dBQ3hCO0FBQ0QsZ0JBQU07QUFBQSxBQUNSLGFBQUssZUFBZTtBQUNsQixjQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLElBQUksRUFBRTtBQUMvQixnQkFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztXQUN2QjtBQUNELGdCQUFNO0FBQUEsT0FDVDtLQUNGOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN0Qzs7O1NBL0hHLFNBQVM7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUFrSXZDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6IkF0b21JbnB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5jb25zdCBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3QgRU5URVJfS0VZX0NPREUgPSAxMztcbmNvbnN0IEVTQ0FQRV9LRVlfQ09ERSA9IDI3O1xuXG50eXBlIERlZmF1bHRQcm9wcyA9IHtcbiAgZGlzYWJsZWQ6IGJvb2xlYW47XG4gIGluaXRpYWxWYWx1ZTogc3RyaW5nO1xuICBwbGFjZWhvbGRlclRleHQ6ID9zdHJpbmc7XG4gIG9uQ2xpY2s6ICgpID0+IHZvaWQ7XG4gIG9uRGlkQ2hhbmdlOiAoKSA9PiB2b2lkO1xuICBvbkZvY3VzOiAoKSA9PiB2b2lkO1xuICBvbkJsdXI6ICgpID0+IHZvaWQ7XG4gIHVuc3R5bGVkOiBib29sZWFuO1xufTtcblxudHlwZSBQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiBzdHJpbmc7XG4gIGRpc2FibGVkOiBib29sZWFuO1xuICBpbml0aWFsVmFsdWU6IHN0cmluZztcbiAgcGxhY2Vob2xkZXJUZXh0OiBzdHJpbmc7XG4gIG9uRm9jdXM6ICgpID0+IG1peGVkO1xuICBvbkNsaWNrOiAoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpID0+IG1peGVkO1xuICBvbkRpZENoYW5nZTogKHRleHQ6IHN0cmluZykgPT4gbWl4ZWQ7XG4gIG9uQ29uZmlybTogKCkgPT4gbWl4ZWQ7XG4gIG9uQ2FuY2VsOiAoKSA9PiBtaXhlZDtcbiAgb25CbHVyOiAoKSA9PiBtaXhlZDtcbiAgc2l6ZTogJ3hzJyB8ICdzbScgfCAnbGcnO1xuICB1bnN0eWxlZDogYm9vbGVhbjtcblxufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgdmFsdWU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBBbiBpbnB1dCBmaWVsZCByZW5kZXJlZCBhcyBhbiA8YXRvbS10ZXh0LWVkaXRvciBtaW5pIC8+LlxuICovXG5jbGFzcyBBdG9tSW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8RGVmYXVsdFByb3BzLCBQcm9wcywgU3RhdGU+IHtcblxuICBfZGlzcG9zYWJsZXM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgcGxhY2Vob2xkZXJUZXh0OiBudWxsLFxuICAgIG9uQ2xpY2s6ICgpID0+IHt9LFxuICAgIG9uRGlkQ2hhbmdlOiAoKSA9PiB7fSxcbiAgICBvbkZvY3VzOiAoKSA9PiB7fSxcbiAgICBvbkJsdXI6ICgpID0+IHt9LFxuICAgIHVuc3R5bGVkOiBmYWxzZSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHZhbHVlOiBwcm9wcy5pbml0aWFsVmFsdWUsXG4gICAgfTtcblxuICAgIHRoaXMuX2FuYWx5emVLZXlDb2RlcyA9IHRoaXMuX2FuYWx5emVLZXlDb2Rlcy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3QgZGlzcG9zYWJsZXMgPSB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBUaGVyZSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYW55IHNvcnQgb2YgaW5maW5pdGUgbG9vcCB3aGVyZSBjYWxsaW5nXG4gICAgLy8gc2V0U3RhdGUoe3ZhbHVlfSkgaW4gcmVzcG9uc2UgdG8gb25EaWRDaGFuZ2UoKSBjYXVzZXMgYW5vdGhlciBjaGFuZ2VcbiAgICAvLyBldmVudC5cblxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldFRleHRFZGl0b3IoKTtcbiAgICBkaXNwb3NhYmxlcy5hZGQodGV4dEVkaXRvci5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGV4dEVkaXRvci5nZXRUZXh0KCl9KTtcbiAgICAgIHRoaXMucHJvcHMub25EaWRDaGFuZ2UuY2FsbChudWxsLCB0ZXh0RWRpdG9yLmdldFRleHQoKSk7XG4gICAgfSkpO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyVGV4dCA9IHRoaXMucHJvcHMucGxhY2Vob2xkZXJUZXh0O1xuICAgIGlmIChwbGFjZWhvbGRlclRleHQgIT09IG51bGwpIHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KHBsYWNlaG9sZGVyVGV4dCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNhYmxlZFN0YXRlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAobmV4dFByb3BzLmRpc2FibGVkICE9PSB0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNhYmxlZFN0YXRlKG5leHRQcm9wcy5kaXNhYmxlZCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgLy8gTm90ZSB0aGF0IGRlc3Ryb3koKSBpcyBub3QgcGFydCBvZiBUZXh0RWRpdG9yJ3MgcHVibGljIEFQSS5cbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5kZXN0cm95KCk7XG5cbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8gSGFjayB0byBzZXQgVGV4dEVkaXRvciB0byByZWFkLW9ubHkgbW9kZSwgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY4ODBcbiAgICBpZiAoaXNEaXNhYmxlZCkge1xuICAgICAgdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXModGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yLXVuc3R5bGVkJzogdGhpcy5wcm9wcy51bnN0eWxlZCxcbiAgICAgIFtgYXRvbS10ZXh0LWVkaXRvci0ke3RoaXMucHJvcHMuc2l6ZX1gXTogKHRoaXMucHJvcHMuc2l6ZSAhPSBudWxsKSxcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICA8YXRvbS10ZXh0LWVkaXRvclxuICAgICAgICBjbGFzcz17Y2xhc3NOYW1lfVxuICAgICAgICBtaW5pXG4gICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25DbGlja31cbiAgICAgICAgb25Gb2N1cz17dGhpcy5wcm9wcy5vbkZvY3VzfVxuICAgICAgICBvbktleVVwPXt0aGlzLl9hbmFseXplS2V5Q29kZXN9XG4gICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9PlxuICAgICAgICB7dGhpcy5zdGF0ZS52YWx1ZX1cbiAgICAgIDwvYXRvbS10ZXh0LWVkaXRvcj5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbHVlO1xuICB9XG5cbiAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5zZXRUZXh0KHRleHQpO1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5nZXRNb2RlbCgpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2UoY2FsbGJhY2s6ICgpID0+IGFueSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUZXh0RWRpdG9yKCkub25EaWRDaGFuZ2UoY2FsbGJhY2spO1xuICB9XG5cbiAgX2dldFRleHRFZGl0b3JFbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgfVxuXG4gIF9hbmFseXplS2V5Q29kZXMoZXZlbnQ6IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgRU5URVJfS0VZX0NPREU6XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ29uZmlybSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRVNDQVBFX0tFWV9DT0RFOlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNhbmNlbCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvcigpLm1vdmVUb0VuZE9mTGluZSgpO1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuZm9jdXMoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21JbnB1dDtcbiJdfQ==