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
var React = require('react-for-atom');

var {PropTypes} = React;

// Leading indent for each tree node
var INDENT_IN_PX = 10;
// Additional indent for nested tree nodes
var INDENT_PER_LEVEL = 15;
var DOWN_ARROW = '\uF0A3';
var RIGHT_ARROW = '\uF078';
var SPINNER = '\uF087';

// TODO: replace this with an actual class?
type EntryDescriptor = {
  key: string,
  text: string,
  indentLevel: number,
  isDirectory: boolean,
  isExpanded: boolean,
  isLoading: boolean,
};

var store = FileTreeStore.getInstance();

class RootDirectory extends React.Component {
  render(): ReactElement {
    var rootKey = this.props.nodeKey;
    // Note: This double rootKey stuff might seem strange but it's only because we're rendering a
    // root-level directory. For all other directories it will be more clear.
    var isExpanded = store.isExpanded(rootKey, rootKey);
    if (isExpanded) {
      // get children FIRST since it might affect isLoading (lazy fetching)
      var children = store.getChildren(rootKey, rootKey);
      var isLoading = store.isLoading(rootKey, rootKey);
    }
    return (
      <div className="nuclide-tree-root">
        {this._renderEntry({
          key: this.props.nodeKey,
          text: this.props.name,
          indentLevel: 0,
          isDirectory: true,
          isExpanded,
          isLoading,
        })}
        {isExpanded ? this._renderChildren(children) : null}
      </div>
    );
  }

  _renderChildren(children: Array<string>): Array<ReactElement> {
    return children.map(nodeKey => {
      // TODO: We should use a TreeNode<key, name, type> or something
      var isDirectory = nodeKey.slice(-1) === '/';
      var nodeName = nodeKey.replace(/\/+$/, '').split('/').pop();
      return this._renderEntry({
        key: nodeKey,
        text: nodeName,
        indentLevel: 1,
        isDirectory: isDirectory,
        isExpanded: false,
        isLoading: false,
      });
    });
  }

  // TODO: Do something about this parameter soup
  _renderEntry(entry: EntryDescriptor): ReactElement {
    var {key, text, indentLevel, isDirectory, isExpanded, isLoading} = entry;
    var outerStyle = {
      paddingLeft: INDENT_IN_PX + indentLevel * INDENT_PER_LEVEL,
    };
    var outerClassName = 'entry file list-item nuclide-tree-component-item';
    var innerClassName = 'icon name ' + (isDirectory ? 'icon-file-directory' : 'icon-file-text');
    var icon: ?ReactElement;
    if (isLoading) {
      icon = <span className="nuclide-tree-component-item-arrow-spinner">{SPINNER}</span>;
    } else if (isDirectory) {
      icon = isExpanded ? <span>{DOWN_ARROW}</span> : <span>{RIGHT_ARROW}</span>;
    }
    return (
      <div key={key} className={outerClassName} style={outerStyle}>
        <span className="nuclide-tree-component-item-arrow">{icon}</span>
        <span className={innerClassName}>{text}</span>
      </div>
    );
  }
}

RootDirectory.propTypes = {
  nodeKey: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};


module.exports = RootDirectory;
