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
      return ReactDOM.findDOMNode(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0b21JbnB1dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7O2VBQ1gsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBdEMsbUJBQW1CLFlBQW5CLG1CQUFtQjs7Z0JBSXRCLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFGM0IsS0FBSyxhQUFMLEtBQUs7SUFDTCxRQUFRLGFBQVIsUUFBUTtJQUdILFNBQVMsR0FBSSxLQUFLLENBQWxCLFNBQVM7Ozs7OztJQUtWLFNBQVM7WUFBVCxTQUFTOztlQUFULFNBQVM7O1dBSU07QUFDakIsY0FBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ3hCLGtCQUFZLEVBQUUsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ3pDLHFCQUFlLEVBQUUsU0FBUyxDQUFDLE1BQU07QUFDakMsYUFBTyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQ3ZCLGFBQU8sRUFBRSxTQUFTLENBQUMsSUFBSTtBQUN2QixpQkFBVyxFQUFFLFNBQVMsQ0FBQyxJQUFJO0FBQzNCLFlBQU0sRUFBRSxTQUFTLENBQUMsSUFBSTtBQUN0QixVQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDekMsY0FBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0tBQ3pCOzs7O1dBRXFCO0FBQ3BCLGNBQVEsRUFBRSxLQUFLO0FBQ2Ysa0JBQVksRUFBRSxFQUFFO0FBQ2hCLHFCQUFlLEVBQUUsSUFBSTtBQUNyQixhQUFPLEVBQUUsbUJBQU0sRUFBRTtBQUNqQixpQkFBVyxFQUFFLHVCQUFNLEVBQUU7QUFDckIsYUFBTyxFQUFFLG1CQUFNLEVBQUU7QUFDakIsWUFBTSxFQUFFLGtCQUFNLEVBQUU7QUFDaEIsY0FBUSxFQUFFLEtBQUs7S0FDaEI7Ozs7QUFFVSxXQTNCUCxTQUFTLENBMkJELEtBQWEsRUFBRTswQkEzQnZCLFNBQVM7O0FBNEJYLCtCQTVCRSxTQUFTLDZDQTRCTCxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsS0FBSyxHQUFHO0FBQ1gsV0FBSyxFQUFFLEtBQUssQ0FBQyxZQUFZO0tBQzFCLENBQUM7R0FDSDs7ZUFoQ0csU0FBUzs7V0FrQ0ksNkJBQVM7OztBQUN4QixVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksbUJBQW1CLEVBQUUsQ0FBQzs7Ozs7O0FBTWxFLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUN4QyxpQkFBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLFlBQU07QUFDM0MsY0FBSyxRQUFRLENBQUMsRUFBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLE9BQU8sRUFBRSxFQUFDLENBQUMsQ0FBQztBQUM3QyxjQUFLLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztPQUN6RCxDQUFDLENBQUMsQ0FBQztBQUNKLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDO0FBQ25ELFVBQUksZUFBZSxLQUFLLElBQUksRUFBRTtBQUM1QixrQkFBVSxDQUFDLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ2hEO0FBQ0QsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRTtBQUN2QixZQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDakM7S0FDRjs7O1dBRXdCLG1DQUFDLFNBQWlCLEVBQVE7QUFDakQsVUFBSSxTQUFTLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0FBQzlDLFlBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDL0M7S0FDRjs7O1dBRW1CLGdDQUFTOztBQUUzQixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRS9CLFVBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtBQUNyQixZQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzVCLFlBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO09BQzFCO0tBQ0Y7OztXQUVtQiw4QkFBQyxVQUFtQixFQUFROztBQUU5QyxVQUFJLFVBQVUsRUFBRTtBQUNkLFlBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUMxRCxNQUFNO0FBQ0wsWUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUM3RDtLQUNGOzs7V0FFSyxrQkFBaUI7QUFDckIsVUFBTSxTQUFTLEdBQUcsVUFBVTtBQUMxQixtQ0FBMkIsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7K0JBQzNCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksRUFDakUsQ0FBQzs7QUFFSCxhQUNFOzs7QUFDRSxtQkFBTyxTQUFTLEFBQUM7QUFDakIsY0FBSSxNQUFBO0FBQ0osaUJBQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQUFBQztBQUM1QixpQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLGdCQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEFBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO09BQ0EsQ0FDbkI7S0FDSDs7O1dBRU0sbUJBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6Qjs7O1dBRU0saUJBQUMsSUFBWSxFQUFFO0FBQ3BCLFVBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDcEM7OztXQUVZLHlCQUFlO0FBQzFCLGFBQU8sSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDaEQ7OztXQUVVLHFCQUFDLFFBQW1CLEVBQWU7QUFDNUMsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFb0IsaUNBQTJCO0FBQzlDLGFBQU8sUUFBUSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuQzs7O1dBRUksaUJBQVM7QUFDWixVQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdEM7OztTQXpIRyxTQUFTO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBNEh2QyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQyIsImZpbGUiOiJBdG9tSW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3Qge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxuLyoqXG4gKiBBbiBpbnB1dCBmaWVsZCByZW5kZXJlZCBhcyBhbiA8YXRvbS10ZXh0LWVkaXRvciBtaW5pIC8+LlxuICovXG5jbGFzcyBBdG9tSW5wdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIF9kaXNwb3NhYmxlczogP0NvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBkaXNhYmxlZDogUHJvcFR5cGVzLmJvb2wsXG4gICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLmlzUmVxdWlyZWQsXG4gICAgcGxhY2Vob2xkZXJUZXh0OiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIG9uRGlkQ2hhbmdlOiBQcm9wVHlwZXMuZnVuYyxcbiAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgIHNpemU6IFByb3BUeXBlcy5vbmVPZihbJ3hzJywgJ3NtJywgJ2xnJ10pLFxuICAgIHVuc3R5bGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgfTtcblxuICBzdGF0aWMgZGVmYXVsdFByb3BzID0ge1xuICAgIGRpc2FibGVkOiBmYWxzZSxcbiAgICBpbml0aWFsVmFsdWU6ICcnLFxuICAgIHBsYWNlaG9sZGVyVGV4dDogbnVsbCxcbiAgICBvbkNsaWNrOiAoKSA9PiB7fSxcbiAgICBvbkRpZENoYW5nZTogKCkgPT4ge30sXG4gICAgb25Gb2N1czogKCkgPT4ge30sXG4gICAgb25CbHVyOiAoKSA9PiB7fSxcbiAgICB1bnN0eWxlZDogZmFsc2UsXG4gIH07XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IE9iamVjdCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgdmFsdWU6IHByb3BzLmluaXRpYWxWYWx1ZSxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKTogdm9pZCB7XG4gICAgY29uc3QgZGlzcG9zYWJsZXMgPSB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAvLyBUaGVyZSBkb2VzIG5vdCBhcHBlYXIgdG8gYmUgYW55IHNvcnQgb2YgaW5maW5pdGUgbG9vcCB3aGVyZSBjYWxsaW5nXG4gICAgLy8gc2V0U3RhdGUoe3ZhbHVlfSkgaW4gcmVzcG9uc2UgdG8gb25EaWRDaGFuZ2UoKSBjYXVzZXMgYW5vdGhlciBjaGFuZ2VcbiAgICAvLyBldmVudC5cblxuICAgIGNvbnN0IHRleHRFZGl0b3IgPSB0aGlzLmdldFRleHRFZGl0b3IoKTtcbiAgICBkaXNwb3NhYmxlcy5hZGQodGV4dEVkaXRvci5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICB0aGlzLnNldFN0YXRlKHt2YWx1ZTogdGV4dEVkaXRvci5nZXRUZXh0KCl9KTtcbiAgICAgIHRoaXMucHJvcHMub25EaWRDaGFuZ2UuY2FsbChudWxsLCB0ZXh0RWRpdG9yLmdldFRleHQoKSk7XG4gICAgfSkpO1xuICAgIGNvbnN0IHBsYWNlaG9sZGVyVGV4dCA9IHRoaXMucHJvcHMucGxhY2Vob2xkZXJUZXh0O1xuICAgIGlmIChwbGFjZWhvbGRlclRleHQgIT09IG51bGwpIHtcbiAgICAgIHRleHRFZGl0b3Iuc2V0UGxhY2Vob2xkZXJUZXh0KHBsYWNlaG9sZGVyVGV4dCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNhYmxlZFN0YXRlKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAobmV4dFByb3BzLmRpc2FibGVkICE9PSB0aGlzLnByb3BzLmRpc2FibGVkKSB7XG4gICAgICB0aGlzLl91cGRhdGVEaXNhYmxlZFN0YXRlKG5leHRQcm9wcy5kaXNhYmxlZCk7XG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKTogdm9pZCB7XG4gICAgLy8gTm90ZSB0aGF0IGRlc3Ryb3koKSBpcyBub3QgcGFydCBvZiBUZXh0RWRpdG9yJ3MgcHVibGljIEFQSS5cbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5kZXN0cm95KCk7XG5cbiAgICBpZiAodGhpcy5fZGlzcG9zYWJsZXMpIHtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlRGlzYWJsZWRTdGF0ZShpc0Rpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XG4gICAgLy8gSGFjayB0byBzZXQgVGV4dEVkaXRvciB0byByZWFkLW9ubHkgbW9kZSwgcGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY4ODBcbiAgICBpZiAoaXNEaXNhYmxlZCkge1xuICAgICAgdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5yZW1vdmVBdHRyaWJ1dGUoJ3RhYmluZGV4Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsICctMScpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIGNvbnN0IGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMoe1xuICAgICAgJ2F0b20tdGV4dC1lZGl0b3ItdW5zdHlsZWQnOiB0aGlzLnByb3BzLnVuc3R5bGVkLFxuICAgICAgW2BhdG9tLXRleHQtZWRpdG9yLSR7dGhpcy5wcm9wcy5zaXplfWBdOiAodGhpcy5wcm9wcy5zaXplICE9IG51bGwpLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxhdG9tLXRleHQtZWRpdG9yXG4gICAgICAgIGNsYXNzPXtjbGFzc05hbWV9XG4gICAgICAgIG1pbmlcbiAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrfVxuICAgICAgICBvbkZvY3VzPXt0aGlzLnByb3BzLm9uRm9jdXN9XG4gICAgICAgIG9uQmx1cj17dGhpcy5wcm9wcy5vbkJsdXJ9PlxuICAgICAgICB7dGhpcy5zdGF0ZS52YWx1ZX1cbiAgICAgIDwvYXRvbS10ZXh0LWVkaXRvcj5cbiAgICApO1xuICB9XG5cbiAgZ2V0VGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnN0YXRlLnZhbHVlO1xuICB9XG5cbiAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcbiAgICB0aGlzLmdldFRleHRFZGl0b3IoKS5zZXRUZXh0KHRleHQpO1xuICB9XG5cbiAgZ2V0VGV4dEVkaXRvcigpOiBUZXh0RWRpdG9yIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0VGV4dEVkaXRvckVsZW1lbnQoKS5nZXRNb2RlbCgpO1xuICB9XG5cbiAgb25EaWRDaGFuZ2UoY2FsbGJhY2s6ICgpID0+IGFueSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUZXh0RWRpdG9yKCkub25EaWRDaGFuZ2UoY2FsbGJhY2spO1xuICB9XG5cbiAgX2dldFRleHRFZGl0b3JFbGVtZW50KCk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQge1xuICAgIHJldHVybiBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgfVxuXG4gIGZvY3VzKCk6IHZvaWQge1xuICAgIHRoaXMuZ2V0VGV4dEVkaXRvcigpLm1vdmVUb0VuZE9mTGluZSgpO1xuICAgIHRoaXMuX2dldFRleHRFZGl0b3JFbGVtZW50KCkuZm9jdXMoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEF0b21JbnB1dDtcbiJdfQ==