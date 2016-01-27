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

var classNames = require('classnames');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;

var _require2 = require('react-for-atom');

var React = _require2.React;
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
      size: PropTypes.oneOf(['xs', 'sm', 'lg']),
      unstyled: PropTypes.bool
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
      var className = classNames(_defineProperty({
        'atom-text-editor-unstyled': this.props.unstyled
      }, 'atom-text-editor-' + this.props.size, this.props.size != null));

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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLHFCQUFxQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDaEQ7OztXQUVVLHFCQUFDLFFBQW1CLEVBQW1CO0FBQ2hELGFBQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuRDs7O1dBRW9CLGlDQUEyQjtBQUM5QyxhQUFPLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEM7OztXQUVJLGlCQUFTO0FBQ1osVUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3RDOzs7U0F6SEcsU0FBUztHQUFTLEtBQUssQ0FBQyxTQUFTOztBQTRIdkMsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMiLCJmaWxlIjoiQXRvbUlucHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3QgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IHtSZWFjdH0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG4vKipcbiAqIEFuIGlucHV0IGZpZWxkIHJlbmRlcmVkIGFzIGFuIDxhdG9tLXRleHQtZWRpdG9yIG1pbmkgLz4uXG4gKi9cbmNsYXNzIEF0b21JbnB1dCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX2Rpc3Bvc2FibGVzOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICBpbml0aWFsVmFsdWU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbiAgICBwbGFjZWhvbGRlclRleHQ6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgb25Gb2N1czogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25EaWRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uQmx1cjogUHJvcFR5cGVzLmZ1bmMsXG4gICAgc2l6ZTogUHJvcFR5cGVzLm9uZU9mKFsneHMnLCAnc20nLCAnbGcnXSksXG4gICAgdW5zdHlsZWQ6IFByb3BUeXBlcy5ib29sLFxuICB9O1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgcGxhY2Vob2xkZXJUZXh0OiBudWxsLFxuICAgIG9uQ2xpY2s6ICgpID0+IHt9LFxuICAgIG9uRGlkQ2hhbmdlOiAoKSA9PiB7fSxcbiAgICBvbkZvY3VzOiAoKSA9PiB7fSxcbiAgICBvbkJsdXI6ICgpID0+IHt9LFxuICAgIHVuc3R5bGVkOiBmYWxzZSxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogT2JqZWN0KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB2YWx1ZTogcHJvcHMuaW5pdGlhbFZhbHVlLFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIFRoZXJlIGRvZXMgbm90IGFwcGVhciB0byBiZSBhbnkgc29ydCBvZiBpbmZpbml0ZSBsb29wIHdoZXJlIGNhbGxpbmdcbiAgICAvLyBzZXRTdGF0ZSh7dmFsdWV9KSBpbiByZXNwb25zZSB0byBvbkRpZENoYW5nZSgpIGNhdXNlcyBhbm90aGVyIGNoYW5nZVxuICAgIC8vIGV2ZW50LlxuXG4gICAgY29uc3QgdGV4dEVkaXRvciA9IHRoaXMuZ2V0VGV4dEVkaXRvcigpO1xuICAgIGRpc3Bvc2FibGVzLmFkZCh0ZXh0RWRpdG9yLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3ZhbHVlOiB0ZXh0RWRpdG9yLmdldFRleHQoKX0pO1xuICAgICAgdGhpcy5wcm9wcy5vbkRpZENoYW5nZS5jYWxsKG51bGwsIHRleHRFZGl0b3IuZ2V0VGV4dCgpKTtcbiAgICB9KSk7XG4gICAgY29uc3QgcGxhY2Vob2xkZXJUZXh0ID0gdGhpcy5wcm9wcy5wbGFjZWhvbGRlclRleHQ7XG4gICAgaWYgKHBsYWNlaG9sZGVyVGV4dCAhPT0gbnVsbCkge1xuICAgICAgdGV4dEVkaXRvci5zZXRQbGFjZWhvbGRlclRleHQocGxhY2Vob2xkZXJUZXh0KTtcbiAgICB9XG4gICAgaWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpc2FibGVkU3RhdGUodHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChuZXh0UHJvcHMuZGlzYWJsZWQgIT09IHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpc2FibGVkU3RhdGUobmV4dFByb3BzLmRpc2FibGVkKTtcbiAgICB9XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpOiB2b2lkIHtcbiAgICAvLyBOb3RlIHRoYXQgZGVzdHJveSgpIGlzIG5vdCBwYXJ0IG9mIFRleHRFZGl0b3IncyBwdWJsaWMgQVBJLlxuICAgIHRoaXMuZ2V0VGV4dEVkaXRvcigpLmRlc3Ryb3koKTtcblxuICAgIGlmICh0aGlzLl9kaXNwb3NhYmxlcykge1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVEaXNhYmxlZFN0YXRlKGlzRGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICAvLyBIYWNrIHRvIHNldCBUZXh0RWRpdG9yIHRvIHJlYWQtb25seSBtb2RlLCBwZXIgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNjg4MFxuICAgIGlmIChpc0Rpc2FibGVkKSB7XG4gICAgICB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLnJlbW92ZUF0dHJpYnV0ZSgndGFiaW5kZXgnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgfVxuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyh7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvci11bnN0eWxlZCc6IHRoaXMucHJvcHMudW5zdHlsZWQsXG4gICAgICBbYGF0b20tdGV4dC1lZGl0b3ItJHt0aGlzLnByb3BzLnNpemV9YF06ICh0aGlzLnByb3BzLnNpemUgIT0gbnVsbCksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGF0b20tdGV4dC1lZGl0b3JcbiAgICAgICAgY2xhc3M9e2NsYXNzTmFtZX1cbiAgICAgICAgbWluaVxuICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9XG4gICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgb25CbHVyPXt0aGlzLnByb3BzLm9uQmx1cn0+XG4gICAgICAgIHt0aGlzLnN0YXRlLnZhbHVlfVxuICAgICAgPC9hdG9tLXRleHQtZWRpdG9yPlxuICAgICk7XG4gIH1cblxuICBnZXRUZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUudmFsdWU7XG4gIH1cblxuICBzZXRUZXh0KHRleHQ6IHN0cmluZykge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvcigpLnNldFRleHQodGV4dCk7XG4gIH1cblxuICBnZXRUZXh0RWRpdG9yKCk6IFRleHRFZGl0b3Ige1xuICAgIHJldHVybiB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLmdldE1vZGVsKCk7XG4gIH1cblxuICBvbkRpZENoYW5nZShjYWxsYmFjazogKCkgPT4gYW55KTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUZXh0RWRpdG9yKCkub25EaWRDaGFuZ2UoY2FsbGJhY2spO1xuICB9XG5cbiAgX2dldFRleHRFZGl0b3JFbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdC5maW5kRE9NTm9kZSh0aGlzKTtcbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvcigpLm1vdmVUb0VuZE9mTGluZSgpO1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuZm9jdXMoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21JbnB1dDtcbiJdfQ==