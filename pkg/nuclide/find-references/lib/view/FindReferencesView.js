'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FileReferences} from '../types';

var React = require('react-for-atom');
var FileReferencesView = require('./FileReferencesView');
var FindReferencesModel = require('../FindReferencesModel');

// Number of files to show on every page.
var PAGE_SIZE = 10;
// Start loading more once the user scrolls within this many pixels of the bottom.
var SCROLL_LOAD_THRESHOLD = 250;

function pluralize(noun: string, count: number) {
  return count === 1 ? noun : noun + 's';
}

var FindReferencesView = React.createClass({

  propTypes: {
    model: React.PropTypes.objectOf(FindReferencesModel).isRequired,
  },

  getInitialState() {
    var references: Array<FileReferences> = [];
    return {
      loading: true,
      fetched: 0,
      references,
    };
  },

  componentDidMount() {
    this._fetchMore(PAGE_SIZE);
  },

  async _fetchMore(count: number): Promise<void> {
    var next = await this.props.model.getFileReferences(
      this.state.fetched,
      PAGE_SIZE
    );
    this.setState({
      loading: false,
      fetched: this.state.fetched + PAGE_SIZE,
      references: this.state.references.concat(next),
    });
  },

  _onScroll(evt: Event) {
    var root = React.findDOMNode(this.refs.root);
    if (this.state.loading || root.clientHeight >= root.scrollHeight) {
      return;
    }
    var scrollBottom = root.scrollTop + root.clientHeight;
    if (root.scrollHeight - scrollBottom <= SCROLL_LOAD_THRESHOLD) {
      this.setState({loading: true});
      this._fetchMore(PAGE_SIZE);
    }
  },

  render(): ReactElement {
    var children = this.state.references.map((fileRefs, i) =>
      <FileReferencesView
        key={i}
        {...fileRefs}
        basePath={this.props.model.getBasePath()}
      />
    );

    var refCount = this.props.model.getReferenceCount();
    var fileCount = this.props.model.getFileCount();
    if (this.state.fetched < fileCount) {
      children.push(
        <div
          key="loading"
          className="nuclide-find-references-loading loading-spinner-medium"
        />
      );
    }

    return (
      <div className="nuclide-find-references" onScroll={this._onScroll} ref="root">
        <div className="nuclide-find-references-count">
          Found {refCount} {pluralize('reference', refCount)}{' '}
          in {fileCount} {pluralize('file', fileCount)}.
        </div>
        {children}
      </div>
    );
  }

});

module.exports = FindReferencesView;
