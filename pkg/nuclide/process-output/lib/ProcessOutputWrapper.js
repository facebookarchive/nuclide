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
import type ProcessOutputHandler from './types';
type ProcessOutputWrapperOptions = {
  title?: string;
  processOutputHandler?: ProcessOutputHandler;
};

import ProcessOutputView from './ProcessOutputView';
import React from 'react-for-atom';

class ProcessOutputWrapper extends HTMLElement {
  _title: ?string;
  _processOutputStore: ScriptBufferedProcessStore;

  /**
   * @param store The ScriptBufferedProcessStore that provides data to this view.
   * @param options An Object of the form:
   *   title: (optional) The title to display in the Atom tab that this view opens in.
   *   processOutputHandler: (optional) A ProcessOutputHandler to pass to the ProcessOutputView.
   */
  initialize(store: ScriptBufferedProcessStore, options?: ProcessOutputWrapperOptions = {}) {
    this._processOutputStore = store;
    this._title = options.title || 'Process Output';
    React.render(
      <ProcessOutputView
        processOutputStore={this._processOutputStore}
        processOutputHandler={options.processOutputHandler}
      />,
      this
    );
  }

  getTitle(): string {
    return this._title;
  }

  detachedCallback() {
    React.unmountComponentAtNode(this);
  }
}

module.exports = document.registerElement('process-output-wrapper', ProcessOutputWrapper);
