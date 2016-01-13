var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var React = require('react-for-atom');

var PropTypes = React.PropTypes;

/**
 * An input field rendered as an <atom-text-editor mini />.
 */

var AtomInput = (function (_React$Component) {
  _inherits(AtomInput, _React$Component);

  _createClass(AtomInput, null, [{
    key: 'propTypes',
    value: {
      disabled: PropTypes.bool,
      initialValue: PropTypes.string.isRequired,
      placeholderText: PropTypes.string,
      onFocus: PropTypes.func,
      onClick: PropTypes.func,
      onDidChange: PropTypes.func,
      onBlur: PropTypes.func,
      size: PropTypes.oneOf(['xs', 'sm', 'lg'])
    },
    enumerable: true
  }, {
    key: 'defaultProps',
    value: {
      disabled: false,
      initialValue: '',
      placeholderText: null,
      onClick: function onClick() {},
      onDidChange: function onDidChange() {},
      onFocus: function onFocus() {},
      onBlur: function onBlur() {}
    },
    enumerable: true
  }]);

  function AtomInput(props) {
    _classCallCheck(this, AtomInput);

    _get(Object.getPrototypeOf(AtomInput.prototype), 'constructor', this).call(this, props);
    this.state = {
      value: props.initialValue
    };
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
      var className = undefined;
      if (this.props.size) {
        className = 'atom-text-editor-' + this.props.size;
      }

      return React.createElement(
        'atom-text-editor',
        {
          'class': className,
          mini: true,
          onClick: this.props.onClick,
          onFocus: this.props.onFocus,
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
      return React.findDOMNode(this);
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
//# sourceMappingURL=data:application/json;base64,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LENBQUM7S0FDbkQ7OztXQUVvQixpQ0FBMkI7QUFDOUMsYUFBTyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFSSxpQkFBUztBQUNaLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN0Qzs7O1NBdkhHLFNBQVM7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUEwSHZDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6IkF0b21JbnB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuLyoqXG4gKiBBbiBpbnB1dCBmaWVsZCByZW5kZXJlZCBhcyBhbiA8YXRvbS10ZXh0LWVkaXRvciBtaW5pIC8+LlxuICovXG5jbGFzcyBBdG9tSW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIF9kaXNwb3NhYmxlczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcGxhY2Vob2xkZXJUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRGlkQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ3hzJywgJ3NtJywgJ2xnJ10pLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgcGxhY2Vob2xkZXJUZXh0OiBudWxsLFxuICAgIG9uQ2xpY2s6ICgpID0+IHt9LFxuICAgIG9uRGlkQ2hhbmdlOiAoKSA9PiB7fSxcbiAgICBvbkZvY3VzOiAoKSA9PiB7fSxcbiAgICBvbkJsdXI6ICgpID0+IHt9LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBPYmplY3QpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHZhbHVlOiBwcm9wcy5pbml0aWFsVmFsdWUsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIGNvbnN0IGRpc3Bvc2FibGVzID0gdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgLy8gVGhlcmUgZG9lcyBub3QgYXBwZWFyIHRvIGJlIGFueSBzb3J0IG9mIGluZmluaXRlIGxvb3Agd2hlcmUgY2FsbGluZ1xuICAgIC8vIHNldFN0YXRlKHt2YWx1ZX0pIGluIHJlc3BvbnNlIHRvIG9uRGlkQ2hhbmdlKCkgY2F1c2VzIGFub3RoZXIgY2hhbmdlXG4gICAgLy8gZXZlbnQuXG5cbiAgICBjb25zdCB0ZXh0RWRpdG9yID0gdGhpcy5nZXRUZXh0RWRpdG9yKCk7XG4gICAgZGlzcG9zYWJsZXMuYWRkKHRleHRFZGl0b3Iub25EaWRDaGFuZ2UoKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7dmFsdWU6IHRleHRFZGl0b3IuZ2V0VGV4dCgpfSk7XG4gICAgICB0aGlzLnByb3BzLm9uRGlkQ2hhbmdlLmNhbGwobnVsbCwgdGV4dEVkaXRvci5nZXRUZXh0KCkpO1xuICAgIH0pKTtcbiAgICBjb25zdCBwbGFjZWhvbGRlclRleHQgPSB0aGlzLnByb3BzLnBsYWNlaG9sZGVyVGV4dDtcbiAgICBpZiAocGxhY2Vob2xkZXJUZXh0ICE9PSBudWxsKSB7XG4gICAgICB0ZXh0RWRpdG9yLnNldFBsYWNlaG9sZGVyVGV4dChwbGFjZWhvbGRlclRleHQpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlzYWJsZWRTdGF0ZSh0cnVlKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKG5leHRQcm9wcy5kaXNhYmxlZCAhPT0gdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlzYWJsZWRTdGF0ZShuZXh0UHJvcHMuZGlzYWJsZWQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIC8vIE5vdGUgdGhhdCBkZXN0cm95KCkgaXMgbm90IHBhcnQgb2YgVGV4dEVkaXRvcidzIHB1YmxpYyBBUEkuXG4gICAgdGhpcy5nZXRUZXh0RWRpdG9yKCkuZGVzdHJveSgpO1xuXG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZURpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIC8vIEhhY2sgdG8gc2V0IFRleHRFZGl0b3IgdG8gcmVhZC1vbmx5IG1vZGUsIHBlciBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy82ODgwXG4gICAgaWYgKGlzRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCAnLTEnKTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBsZXQgY2xhc3NOYW1lO1xuICAgIGlmICh0aGlzLnByb3BzLnNpemUpIHtcbiAgICAgIGNsYXNzTmFtZSA9IGBhdG9tLXRleHQtZWRpdG9yLSR7dGhpcy5wcm9wcy5zaXplfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXRleHQtZWRpdG9yXG4gICAgICAgIGNsYXNzPXtjbGFzc05hbWV9XG4gICAgICAgIG1pbmlcbiAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfVxuICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9XG4gICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9PlxuICAgICAgICB7dGhpcy5zdGF0ZS52YWx1ZX1cbiAgICAgIDwvYXRvbS10ZXh0LWVkaXRvcj5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbHVlO1xuICB9XG5cbiAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5zZXRUZXh0KHRleHQpO1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5nZXRNb2RlbCgpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2UoY2FsbGJhY2s6ICgpID0+IGFueSk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvcigpLm9uRGlkQ2hhbmdlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9nZXRUZXh0RWRpdG9yRWxlbWVudCgpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50IHtcbiAgICByZXR1cm4gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gIH1cblxuICBmb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5tb3ZlVG9FbmRPZkxpbmUoKTtcbiAgICB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLmZvY3VzKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tSW5wdXQ7XG4iXX0=