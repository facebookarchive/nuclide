Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

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
      tabIndex: '0', // Default to all <AtomInput /> components being in tab order
      onClick: function onClick(event) {},
      onDidChange: function onDidChange(text) {},
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

      var disposables = this._disposables = new (_atom2 || _atom()).CompositeDisposable();

      // There does not appear to be any sort of infinite loop where calling
      // setState({value}) in response to onDidChange() causes another change
      // event.
      var textEditor = this.getTextEditor();
      var textEditorElement = this._getTextEditorElement();
      disposables.add(atom.commands.add(textEditorElement, {
        'core:confirm': function coreConfirm() {
          if (_this.props.onConfirm != null) {
            _this.props.onConfirm();
          }
        },
        'core:cancel': function coreCancel() {
          if (_this.props.onCancel != null) {
            _this.props.onCancel();
          }
        }
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

      // Begin listening for changes only after initial value is set.
      disposables.add(textEditor.onDidChange(function () {
        _this.setState({ value: textEditor.getText() });
        _this.props.onDidChange.call(null, textEditor.getText());
      }));

      this._updateWidth();
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
      this._updateWidth(prevProps.width);
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
      var className = (0, (_classnames2 || _classnames()).default)(this.props.className, _defineProperty({
        'atom-text-editor-unstyled': this.props.unstyled
      }, 'atom-text-editor-' + this.props.size, this.props.size != null));

      return(
        // Because the contents of `<atom-text-editor>` elements are managed by its custom web
        // component class when "Use Shadow DOM" is disabled, this element should never have children.
        // If an element has no children, React guarantees it will never re-render the element (which
        // would wipe out the web component's work in this case).
        (_reactForAtom2 || _reactForAtom()).React.createElement('atom-text-editor', {
          'class': className,
          mini: true,
          onClick: this.props.onClick,
          onFocus: this.props.onFocus,
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
      return (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
    }
  }, {
    key: '_updateWidth',
    value: function _updateWidth(prevWidth) {
      if (this.props.width !== prevWidth) {
        var _width = this.props.width == null ? undefined : this.props.width;
        this._getTextEditorElement().setWidth(_width);
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
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.AtomInput = AtomInput;