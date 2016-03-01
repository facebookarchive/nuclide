'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

import {React} from 'react-for-atom';
import FileTree from './FileTree';
import {FileTreeToolbarComponent} from './FileTreeToolbarComponent';
import FileTreeStore from '../lib/FileTreeStore';
import {CompositeDisposable} from 'atom';

type State = {
  shouldRenderToolbar: boolean;
}

class FileTreeSidebarComponent extends React.Component {
  _store: FileTreeStore;
  _disposables: CompositeDisposable;
  state: State;

  constructor(props: Object) {
    super(props);

    this._store = FileTreeStore.getInstance();
    this.state = {
      shouldRenderToolbar: false,
    };
    this._disposables = new CompositeDisposable();
  }

  componentDidMount(): void {
    this._processExternalUpdate();
    this._disposables.add(
      this._store.subscribe(this._processExternalUpdate.bind(this))
    );
    this._disposables.add(atom.project.onDidChangePaths(this._processExternalUpdate.bind(this)));
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render() {
    const workingSetsStore = this._store.getWorkingSetsStore();
    let toolbar;
    if (this.state.shouldRenderToolbar && workingSetsStore != null) {
      toolbar = <FileTreeToolbarComponent workingSetsStore={workingSetsStore} />;
    }


    return (
      <div className="nuclide-file-tree-toolbar-container">
        {toolbar}
        <FileTree nodeToKeepInView={this._store.getTrackedNode()} />
      </div>
    );
  }

  _processExternalUpdate(): void {
    const shouldRenderToolbar = this._store.getRootKeys().length !== 0;

    if (shouldRenderToolbar !== this.state.shouldRenderToolbar) {
      this.setState({shouldRenderToolbar});
    } else {
      // Note: It's safe to call forceUpdate here because the change events are de-bounced.
      this.forceUpdate();
    }
  }
}

module.exports = FileTreeSidebarComponent;
