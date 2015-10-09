'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var FileTreeStore = require('../lib/FileTreeStore');
var React = require('react-for-atom');
var RootNodeComponent = require('./RootNodeComponent');
var EmptyComponent = require('./EmptyComponent');

var {PropTypes} = React;

class FileTree extends React.Component {
  _subscriptions: CompositeDisposable;

  constructor(props: Object) {
    super(props);
    this._subscriptions = new CompositeDisposable();
    this.state = {
      nodeToKeepInView: null,
    };
  }

  componentDidMount(): void {
    this._subscriptions.add(
      this.props.store.subscribe(() => {
        var nodeToKeepInView = this.props.store.getTrackedNode();
        if (nodeToKeepInView !== this.state.nodeToKeepInView) {
          /*
           * Store a copy of `nodeToKeepInView` so the Store can update during this component's
           * rendering without wiping out the state of the node that needs to scroll into view.
           * Store events are fired synchronously, which means `getNodeToKeepInView` will return its
           * value for at least one `change` event.
           */
          this.setState({nodeToKeepInView});
        } else {
          // Note: It's safe to call forceUpdate here because the change events are de-bounced.
          this.forceUpdate();
        }
      })
    );
  }

  componentDidUpdate(prevProps: Object, prevState: Object): void {
    if (prevState.nodeToKeepInView != null) {
      /*
       * Scroll the node into view one final time after being reset to ensure final render is
       * complete before scrolling. Because the node is in `prevState`, check for its existence
       * before scrolling it.
       */
      var refNode = this.refs[prevState.nodeToKeepInView.rootKey];
      if (refNode != null) {
        refNode.scrollNodeIntoViewIfNeeded(prevState.nodeToKeepInView.nodeKey);
      }
    }
  }

  componentWillUnmount(): void {
    this._subscriptions.dispose();
  }

  focus(): void {
    React.findDOMNode(this).focus();
  }

  hasFocus(): boolean {
    return document.activeElement === React.findDOMNode(this);
  }

  render(): ReactElement {
    return (
      <div className="nuclide-file-tree" tabIndex={0}>
        {this._renderChildren()}
      </div>
    );
  }

  _renderChildren(): ReactElement | Array<ReactElement> {
    var rootKeys: Array<string> = this.props.store.getRootKeys();
    if (rootKeys.length === 0) {
      return <EmptyComponent />;
    }
    return rootKeys.map((rootKey) => {
      return (
        <RootNodeComponent
          key={rootKey}
          ref={rootKey}
          rootNode={this.props.store.getRootNode(rootKey)}
          rootKey={rootKey}
        />
      );
    });
  }
}

FileTree.propTypes = {
  store: PropTypes.instanceOf(FileTreeStore).isRequired,
};

module.exports = FileTree;
