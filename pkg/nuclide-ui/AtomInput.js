'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AtomInput = undefined;

var _class, _temp;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _string;

function _load_string() {
  return _string = require('../commons-node/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * An input field rendered as an <atom-text-editor mini />.
 */
let AtomInput = exports.AtomInput = (_temp = _class = class AtomInput extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    const value = props.value == null ? props.initialValue : props.value;
    this.state = {
      value: value
    };
  }

  componentDidMount() {
    const disposables = this._disposables = new _atom.CompositeDisposable();

    // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.
    const textEditor = this.getTextEditor();
    const textEditorElement = this.getTextEditorElement();
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
    const value = nextProps.value;

    if (typeof value === 'string' && value !== this.props.value) {
      // If the `value` prop is specified, then we must update the input area when there is new
      // text, and this includes maintaining the correct cursor position.
      this.setState({ value: value });
      const editor = this.getTextEditor();
      const cursorPosition = editor.getCursorBufferPosition();
      this.setText(value);
      editor.setCursorBufferPosition(cursorPosition);
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
      [`atom-text-editor-${ (0, (_string || _load_string()).maybeToString)(this.props.size) }`]: this.props.size != null
    });

    return (
      // Because the contents of `<atom-text-editor>` elements are managed by its custom web
      // component class when "Use Shadow DOM" is disabled, this element should never have children.
      // If an element has no children, React guarantees it will never re-render the element (which
      // would wipe out the web component's work in this case).
      _reactForAtom.React.createElement('atom-text-editor', {
        'class': className,
        mini: true,
        onClick: this.props.onClick,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur
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
    return _reactForAtom.ReactDOM.findDOMNode(this);
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
}, _class.defaultProps = {
  disabled: false,
  initialValue: '',
  tabIndex: '0', // Default to all <AtomInput /> components being in tab order
  onClick: event => {},
  onDidChange: text => {},
  onFocus: () => {},
  onBlur: () => {},
  unstyled: false
}, _temp);