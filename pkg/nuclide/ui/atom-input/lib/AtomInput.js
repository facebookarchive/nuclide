'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');

var {
  addons,
  PropTypes,
} = React;

/**
 * An input field rendered as an <atom-text-editor mini />.
 */
var AtomInput = React.createClass({

  propTypes: {
    disabled: React.PropTypes.bool,
    initialValue: React.PropTypes.string,
    placeholderText: React.PropTypes.string,
    onFocus: React.PropTypes.func,
    onClick: React.PropTypes.func,
    onBlur: React.PropTypes.func,
  },

  getDefaultProps() {
    return {
      disabled: false,
      placeholderText: null,
      onClick: () => {},
      onFocus: () => {},
      onBlur: () => {},
    };
  },

  getInitialState() {
    return {
      value: this.props.initialValue || '',
    };
  },

  componentDidMount() {
    this._disposables = new CompositeDisposable();

    // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.
    var textEditor = this.getTextEditor();
    this._disposables.add(textEditor.onDidChange(() => {
      this.setState({value: textEditor.getText()});
    }));
    var placeholderText = this.props.placeholderText;
    if (placeholderText !== null) {
      textEditor.setPlaceholderText(placeholderText);
    }
    if (this.props.disabled) {
      this._updateDisabledState(true);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.disabled !== this.props.disabled) {
      this._updateDisabledState(nextProps.disabled);
    }
  },

  componentWillUnmount() {
    // Note that destroy() is not part of TextEditor's public API.
    this.getTextEditor().destroy();

    if (this._disposables) {
      this._disposables.dispose();
      this._disposables = null;
    }
  },

  _updateDisabledState(isDisabled: boolean): void {
    // Hack to set TextEditor to read-only mode, per https://github.com/atom/atom/issues/6880
    if (isDisabled) {
      this._getTextEditorElement().removeAttribute('tabindex');
    } else {
      this._getTextEditorElement().setAttribute('tabindex', -1);
    }
  },

  render() {
    return (
      <atom-text-editor
          mini
          ref='input'
          onClick={this.props.onClick}
          onFocus={this.props.onFocus}
          onBlur={this.props.onBlur}>
        {this.state.value}
      </atom-text-editor>
    );
  },

  getText(): string {
    return this.state.value;
  },

  setText(text: string) {
    this.getTextEditor().setText(text);
  },

  getTextEditor(): TextEditor {
    return this._getTextEditorElement().getModel();
  },

  onDidChange(callback: () => any): Disposable {
    return this.getTextEditor().onDidChange(callback);
  },

  _getTextEditorElement(): Element {
    return this.refs['input'].getDOMNode();
  },

  focus() {
    this.getTextEditor().moveToEndOfLine();
    this._getTextEditorElement().focus();
  },
});

module.exports = AtomInput;
