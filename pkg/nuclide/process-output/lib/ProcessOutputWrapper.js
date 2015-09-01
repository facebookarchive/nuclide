'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ScriptBufferedProcessStore} from 'nuclide-atom-helpers';

import ProcessOutputView from './ProcessOutputView';
import React from 'react-for-atom';

class ProcessOutputWrapper extends HTMLElement {
  _title: ?string;
  _processOutputStore: ScriptBufferedProcessStore;

  /**
   * @param store The ScriptBufferedProcessStore that provides data to this view.
   * @param title The title to display in the Atom tab that this view opens in.
   */
  initialize(store: ScriptBufferedProcessStore, title?: string) {
    this._processOutputStore = store;
    this._title = title;
    React.render(
      <ProcessOutputView processOutputStore={this._processOutputStore} />,
      this
    );
  }

  getTitle(): string {
    return this._title ? this._title : 'Process Output';
  }

  detachedCallback() {
    React.unmountComponentAtNode(this);
  }
}

module.exports = document.registerElement('process-output-wrapper', ProcessOutputWrapper);
