/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type FileTreeActions from './FileTreeActions';
import type FileTreeStore from './FileTreeStore';
import * as Selectors from './FileTreeSelectors';
// $FlowFixMe(>=0.53.0) Flow suppress
import type React from 'react';

import * as Immutable from 'immutable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export default class ProjectSelectionManager {
  _actions: FileTreeActions;
  _store: FileTreeStore;

  constructor(store: FileTreeStore, actions: FileTreeActions) {
    this._store = store;
    this._actions = actions;
  }

  addExtraContent(content: React.Element<any>): IDisposable {
    this._actions.addExtraProjectSelectionContent(content);
    return new UniversalDisposable(() =>
      this._actions.removeExtraProjectSelectionContent(content),
    );
  }

  getExtraContent(): Immutable.List<React.Element<any>> {
    return Selectors.getExtraProjectSelectionContent(this._store);
  }
}
