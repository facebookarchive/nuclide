Object.defineProperty(exports, '__esModule', {
  value: true
});

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
      tabIndex: '-1',
      onClick: function onClick(event) {},
      onDidChange: function onDidChange(text) {},
      onFocus: function onFocus() {},
      onBlur: function onBlur() {},
      unstyled: false,
      width: 200
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
      if (placeholderText != null) {
        textEditor.setPlaceholderText(placeholderText);
      }
      this._getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);
      if (this.props.disabled) {
        this._updateDisabledState(true);
      }

      // Set the text editor's initial value and keep the cursor at the beginning of the line. Cursor
      // position was documented in a test and is retained here after changes to how text is set in
      // the text editor. (see focus-related spec in AtomInput-spec.js)
      this.setText(this.state.value);
      this.getTextEditor().moveToBeginningOfLine();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.disabled !== this.props.disabled) {
        this._updateDisabledState(nextProps.disabled);
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (prevProps.width !== this.props.width) {
        this._getTextEditorElement().setWidth(this.props.width);
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
        this._getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var className = classNames(this.props.className, _defineProperty({
        'atom-text-editor-unstyled': this.props.unstyled
      }, 'atom-text-editor-' + this.props.size, this.props.size != null));

      return(
        // Because the contents of `<atom-text-editor>` elements are managed by its custom web
        // component class when "Use Shadow DOM" is disabled, this element should never have children.
        // If an element has no children, React guarantees it will never re-render the element (which
        // would wipe out the web component's work in this case).
        React.createElement('atom-text-editor', {
          'class': className,
          mini: true,
          onClick: this.props.onClick,
          onFocus: this.props.onFocus,
          onKeyUp: this._analyzeKeyCodes,
          onBlur: this.props.onBlur
        })
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

exports.AtomInput = AtomInput;
//# sourceMappingURL=data:application/json;base64,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Q3RDOzs7U0FoSlUsU0FBUztHQUFTLEtBQUssQ0FBQyxTQUFTIiwiZmlsZSI6IkF0b21JbnB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG5jb25zdCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gPSByZXF1aXJlKCdyZWFjdC1mb3ItYXRvbScpO1xuXG5jb25zdCBFTlRFUl9LRVlfQ09ERSA9IDEzO1xuY29uc3QgRVNDQVBFX0tFWV9DT0RFID0gMjc7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgZGlzYWJsZWQ6IGJvb2xlYW47XG4gIGluaXRpYWxWYWx1ZTogc3RyaW5nO1xuICBwbGFjZWhvbGRlclRleHQ/OiBzdHJpbmc7XG4gIHRhYkluZGV4OiBzdHJpbmc7XG4gIG9uRm9jdXM6ICgpID0+IG1peGVkO1xuICBvbkNsaWNrOiAoZXZlbnQ6IFN5bnRoZXRpY01vdXNlRXZlbnQpID0+IG1peGVkO1xuICBvbkRpZENoYW5nZTogKHRleHQ6IHN0cmluZykgPT4gbWl4ZWQ7XG4gIG9uQ29uZmlybT86ICgpID0+IG1peGVkO1xuICBvbkNhbmNlbD86ICgpID0+IG1peGVkO1xuICBvbkJsdXI6ICgpID0+IG1peGVkO1xuICBzaXplPzogJ3hzJyB8ICdzbScgfCAnbGcnO1xuICB1bnN0eWxlZDogYm9vbGVhbjtcbiAgd2lkdGg6IG51bWJlcjtcbn07XG5cbnR5cGUgU3RhdGUgPSB7XG4gIHZhbHVlOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEFuIGlucHV0IGZpZWxkIHJlbmRlcmVkIGFzIGFuIDxhdG9tLXRleHQtZWRpdG9yIG1pbmkgLz4uXG4gKi9cbmV4cG9ydCBjbGFzcyBBdG9tSW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG4gIHN0YXRlOiBTdGF0ZTtcblxuICBfZGlzcG9zYWJsZXM6ID9Db21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGlzYWJsZWQ6IGZhbHNlLFxuICAgIGluaXRpYWxWYWx1ZTogJycsXG4gICAgdGFiSW5kZXg6ICctMScsXG4gICAgb25DbGljazogZXZlbnQgPT4ge30sXG4gICAgb25EaWRDaGFuZ2U6IHRleHQgPT4ge30sXG4gICAgb25Gb2N1czogKCkgPT4ge30sXG4gICAgb25CbHVyOiAoKSA9PiB7fSxcbiAgICB1bnN0eWxlZDogZmFsc2UsXG4gICAgd2lkdGg6IDIwMCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHZhbHVlOiBwcm9wcy5pbml0aWFsVmFsdWUsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fYW5hbHl6ZUtleUNvZGVzID0gdGhpcy5fYW5hbHl6ZUtleUNvZGVzLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIFRoZXJlIGRvZXMgbm90IGFwcGVhciB0byBiZSBhbnkgc29ydCBvZiBpbmZpbml0ZSBsb29wIHdoZXJlIGNhbGxpbmdcbiAgICAvLyBzZXRTdGF0ZSh7dmFsdWV9KSBpbiByZXNwb25zZSB0byBvbkRpZENoYW5nZSgpIGNhdXNlcyBhbm90aGVyIGNoYW5nZVxuICAgIC8vIGV2ZW50LlxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldFRleHRFZGl0b3IoKTtcbiAgICBkaXNwb3NhYmxlcy5hZGQodGV4dEVkaXRvci5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGV4dEVkaXRvci5nZXRUZXh0KCl9KTtcbiAgICAgIHRoaXMucHJvcHMub25EaWRDaGFuZ2UuY2FsbChudWxsLCB0ZXh0RWRpdG9yLmdldFRleHQoKSk7XG4gICAgfSkpO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyVGV4dCA9IHRoaXMucHJvcHMucGxhY2Vob2xkZXJUZXh0O1xuICAgIGlmIChwbGFjZWhvbGRlclRleHQgIT0gbnVsbCkge1xuICAgICAgdGV4dEVkaXRvci5zZXRQbGFjZWhvbGRlclRleHQocGxhY2Vob2xkZXJUZXh0KTtcbiAgICB9XG4gICAgdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5zZXRBdHRyaWJ1dGUoJ3RhYmluZGV4JywgdGhpcy5wcm9wcy50YWJJbmRleCk7XG4gICAgaWYgKHRoaXMucHJvcHMuZGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURpc2FibGVkU3RhdGUodHJ1ZSk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSB0ZXh0IGVkaXRvcidzIGluaXRpYWwgdmFsdWUgYW5kIGtlZXAgdGhlIGN1cnNvciBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5lLiBDdXJzb3JcbiAgICAvLyBwb3NpdGlvbiB3YXMgZG9jdW1lbnRlZCBpbiBhIHRlc3QgYW5kIGlzIHJldGFpbmVkIGhlcmUgYWZ0ZXIgY2hhbmdlcyB0byBob3cgdGV4dCBpcyBzZXQgaW5cbiAgICAvLyB0aGUgdGV4dCBlZGl0b3IuIChzZWUgZm9jdXMtcmVsYXRlZCBzcGVjIGluIEF0b21JbnB1dC1zcGVjLmpzKVxuICAgIHRoaXMuc2V0VGV4dCh0aGlzLnN0YXRlLnZhbHVlKTtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5tb3ZlVG9CZWdpbm5pbmdPZkxpbmUoKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAobmV4dFByb3BzLmRpc2FibGVkICE9PSB0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNhYmxlZFN0YXRlKG5leHRQcm9wcy5kaXNhYmxlZCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKHByZXZQcm9wczogT2JqZWN0LCBwcmV2U3RhdGU6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmIChwcmV2UHJvcHMud2lkdGggIT09IHRoaXMucHJvcHMud2lkdGgpIHtcbiAgICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0V2lkdGgodGhpcy5wcm9wcy53aWR0aCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgLy8gTm90ZSB0aGF0IGRlc3Ryb3koKSBpcyBub3QgcGFydCBvZiBUZXh0RWRpdG9yJ3MgcHVibGljIEFQSS5cbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5kZXN0cm95KCk7XG5cbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8gSGFjayB0byBzZXQgVGV4dEVkaXRvciB0byByZWFkLW9ubHkgbW9kZSwgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY4ODBcbiAgICBpZiAoaXNEaXNhYmxlZCkge1xuICAgICAgdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIHRoaXMucHJvcHMudGFiSW5kZXgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXModGhpcy5wcm9wcy5jbGFzc05hbWUsIHtcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yLXVuc3R5bGVkJzogdGhpcy5wcm9wcy51bnN0eWxlZCxcbiAgICAgIFtgYXRvbS10ZXh0LWVkaXRvci0ke3RoaXMucHJvcHMuc2l6ZX1gXTogKHRoaXMucHJvcHMuc2l6ZSAhPSBudWxsKSxcbiAgICB9KTtcblxuICAgIHJldHVybiAoXG4gICAgICAvLyBCZWNhdXNlIHRoZSBjb250ZW50cyBvZiBgPGF0b20tdGV4dC1lZGl0b3I+YCBlbGVtZW50cyBhcmUgbWFuYWdlZCBieSBpdHMgY3VzdG9tIHdlYlxuICAgICAgLy8gY29tcG9uZW50IGNsYXNzIHdoZW4gXCJVc2UgU2hhZG93IERPTVwiIGlzIGRpc2FibGVkLCB0aGlzIGVsZW1lbnQgc2hvdWxkIG5ldmVyIGhhdmUgY2hpbGRyZW4uXG4gICAgICAvLyBJZiBhbiBlbGVtZW50IGhhcyBubyBjaGlsZHJlbiwgUmVhY3QgZ3VhcmFudGVlcyBpdCB3aWxsIG5ldmVyIHJlLXJlbmRlciB0aGUgZWxlbWVudCAod2hpY2hcbiAgICAgIC8vIHdvdWxkIHdpcGUgb3V0IHRoZSB3ZWIgY29tcG9uZW50J3Mgd29yayBpbiB0aGlzIGNhc2UpLlxuICAgICAgPGF0b20tdGV4dC1lZGl0b3JcbiAgICAgICAgY2xhc3M9e2NsYXNzTmFtZX1cbiAgICAgICAgbWluaVxuICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLm9uQ2xpY2t9XG4gICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgb25LZXlVcD17dGhpcy5fYW5hbHl6ZUtleUNvZGVzfVxuICAgICAgICBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbHVlO1xuICB9XG5cbiAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5zZXRUZXh0KHRleHQpO1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5nZXRNb2RlbCgpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2UoY2FsbGJhY2s6ICgpID0+IGFueSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUZXh0RWRpdG9yKCkub25EaWRDaGFuZ2UoY2FsbGJhY2spO1xuICB9XG5cbiAgX2dldFRleHRFZGl0b3JFbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgfVxuXG4gIF9hbmFseXplS2V5Q29kZXMoZXZlbnQ6IFN5bnRoZXRpY0tleWJvYXJkRXZlbnQpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgRU5URVJfS0VZX0NPREU6XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ29uZmlybSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNvbmZpcm0oKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgRVNDQVBFX0tFWV9DT0RFOlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNhbmNlbCAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vbkNhbmNlbCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvcigpLm1vdmVUb0VuZE9mTGluZSgpO1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuZm9jdXMoKTtcbiAgfVxufVxuIl19