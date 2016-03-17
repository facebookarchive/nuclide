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
      placeholderText: null,
      tabIndex: '-1',
      onClick: function onClick() {},
      onDidChange: function onDidChange() {},
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
      if (placeholderText !== null) {
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

module.exports = AtomInput;
//# sourceMappingURL=data:application/json;base64,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dEM7OztTQWpKRyxTQUFTO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBb0p2QyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJBdG9tSW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3QgRU5URVJfS0VZX0NPREUgPSAxMztcbmNvbnN0IEVTQ0FQRV9LRVlfQ09ERSA9IDI3O1xuXG50eXBlIFByb3BzID0ge1xuICBjbGFzc05hbWU6IHN0cmluZztcbiAgZGlzYWJsZWQ6IGJvb2xlYW47XG4gIGluaXRpYWxWYWx1ZTogc3RyaW5nO1xuICBwbGFjZWhvbGRlclRleHQ6IHN0cmluZztcbiAgdGFiSW5kZXg6IHN0cmluZztcbiAgb25Gb2N1czogKCkgPT4gbWl4ZWQ7XG4gIG9uQ2xpY2s6IChldmVudDogU3ludGhldGljTW91c2VFdmVudCkgPT4gbWl4ZWQ7XG4gIG9uRGlkQ2hhbmdlOiAodGV4dDogc3RyaW5nKSA9PiBtaXhlZDtcbiAgb25Db25maXJtOiAoKSA9PiBtaXhlZDtcbiAgb25DYW5jZWw6ICgpID0+IG1peGVkO1xuICBvbkJsdXI6ICgpID0+IG1peGVkO1xuICBzaXplOiAneHMnIHwgJ3NtJyB8ICdsZyc7XG4gIHVuc3R5bGVkOiBib29sZWFuO1xuICB3aWR0aDogbnVtYmVyO1xufTtcblxudHlwZSBTdGF0ZSA9IHtcbiAgdmFsdWU6IHN0cmluZztcbn07XG5cbi8qKlxuICogQW4gaW5wdXQgZmllbGQgcmVuZGVyZWQgYXMgYW4gPGF0b20tdGV4dC1lZGl0b3IgbWluaSAvPi5cbiAqL1xuY2xhc3MgQXRvbUlucHV0IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgcHJvcHM6IFByb3BzO1xuICBzdGF0ZTogU3RhdGU7XG5cbiAgX2Rpc3Bvc2FibGVzOiA/Q29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICBpbml0aWFsVmFsdWU6ICcnLFxuICAgIHBsYWNlaG9sZGVyVGV4dDogbnVsbCxcbiAgICB0YWJJbmRleDogJy0xJyxcbiAgICBvbkNsaWNrOiAoKSA9PiB7fSxcbiAgICBvbkRpZENoYW5nZTogKCkgPT4ge30sXG4gICAgb25Gb2N1czogKCkgPT4ge30sXG4gICAgb25CbHVyOiAoKSA9PiB7fSxcbiAgICB1bnN0eWxlZDogZmFsc2UsXG4gICAgd2lkdGg6IDIwMCxcbiAgfTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHZhbHVlOiBwcm9wcy5pbml0aWFsVmFsdWUsXG4gICAgfTtcbiAgICAodGhpczogYW55KS5fYW5hbHl6ZUtleUNvZGVzID0gdGhpcy5fYW5hbHl6ZUtleUNvZGVzLmJpbmQodGhpcyk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpOiB2b2lkIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlcyA9IHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIC8vIFRoZXJlIGRvZXMgbm90IGFwcGVhciB0byBiZSBhbnkgc29ydCBvZiBpbmZpbml0ZSBsb29wIHdoZXJlIGNhbGxpbmdcbiAgICAvLyBzZXRTdGF0ZSh7dmFsdWV9KSBpbiByZXNwb25zZSB0byBvbkRpZENoYW5nZSgpIGNhdXNlcyBhbm90aGVyIGNoYW5nZVxuICAgIC8vIGV2ZW50LlxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldFRleHRFZGl0b3IoKTtcbiAgICBkaXNwb3NhYmxlcy5hZGQodGV4dEVkaXRvci5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGV4dEVkaXRvci5nZXRUZXh0KCl9KTtcbiAgICAgIHRoaXMucHJvcHMub25EaWRDaGFuZ2UuY2FsbChudWxsLCB0ZXh0RWRpdG9yLmdldFRleHQoKSk7XG4gICAgfSkpO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyVGV4dCA9IHRoaXMucHJvcHMucGxhY2Vob2xkZXJUZXh0O1xuICAgIGlmIChwbGFjZWhvbGRlclRleHQgIT09IG51bGwpIHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KHBsYWNlaG9sZGVyVGV4dCk7XG4gICAgfVxuICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIHRoaXMucHJvcHMudGFiSW5kZXgpO1xuICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNhYmxlZFN0YXRlKHRydWUpO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgdGV4dCBlZGl0b3IncyBpbml0aWFsIHZhbHVlIGFuZCBrZWVwIHRoZSBjdXJzb3IgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS4gQ3Vyc29yXG4gICAgLy8gcG9zaXRpb24gd2FzIGRvY3VtZW50ZWQgaW4gYSB0ZXN0IGFuZCBpcyByZXRhaW5lZCBoZXJlIGFmdGVyIGNoYW5nZXMgdG8gaG93IHRleHQgaXMgc2V0IGluXG4gICAgLy8gdGhlIHRleHQgZWRpdG9yLiAoc2VlIGZvY3VzLXJlbGF0ZWQgc3BlYyBpbiBBdG9tSW5wdXQtc3BlYy5qcylcbiAgICB0aGlzLnNldFRleHQodGhpcy5zdGF0ZS52YWx1ZSk7XG4gICAgdGhpcy5nZXRUZXh0RWRpdG9yKCkubW92ZVRvQmVnaW5uaW5nT2ZMaW5lKCk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgaWYgKG5leHRQcm9wcy5kaXNhYmxlZCAhPT0gdGhpcy5wcm9wcy5kaXNhYmxlZCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGlzYWJsZWRTdGF0ZShuZXh0UHJvcHMuZGlzYWJsZWQpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHM6IE9iamVjdCwgcHJldlN0YXRlOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAocHJldlByb3BzLndpZHRoICE9PSB0aGlzLnByb3BzLndpZHRoKSB7XG4gICAgICB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLnNldFdpZHRoKHRoaXMucHJvcHMud2lkdGgpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCk6IHZvaWQge1xuICAgIC8vIE5vdGUgdGhhdCBkZXN0cm95KCkgaXMgbm90IHBhcnQgb2YgVGV4dEVkaXRvcidzIHB1YmxpYyBBUEkuXG4gICAgdGhpcy5nZXRUZXh0RWRpdG9yKCkuZGVzdHJveSgpO1xuXG4gICAgaWYgKHRoaXMuX2Rpc3Bvc2FibGVzKSB7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZURpc2FibGVkU3RhdGUoaXNEaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xuICAgIC8vIEhhY2sgdG8gc2V0IFRleHRFZGl0b3IgdG8gcmVhZC1vbmx5IG1vZGUsIHBlciBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy82ODgwXG4gICAgaWYgKGlzRGlzYWJsZWQpIHtcbiAgICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkucmVtb3ZlQXR0cmlidXRlKCd0YWJpbmRleCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLnNldEF0dHJpYnV0ZSgndGFiaW5kZXgnLCB0aGlzLnByb3BzLnRhYkluZGV4KTtcbiAgICB9XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBjbGFzc05hbWUgPSBjbGFzc05hbWVzKHRoaXMucHJvcHMuY2xhc3NOYW1lLCB7XG4gICAgICAnYXRvbS10ZXh0LWVkaXRvci11bnN0eWxlZCc6IHRoaXMucHJvcHMudW5zdHlsZWQsXG4gICAgICBbYGF0b20tdGV4dC1lZGl0b3ItJHt0aGlzLnByb3BzLnNpemV9YF06ICh0aGlzLnByb3BzLnNpemUgIT0gbnVsbCksXG4gICAgfSk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgLy8gQmVjYXVzZSB0aGUgY29udGVudHMgb2YgYDxhdG9tLXRleHQtZWRpdG9yPmAgZWxlbWVudHMgYXJlIG1hbmFnZWQgYnkgaXRzIGN1c3RvbSB3ZWJcbiAgICAgIC8vIGNvbXBvbmVudCBjbGFzcyB3aGVuIFwiVXNlIFNoYWRvdyBET01cIiBpcyBkaXNhYmxlZCwgdGhpcyBlbGVtZW50IHNob3VsZCBuZXZlciBoYXZlIGNoaWxkcmVuLlxuICAgICAgLy8gSWYgYW4gZWxlbWVudCBoYXMgbm8gY2hpbGRyZW4sIFJlYWN0IGd1YXJhbnRlZXMgaXQgd2lsbCBuZXZlciByZS1yZW5kZXIgdGhlIGVsZW1lbnQgKHdoaWNoXG4gICAgICAvLyB3b3VsZCB3aXBlIG91dCB0aGUgd2ViIGNvbXBvbmVudCdzIHdvcmsgaW4gdGhpcyBjYXNlKS5cbiAgICAgIDxhdG9tLXRleHQtZWRpdG9yXG4gICAgICAgIGNsYXNzPXtjbGFzc05hbWV9XG4gICAgICAgIG1pbmlcbiAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfVxuICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9XG4gICAgICAgIG9uS2V5VXA9e3RoaXMuX2FuYWx5emVLZXlDb2Rlc31cbiAgICAgICAgb25CbHVyPXt0aGlzLnByb3BzLm9uQmx1cn1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIGdldFRleHQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS52YWx1ZTtcbiAgfVxuXG4gIHNldFRleHQodGV4dDogc3RyaW5nKSB7XG4gICAgdGhpcy5nZXRUZXh0RWRpdG9yKCkuc2V0VGV4dCh0ZXh0KTtcbiAgfVxuXG4gIGdldFRleHRFZGl0b3IoKTogVGV4dEVkaXRvciB7XG4gICAgcmV0dXJuIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuZ2V0TW9kZWwoKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlKGNhbGxiYWNrOiAoKSA9PiBhbnkpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dEVkaXRvcigpLm9uRGlkQ2hhbmdlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIF9nZXRUZXh0RWRpdG9yRWxlbWVudCgpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50IHtcbiAgICByZXR1cm4gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gIH1cblxuICBfYW5hbHl6ZUtleUNvZGVzKGV2ZW50OiBTeW50aGV0aWNLZXlib2FyZEV2ZW50KTogdm9pZCB7XG4gICAgc3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIEVOVEVSX0tFWV9DT0RFOlxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNvbmZpcm0gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25Db25maXJtKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEVTQ0FQRV9LRVlfQ09ERTpcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DYW5jZWwgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMucHJvcHMub25DYW5jZWwoKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmb2N1cygpOiB2b2lkIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5tb3ZlVG9FbmRPZkxpbmUoKTtcbiAgICB0aGlzLl9nZXRUZXh0RWRpdG9yRWxlbWVudCgpLmZvY3VzKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdG9tSW5wdXQ7XG4iXX0=