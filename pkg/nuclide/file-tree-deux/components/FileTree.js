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
var RootDirectory = require('./RootDirectory');

var store = FileTreeStore.getInstance();

class FileTree extends React.Component {
  _subscriptions: CompositeDisposable;

  constructor(props) {
    super(props);
    this._subscriptions = new CompositeDisposable();
  }

  componentDidMount() {
    this._subscriptions.add(
      store.subscribe(() => {
        // Note: It's safe to call forceUpdate here because the change events are de-bounced.
        this.forceUpdate();
      })
    );
  }

  componentWillUnmount() {
    this._subscriptions.dispose();
  }

  render() {
    return (
      <div className="nuclide-file-tree">
        {this._renderChildren()}
      </div>
    );
  }

  _renderChildren() {
    var rootDirectories: Array<string> = store.getRootDirectories();
    if (rootDirectories.length === 0) {
      return <div>No project root</div>;
    }
    return rootDirectories.map((nodeKey) => {
      // TODO: remove this string manipulation
      var nodeName = nodeKey.replace(/\/+$/, '').split('/').pop();
      return (
        <RootDirectory
          key={nodeKey}
          nodeKey={nodeKey}
          name={nodeName}
        />
      );
    });
  }
}

module.exports = FileTree;
