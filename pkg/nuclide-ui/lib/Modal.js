'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React, ReactDOM} from 'react-for-atom';

type Props = {
  children?: any;
  onDismiss: () => void;
};

/**
 * Shows an indefinite, animated LoadingSpinner.
 */
export class Modal extends React.Component {
  props: Props;
  _container: HTMLElement;
  _cancelDisposable: ?IDisposable;
  _innerElement: ?HTMLElement;
  _panel: atom$Panel;

  constructor(props: Props) {
    super(props);
    (this: any)._handleBlur = this._handleBlur.bind(this);
    (this: any)._handleContainerInnerElement = this._handleContainerInnerElement.bind(this);
  }

  componentWillMount(): void {
    this._container = document.createElement('div');
    this._panel = atom.workspace.addModalPanel({item: this._container});
  }

  componentWillUnmount(): void {
    ReactDOM.unmountComponentAtNode(this._container);
    this._panel.destroy();
  }

  componentDidMount(): void {
    // Do the initial render.
    this._render();
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.children !== this.props.children) {
      this._render();
    }
  }

  _handleBlur(event: SyntheticFocusEvent): void {
    // If the next active element (`event.relatedTarget`) is not a descendant of this modal, close
    // the modal.
    if (this._innerElement && !this._innerElement.contains(((event.relatedTarget: any): Node))) {
      this.props.onDismiss();
    }
  }

  // Since we're rendering null, we can't use `findDOMNode(this)`.
  _handleContainerInnerElement(el: ?HTMLElement): void {
    if (this._cancelDisposable != null) {
      this._cancelDisposable.dispose();
    }

    this._innerElement = el;
    if (el == null) { return; }

    el.focus();
    this._cancelDisposable =
      atom.commands.add(el, 'core:cancel', () => { this.props.onDismiss(); });
  }

  _render(): void {
    // Wrap the children to be sure that we have a single element. (Children can be a string, array,
    // etc.)
    const wrappedChildren = (
      <div
        tabIndex="0"
        ref={this._handleContainerInnerElement}
        onBlur={this._handleBlur}>
        {this.props.children}
      </div>
    );
    ReactDOM.render(wrappedChildren, this._container);
  }

  render() {
    // Don't actually render anything here.
    return null;
  }

}
