'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

/**
 * Base class for a provider for QuickSelectionComponent.
 */
class QuickSelectionProvider {
  /**
   *  gets prompt text
   */
  getPromptText(): string {
    throw new Error('Not implemented');
  }

  /**
   * Asynchronously executes a search based on @query.
   */
  executeQuery(query: string): Promise<Array<mixed>> {
    return Promise.reject('Not implemented');
  }

  /**
   * Returns a ReactElement based on @item, which should be an
   * object returned from executeQuery, above.
   */
  getComponentForItem(item: mixed): ReactElement {
    return <div>{item.toString()}</div>
  }

}

module.exports = QuickSelectionProvider;
