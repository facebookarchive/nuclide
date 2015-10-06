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

var {PropTypes} = React;

/**
 * An input field rendered as an <atom-text-editor mini />.
 */
class AtomInput extends React.Component {

  _disposables: ?CompositeDisposable;

  // $FlowIssue t8486988
  static propTypes = {
    disabled: PropTypes.bool,
    initialValue: PropTypes.string.isRequired,
    placeholderText: PropTypes.string,
    onFocus: PropTypes.func,
    onClick: PropTypes.func,
    onDidChange: PropTypes.func,
    onBlur: PropTypes.func,
    size: PropTypes.oneOf(['xs', 'sm', 'lg']),
  };

  // $FlowIssue t8486988
  static defaultProps = {
    disabled: false,
    initialValue: '',
    placeholderText: null,
    onClick: () => {},
    onDidChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      value: props.initialValue,
    };
  }

  componentDidMount(): void {
    var disposables = this._disposables = new CompositeDisposable();

    // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.

    var textEditor = this.getTextEditor();
    disposables.add(textEditor.onDidChange(() => {
      this.setState({value: textEditor.getText()});
      this.props.onDidChange.call(null, textEditor.getText());
    }));
    var placeholderText = this.props.placeholderText;
    if (placeholderText !== null) {
      textEditor.setPlaceholderText(placeholderText);
    }
    if (this.props.disabled) {
      this._updateDisabledState(true);
    }
  }

  componentWillReceiveProps(nextProps: Object): void {
    if (nextProps.disabled !== this.props.disabled) {
      this._updateDisabledState(nextProps.disabled);
    }
  }

  componentWillUnmount(): void {
    // Note that destroy() is not part of TextEditor's public API.
    this.getTextEditor().destroy();

    if (this._disposables) {
      this._disposables.dispose();
      this._disposables = null;
    }
  }

  _updateDisabledState(isDisabled: boolean): void {
    // Hack to set TextEditor to read-only mode, per https://github.com/atom/atom/issues/6880
    if (isDisabled) {
      this._getTextEditorElement().removeAttribute('tabindex');
    } else {
      this._getTextEditorElement().setAttribute('tabindex', '-1');
    }
  }

  render(): ReactElement {
    var className;
    if (this.props.size) {
      className = `atom-text-editor-${this.props.size}`;
    }

    return (
      <atom-text-editor
        className={className}
        mini
        onClick={this.props.onClick}
        onFocus={this.props.onFocus}
        onBlur={this.props.onBlur}>
        {this.state.value}
      </atom-text-editor>
    );
  }

  getText(): string {
    return this.state.value;
  }

  setText(text: string) {
    this.getTextEditor().setText(text);
  }

  getTextEditor(): TextEditor {
    return this._getTextEditorElement().getModel();
  }

  onDidChange(callback: () => any): atom$Disposable {
    return this.getTextEditor().onDidChange(callback);
  }

  _getTextEditorElement(): atom$TextEditorElement {
    return React.findDOMNode(this);
  }

  focus(): void {
    this.getTextEditor().moveToEndOfLine();
    this._getTextEditorElement().focus();
  }
}

module.exports = AtomInput;
