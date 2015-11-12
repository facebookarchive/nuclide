'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';

const URI = 'atom://nuclide/react-native-inspector/';

class Activation {
  _disposables: CompositeDisposable;

  constructor() {
    this._disposables = new CompositeDisposable();
  }

  activate() {
    this._disposables.add(
      atom.workspace.addOpener(getPaneItem),
    );
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-react-native-inspector:open',
        () => atom.workspace.open(URI),
      )
    );
  }

  deactivate() {
    this._disposables.dispose();
  }

}

function getPaneItem(uri) {
  if (!uri.startsWith(URI)) {
    return null;
  }
  const PaneItem = require('./ui/PaneItem');
  const paneItem = new PaneItem();
  paneItem.initialize({
    uri,
    title: 'RN Element Inspector',
    initialProps: {},
  });
  return paneItem;
}

let activation: ?Activation = null;

export function activate() {
  if (activation == null) {
    activation = new Activation();
    activation.activate();
  }
}

export function deactivate() {
  if (activation) {
    activation.deactivate();
    activation = null;
  }
}

atom.deserializers.add({
  name: 'ReactNativeInspectorPaneItem',
  deserialize: state => getPaneItem(state.uri),
});
