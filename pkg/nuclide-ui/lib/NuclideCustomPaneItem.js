'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-env browser */

import invariant from 'assert';
import {ReactDOM} from 'react-for-atom';

import type {NuclideCustomPaneItemOptions} from './types';

export class NuclideCustomPaneItem extends HTMLElement {

  _title: ?string;
  _iconName: ?string;
  _uri: ?string;
  _allowSplit: boolean;
  __component: ReactElement;

  initialize(options: NuclideCustomPaneItemOptions) {
    this._title = options.title;
    this._iconName = options.iconName;
    this._uri = options.uri;
    this._allowSplit = !!options.allowSplit;

    this.__component = ReactDOM.render(this.__renderPaneItem(options), this);
  }

  /**
   * Subclasses should override this method to render the pane using options passed from above.
   * This method is invoked as part of initialize(), and so, it should be safe to invoke any of the
   * getter methods on this class in this method.
   *
   * @return A React component that this element call ReactDOM.render() on.
   */
  __renderPaneItem(options: NuclideCustomPaneItemOptions): ReactElement {
    throw new Error('Subclass should implement this method.');
  }

  getTitle(): string {
    invariant(this._title);
    return this._title;
  }

  getIconName(): ?string {
    return this._iconName;
  }

  getURI(): ?string {
    return this._uri;
  }

  copy(): boolean {
    return this._allowSplit;
  }

  detachedCallback() {
    ReactDOM.unmountComponentAtNode(this);
  }
}
