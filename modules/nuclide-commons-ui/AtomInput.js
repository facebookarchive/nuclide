'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AtomInput = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An input field rendered as an <atom-text-editor mini />.
 */
class AtomInput extends _react.Component {

  constructor(props) {
    super(props);
    const value = props.value == null ? props.initialValue : props.value;
    this.state = {
      value
    };
  }

  componentDidMount() {
    const disposables = this._disposables = new _atom.CompositeDisposable();

    // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.
    const textEditor = this.getTextEditor();
    const textEditorElement = this.getTextEditorElement();
    if (this.props.autofocus) {
      this.focus();
    }
    if (this.props.startSelected) {
      // For some reason, selectAll() has no effect if called right now.
      process.nextTick(() => {
        if (!textEditor.isDestroyed()) {
          textEditor.selectAll();
        }
      });
    }
    disposables.add(atom.commands.add(textEditorElement, {
      'core:confirm': () => {
        if (this.props.onConfirm != null) {
          this.props.onConfirm();
        }
      },
      'core:cancel': () => {
        if (this.props.onCancel != null) {
          this.props.onCancel();
        }
      }
    }));
    const placeholderText = this.props.placeholderText;
    if (placeholderText != null) {
      textEditor.setPlaceholderText(placeholderText);
    }
    this.getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);
    if (this.props.disabled) {
      this._updateDisabledState(true);
    }

    // Set the text editor's initial value and keep the cursor at the beginning of the line. Cursor
    // position was documented in a test and is retained here after changes to how text is set in
    // the text editor. (see focus-related spec in AtomInput-spec.js)
    this.setText(this.state.value);
    this.getTextEditor().moveToBeginningOfLine();

    // Begin listening for changes only after initial value is set.
    disposables.add(textEditor.onDidChange(() => {
      this.setState({ value: textEditor.getText() });
      this.props.onDidChange.call(null, textEditor.getText());
    }));

    this._updateWidth();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled !== this.props.disabled) {
      this._updateDisabledState(nextProps.disabled);
    }
    const { value, placeholderText } = nextProps;
    if (typeof value === 'string' && value !== this.props.value) {
      // If the `value` prop is specified, then we must update the input area when there is new
      // text, and this includes maintaining the correct cursor position.
      this.setState({ value });
      const editor = this.getTextEditor();
      const cursorPosition = editor.getCursorBufferPosition();
      this.setText(value);
      editor.setCursorBufferPosition(cursorPosition);
    }

    if (placeholderText !== this.props.placeholderText) {
      this.getTextEditor().setPlaceholderText(placeholderText || '');
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this._updateWidth(prevProps.width);
  }

  componentWillUnmount() {
    // Note that destroy() is not part of TextEditor's public API.
    this.getTextEditor().destroy();

    if (this._disposables) {
      this._disposables.dispose();
      this._disposables = null;
    }
  }

  _updateDisabledState(isDisabled) {
    // Hack to set TextEditor to read-only mode, per https://github.com/atom/atom/issues/6880
    if (isDisabled) {
      this.getTextEditorElement().removeAttribute('tabindex');
    } else {
      this.getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);
    }
  }

  render() {
    const className = (0, (_classnames || _load_classnames()).default)(this.props.className, {
      'atom-text-editor-unstyled': this.props.unstyled,
      [`atom-text-editor-${(0, (_string || _load_string()).maybeToString)(this.props.size)}`]: this.props.size != null
    });

    return (
      // Because the contents of `<atom-text-editor>` elements are managed by its custom web
      // component class when "Use Shadow DOM" is disabled, this element should never have children.
      // If an element has no children, React guarantees it will never re-render the element (which
      // would wipe out the web component's work in this case).
      _react.createElement('atom-text-editor', {
        'class': className,
        mini: true,
        onClick: this.props.onClick,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        style: this.props.style
      })
    );
  }

  getText() {
    return this.state.value;
  }

  setText(text) {
    this.getTextEditor().setText(text);
  }

  getTextEditor() {
    return this.getTextEditorElement().getModel();
  }

  onDidChange(callback) {
    return this.getTextEditor().onDidChange(callback);
  }

  getTextEditorElement() {
    // $FlowFixMe
    return _reactDom.default.findDOMNode(this);
  }

  _updateWidth(prevWidth) {
    if (this.props.width !== prevWidth) {
      const width = this.props.width == null ? undefined : this.props.width;
      this.getTextEditorElement().setWidth(width);
    }
  }

  focus() {
    this.getTextEditor().moveToEndOfLine();
    this.getTextEditorElement().focus();
  }
}
exports.AtomInput = AtomInput; /**
                                * Copyright (c) 2017-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the BSD-style license found in the
                                * LICENSE file in the root directory of this source tree. An additional grant
                                * of patent rights can be found in the PATENTS file in the same directory.
                                *
                                * 
                                * @format
                                */

AtomInput.defaultProps = {
  disabled: false,
  autofocus: false,
  startSelected: false,
  initialValue: '',
  tabIndex: '0', // Default to all <AtomInput /> components being in tab order
  onClick: event => {},
  onDidChange: text => {},
  onFocus: () => {},
  onBlur: () => {},
  unstyled: false,
  style: null
};