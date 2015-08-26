'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeStore = require('../lib/FileTreeStore');
var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');
var RootNodeComponent = require('./RootNodeComponent');

type Props = {};

var store = FileTreeStore.getInstance();

class FileTree extends React.Component {
  _subscriptions: CompositeDisposable;

  constructor(props: Props) {
    super(props);
    this._subscriptions = new CompositeDisposable();
  }

  componentDidMount(): void {
    this._subscriptions.add(
      store.subscribe(() => {
        // Note: It's safe to call forceUpdate here because the change events are de-bounced.
        this.forceUpdate();
      })
    );
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }

  render(): ReactElement {
    return (
      <div className="nuclide-file-tree">
        {this._renderChildren()}
      </div>
    );
  }

  _renderChildren(): ReactElement | Array<ReactElement> {
    var rootKeys: Array<string> = store.getRootKeys();
    if (rootKeys.length === 0) {
      return <div>No project root</div>;
    }
    return rootKeys.map((rootKey) => {
      return (
        <RootNodeComponent key={rootKey} rootKey={rootKey} />
      );
    });
  }
}

module.exports = FileTree;
