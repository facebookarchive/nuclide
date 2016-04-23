'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  React,
  ReactDOM,
} from 'react-for-atom';
import {FileTree} from './FileTree';
import FileTreeSideBarFilterComponent from './FileTreeSideBarFilterComponent';
import {FileTreeToolbarComponent} from './FileTreeToolbarComponent';
import {FileTreeStore} from '../lib/FileTreeStore';
import {CompositeDisposable} from 'atom';
import {PanelComponentScroller} from '../../nuclide-ui/lib/PanelComponentScroller';

type State = {
  shouldRenderToolbar: boolean;
  scrollerHeight: number;
  scrollerScrollTop: number;
};

type Props = {
  hidden: boolean;
};

class FileTreeSidebarComponent extends React.Component {
  _store: FileTreeStore;
  _disposables: CompositeDisposable;
  _afRequestId: ?number;
  state: State;
  props: Props;

  constructor(props: Props) {
    super(props);

    this._store = FileTreeStore.getInstance();
    this.state = {
      shouldRenderToolbar: false,
      scrollerHeight: 0,
      scrollerScrollTop: 0,
    };
    this._disposables = new CompositeDisposable();
    this._afRequestId = null;
    (this: any)._handleFocus = this._handleFocus.bind(this);
    (this: any)._onViewChange = this._onViewChange.bind(this);
    (this: any)._scrollToPosition = this._scrollToPosition.bind(this);
    (this: any)._processExternalUpdate = this._processExternalUpdate.bind(this);
  }

  componentDidMount(): void {
    this._processExternalUpdate();

    window.addEventListener('resize', this._onViewChange);
    this._afRequestId = window.requestAnimationFrame(() => {
      this._onViewChange();
      this._afRequestId = null;
    });

    this._disposables.add(
      this._store.subscribe(this._processExternalUpdate),
      atom.project.onDidChangePaths(this._processExternalUpdate),
      () => {
        window.removeEventListener('resize', this._onViewChange);
        if (this._afRequestId != null) {
          window.cancelAnimationFrame(this._afRequestId);
        }
      },
    );
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps: Props): void {
    if (prevProps.hidden && !this.props.hidden) {
      this._onViewChange();
    }
  }

  _handleFocus(event: SyntheticEvent): void {
    // Delegate focus to the FileTree component if this component gains focus because the FileTree
    // matches the selectors targeted by themes to show the containing panel has focus.
    if (event.target === ReactDOM.findDOMNode(this)) {
      ReactDOM.findDOMNode(this.refs['fileTree']).focus();
    }
  }

  render() {
    const workingSetsStore = this._store.getWorkingSetsStore();
    let toolbar;
    if (this.state.shouldRenderToolbar && workingSetsStore != null) {
      toolbar = [
        <FileTreeSideBarFilterComponent
          key="filter"
          filter={this._store.getFilter()}
          found={this._store.getFilterFound()}
        />,
        <FileTreeToolbarComponent
          key="toolbar"
          workingSetsStore={workingSetsStore}
        />,
      ];
    }

    // Include `tabIndex` so this component can be focused by calling its native `focus` method.
    return (
      <div
        className="nuclide-file-tree-toolbar-container"
        onFocus={this._handleFocus}
        tabIndex={0}>
        {toolbar}
        <PanelComponentScroller
          ref="scroller"
          onScroll={this._onViewChange}>
          <FileTree
            ref="fileTree"
            containerHeight={this.state.scrollerHeight}
            containerScrollTop={this.state.scrollerScrollTop}
            scrollToPosition={this._scrollToPosition}
          />
        </PanelComponentScroller>
      </div>
    );
  }

  _processExternalUpdate(): void {
    const shouldRenderToolbar = !this._store.roots.isEmpty();

    if (shouldRenderToolbar !== this.state.shouldRenderToolbar) {
      this.setState({shouldRenderToolbar});
    } else {
      // Note: It's safe to call forceUpdate here because the change events are de-bounced.
      this.forceUpdate();
    }
  }

  _onViewChange(): void {
    const node = ReactDOM.findDOMNode(this.refs['scroller']);
    const {clientHeight, scrollTop} = node;

    if (clientHeight !== this.state.scrollerHeight || scrollTop !== this.state.scrollerScrollTop) {
      this.setState({scrollerHeight: clientHeight, scrollerScrollTop: scrollTop});
    }
  }

  _scrollToPosition(top: number, height: number): void {
    const requestedBottom = top + height;
    const currentBottom = this.state.scrollerScrollTop + this.state.scrollerHeight;
    if (top > this.state.scrollerScrollTop && requestedBottom <= currentBottom) {
      return;  // Already in the view
    }

    const node = ReactDOM.findDOMNode(this.refs['scroller']);
    if (node == null) {
      return;
    }
    const newTop = Math.max(top + height / 2 - this.state.scrollerHeight / 2, 0);
    setImmediate(() => {
      try {  // For the rather unlikely chance that the node is already gone from the DOM
        node.scrollTop = newTop;
        this.setState({scrollerScrollTop: newTop});
      } catch (e) {}
    });
  }
}

module.exports = FileTreeSidebarComponent;
