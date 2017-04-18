/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */
/* global Node */
/* global HTMLElement */

import invariant from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import {Observable} from 'rxjs';
import UniversalDisposable from '../commons-node/UniversalDisposable';

/**
 * Given a function to dismiss the modal, return a React element for the content.
 * Call the function when e.g. the user clicks a Cancel or Submit button.
 */
type ContentFactory = (dismiss: () => void) => React$Element<any>;

/** Wrap options in an object so we can add new ones later without an explosion of params */
type Options = {|
  onDismiss?: () => void,
  /** Disable the default behavior of dismissing when the user clicks outside the modal. */
  disableDismissOnClickOutsideModal?: boolean,
|};

/**
 * Shows a modal dialog that renders a React element as its content.
 * The modal is automatically hidden when the user clicks outside of it, and on core:cancel (esc).
 * The modal panel unmounts its React component and destroys the panel as soon as it is hidden;
 * you may not hide the panel and then re-show it later.
 * Returns a disposable that you may use to hide and destroy the modal.
 */
export default function showModal(
  contentFactory: ContentFactory,
  options: Options = defaults,
): IDisposable {
  const hostElement = document.createElement('div');
  const atomPanel = atom.workspace.addModalPanel({item: hostElement});
  const disposable = new UniversalDisposable(
    options.disableDismissOnClickOutsideModal ? () => undefined :
      Observable.fromEvent(document, 'mousedown').subscribe(({target}) => {
        invariant(target instanceof Node);
        if (!atomPanel.getItem().contains(target)) {
          atomPanel.hide();
        }
      }),
    atomPanel.onDidChangeVisible(visible => {
      if (!visible) {
        disposable.dispose();
      }
    }),
    atom.commands.add('atom-workspace', 'core:cancel', () => disposable.dispose()),
    () => {
      // Call onDismiss before unmounting the component and destroying the panel:
      if (options.onDismiss) {
        options.onDismiss();
      }
      ReactDOM.unmountComponentAtNode(hostElement);
      atomPanel.destroy();
    },
  );

  ReactDOM.render(
    <ModalContainer>{contentFactory(disposable.dispose.bind(disposable))}</ModalContainer>,
    hostElement,
  );
  return disposable;
}

/** Flow makes {} an unsealed object (eyeroll) */
const defaults: Options = Object.freeze({});

type Props = {
  children?: any,
};

/**
 * Just exists to provide a div that we can focus on mount. This ensures we steal focus from any
 * editors or other panes while the modal is present.
 */
class ModalContainer extends React.Component {
  props: Props;

  render(): React.Element<any> {
    return <div tabIndex="-1">{this.props.children}</div>;
  }

  componentDidMount(): void {
    const node = ReactDOM.findDOMNode(this);
    invariant(node instanceof HTMLElement);
    node.focus();
  }
}
