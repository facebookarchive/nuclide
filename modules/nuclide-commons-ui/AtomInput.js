'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.AtomInput = undefined;











var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _string;


function _load_string() {return _string = require('../nuclide-commons/string');}var _observable;
function _load_observable() {return _observable = require('../nuclide-commons/observable');}var _debounce;
function _load_debounce() {return _debounce = _interopRequireDefault(require('../nuclide-commons/debounce'));}var _UniversalDisposable;
function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}} /**
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



































const BLUR_FOCUS_DEBOUNCE_DELAY = 100;

/**
                                        * An input field rendered as an <atom-text-editor mini />.
                                        */
class AtomInput extends _react.Component {




















  constructor(props) {
    super(props);this.
























































































































































    _onEditorFocus = () => {
      if (this.isFocused() && !this._isFocused) {
        this._isFocused = true;
        this.props.onFocus && this.props.onFocus();
      }
    };this.

    _onEditorBlur = blurEvent => {
      if (!this.isFocused() && this._isFocused) {
        this._isFocused = false;
        this.props.onBlur && this.props.onBlur(blurEvent);
      }
    };const value = props.value == null ? props.initialValue : props.value;this.state = { value };this._debouncedEditorFocus = (0, (_debounce || _load_debounce()).default)(this._onEditorFocus, BLUR_FOCUS_DEBOUNCE_DELAY);this._debouncedEditorBlur = (0, (_debounce || _load_debounce()).default)(this._onEditorBlur, BLUR_FOCUS_DEBOUNCE_DELAY);}componentDidMount() {const disposables = this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(); // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.
    const textEditor = this.getTextEditor();const textEditorElement = this.getTextEditorElement();if (this.props.autofocus) {this.focus();}if (!!(this.props.startSelected && this.props.startSelectedRange != null)) {throw new Error('cannot have both startSelected (all) and startSelectedRange');}if (this.props.startSelected) {// For some reason, selectAll() has no effect if called right now.
      disposables.add((_observable || _load_observable()).microtask.subscribe(() => {if (!textEditor.isDestroyed()) {textEditor.selectAll();}}));}const startSelectedRange = this.props.startSelectedRange;if (startSelectedRange != null) {// For some reason, selectAll() has no effect if called right now.
      disposables.add((_observable || _load_observable()).microtask.subscribe(() => {if (!textEditor.isDestroyed()) {textEditor.setSelectedBufferRange([[0, startSelectedRange[0]], [0, startSelectedRange[1]]]);}}));}disposables.add(atom.commands.add(textEditorElement, { 'core:confirm': event => {if (this.props.onConfirm != null) {this.props.onConfirm(event);}}, 'core:cancel': event => {if (this.props.onCancel != null) {this.props.onCancel(event);}} }));const placeholderText = this.props.placeholderText;if (placeholderText != null) {textEditor.setPlaceholderText(placeholderText);}this.getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);if (this.props.disabled) {this._updateDisabledState(true);} // Set the text editor's initial value and keep the cursor at the beginning of the line. Cursor
    // position was documented in a test and is retained here after changes to how text is set in
    // the text editor. (see focus-related spec in AtomInput-spec.js)
    this.setText(this.state.value);this.getTextEditor().moveToBeginningOfLine(); // Begin listening for changes only after initial value is set.
    disposables.add(textEditor.onDidChange(() => {this.setState({ value: textEditor.getText() });this.props.onDidChange.call(null, textEditor.getText());}));if (this.props.onDidChangeSelectionRange != null) {disposables.add(textEditor.onDidChangeSelectionRange(this.props.onDidChangeSelectionRange));}this._updateWidth();}componentWillReceiveProps(nextProps) {if (nextProps.disabled !== this.props.disabled) {this._updateDisabledState(nextProps.disabled);}const { value, placeholderText } = nextProps;if (typeof value === 'string' && value !== this.props.value) {// If the `value` prop is specified, then we must update the input area when there is new
      // text, and this includes maintaining the correct cursor position.
      this.setState({ value });const editor = this.getTextEditor(); // Calling setText if the value did not change will redundantly call any
      // onDidChange listeners with the same input.
      if (editor.getText() !== value) {const cursorPosition = editor.getCursorBufferPosition();this.setText(value);editor.setCursorBufferPosition(cursorPosition);}}if (placeholderText !== this.props.placeholderText) {this.getTextEditor().setPlaceholderText(placeholderText || '');}}componentDidUpdate(prevProps, prevState) {this._updateWidth(prevProps.width);}componentWillUnmount() {// Note that destroy() is not part of TextEditor's public API.
    const editor = this.getTextEditor();process.nextTick(() => editor.destroy());if (this._disposables) {this._disposables.dispose();this._disposables = null;}}_updateDisabledState(isDisabled) {// Hack to set TextEditor to read-only mode, per https://github.com/atom/atom/issues/6880
    if (isDisabled) {this.getTextEditorElement().removeAttribute('tabindex');} else {this.getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);}}isFocused() {return this._rootNode != null && this._rootNode.contains(document.activeElement);}render() {const className = (0, (_classnames || _load_classnames()).default)(this.props.className, { 'atom-text-editor-unstyled': this.props.unstyled, [`atom-text-editor-${(0, (_string || _load_string()).maybeToString)(this.props.size)}`]: this.props.size != null, 'atom-text-editor-invalid': this.props.invalid });
    return (
      // Because the contents of `<atom-text-editor>` elements are managed by its custom web
      // component class when "Use Shadow DOM" is disabled, this element should never have children.
      // If an element has no children, React guarantees it will never re-render the element (which
      // would wipe out the web component's work in this case).
      _react.createElement('atom-text-editor', {
        'class': className,
        mini: true,
        ref: rootNode => this._rootNode = rootNode,
        onClick: this.props.onClick,
        onFocus: this._debouncedEditorFocus,
        onBlur: this._debouncedEditorBlur,
        style: this.props.style }));


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
    return this.getTextEditor().
    getBuffer().
    onDidChangeText(callback);
  }

  getTextEditorElement() {if (!(
    this._rootNode != null)) {throw new Error('Invariant violation: "this._rootNode != null"');}
    // $FlowFixMe
    return this._rootNode;
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
  }}exports.AtomInput = AtomInput;AtomInput.defaultProps = { disabled: false, autofocus: false, startSelected: false, initialValue: '', tabIndex: '0', // Default to all <AtomInput /> components being in tab order
  onClick: event => {}, onDidChange: text => {}, onFocus: () => {}, onBlur: () => {}, unstyled: false, style: null };