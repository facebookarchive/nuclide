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
  className?: string;
  disabled: boolean;
  initialValue: string;
  placeholderText?: string;
  tabIndex: string;
  onFocus: () => mixed;
  onClick: (event: SyntheticMouseEvent) => mixed;
  onDidChange: (text: string) => mixed;
  onConfirm?: () => mixed;
  onCancel?: () => mixed;
  onBlur: () => mixed;
  size?: 'xs' | 'sm' | 'lg';
  unstyled: boolean;
  width: number;
};

type State = {
  value: string;
};

/**
 * An input field rendered as an <atom-text-editor mini />.
 */
export class AtomInput extends React.Component {
  props: Props;
  state: State;

  _disposables: ?CompositeDisposable;

  static defaultProps = {
    disabled: false,
    initialValue: '',
    tabIndex: '-1',
    onClick: event => {},
    onDidChange: text => {},
    onFocus: () => {},
    onBlur: () => {},
    unstyled: false,
    width: 200,
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

  componentWillReceiveProps(nextProps: Object): void {
    if (nextProps.disabled !== this.props.disabled) {
      this._updateDisabledState(nextProps.disabled);
    }
  }

  componentDidUpdate(prevProps: Object, prevState: Object): void {
    if (prevProps.width !== this.props.width) {
      this._getTextEditorElement().setWidth(this.props.width);
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
      this._getTextEditorElement().setAttribute('tabindex', this.props.tabIndex);
    }
  }

  render(): ReactElement {
    const className = classNames(this.props.className, {
      'atom-text-editor-unstyled': this.props.unstyled,
      [`atom-text-editor-${this.props.size}`]: (this.props.size != null),
    });

    return (
      // Because the contents of `<atom-text-editor>` elements are managed by its custom web
      // component class when "Use Shadow DOM" is disabled, this element should never have children.
      // If an element has no children, React guarantees it will never re-render the element (which
      // would wipe out the web component's work in this case).
      <atom-text-editor
        class={className}
        mini
        onClick={this.props.onClick}
        onFocus={this.props.onFocus}
        onKeyUp={this._analyzeKeyCodes}
        onBlur={this.props.onBlur}
      />
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
