'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const classNames = require('classnames');
const {CompositeDisposable} = require('atom');
const {
  React,
  ReactDOM,
} = require('react-for-atom');

const ENTER_KEY_CODE = 13;
const ESCAPE_KEY_CODE = 27;

type Props = {
  className: string;
  disabled: boolean;
  initialValue: string;
  placeholderText: string;
  onFocus: () => mixed;
  onClick: (event: SyntheticMouseEvent) => mixed;
  onDidChange: (text: string) => mixed;
  onConfirm: () => mixed;
  onCancel: () => mixed;
  onBlur: () => mixed;
  size: 'xs' | 'sm' | 'lg';
  unstyled: boolean;
};

type State = {
  value: string;
};

/**
 * An input field rendered as an <atom-text-editor mini />.
 */
class AtomInput extends React.Component {
  props: Props;
  state: State;

  _disposables: ?CompositeDisposable;

  static defaultProps = {
    disabled: false,
    initialValue: '',
    placeholderText: null,
    onClick: () => {},
    onDidChange: () => {},
    onFocus: () => {},
    onBlur: () => {},
    unstyled: false,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.initialValue,
    };

    (this: any)._analyzeKeyCodes = this._analyzeKeyCodes.bind(this);
  }

  componentDidMount(): void {
    const disposables = this._disposables = new CompositeDisposable();

    // There does not appear to be any sort of infinite loop where calling
    // setState({value}) in response to onDidChange() causes another change
    // event.

    const textEditor = this.getTextEditor();
    disposables.add(textEditor.onDidChange(() => {
      this.setState({value: textEditor.getText()});
      this.props.onDidChange.call(null, textEditor.getText());
    }));
    const placeholderText = this.props.placeholderText;
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
    const className = classNames(this.props.className, {
      'atom-text-editor-unstyled': this.props.unstyled,
      [`atom-text-editor-${this.props.size}`]: (this.props.size != null),
    });

    return (
      <atom-text-editor
        class={className}
        mini
        onClick={this.props.onClick}
        onFocus={this.props.onFocus}
        onKeyUp={this._analyzeKeyCodes}
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

  onDidChange(callback: () => any): IDisposable {
    return this.getTextEditor().onDidChange(callback);
  }

  _getTextEditorElement(): atom$TextEditorElement {
    return ReactDOM.findDOMNode(this);
  }

  _analyzeKeyCodes(event: SyntheticKeyboardEvent): void {
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

  focus(): void {
    this.getTextEditor().moveToEndOfLine();
    this._getTextEditorElement().focus();
  }
}

module.exports = AtomInput;
