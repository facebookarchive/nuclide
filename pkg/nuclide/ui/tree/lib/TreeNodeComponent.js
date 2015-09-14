'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var LazyTreeNode = require('./LazyTreeNode');
var React = require('react-for-atom');
var {
  addons,
  PropTypes,
} = React;

var INDENT_IN_PX = 10;
var INDENT_PER_LEVEL_IN_PX = 15;
var DOWN_ARROW = '\uF0A3';
var RIGHT_ARROW = '\uF078';
var SPINNER = '\uF087';

/**
 * Represents one entry in a TreeComponent.
 */
var TreeNodeComponent = React.createClass({
  propTypes: {
    depth: PropTypes.number.isRequired,
    isContainer: PropTypes.bool.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    label: PropTypes.string.isRequired,
    labelClassName: PropTypes.string.isRequired,
    node: PropTypes.instanceOf(LazyTreeNode).isRequired,
    onClickArrow: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onDoubleClick: PropTypes.func.isRequired,
    onMouseDown: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    rowClassName: PropTypes.string,
  },

  mixins: [
    addons.PureRenderMixin,
  ],

  render(): ReactElement {
    var rowClassNameObj: {[key: string]: boolean} = {
      // Support for selectors in the "file-icons" package.
      // @see {@link https://atom.io/packages/file-icons|file-icons}
      'entry file list-item': true,
      'nuclide-tree-component-item': true,
      'nuclide-tree-component-selected': this.props.isSelected,
    };
    if (this.props.rowClassName) {
      rowClassNameObj[this.props.rowClassName] = true;
    }

    var itemStyle = {
      paddingLeft: INDENT_IN_PX + this.props.depth * INDENT_PER_LEVEL_IN_PX,
    };

    var arrow;
    if (this.props.isContainer) {
      if (this.props.isExpanded) {
        if (this.props.isLoading) {
          arrow = <span className="nuclide-tree-component-item-arrow-spinner">{SPINNER}</span>;
        } else {
          arrow = DOWN_ARROW;
        }
      } else {
        arrow = RIGHT_ARROW;
      }
    }

    return (
      <div
        className={addons.classSet(rowClassNameObj)}
        style={itemStyle}
        onClick={this._onClick}
        onDoubleClick={this._onDoubleClick}
        onMouseDown={this._onMouseDown}>
        <span className="nuclide-tree-component-item-arrow" ref="arrow">
          {arrow}
        </span>
        <span
          className={this.props.labelClassName}
          // `data-name` is support for selectors in the "file-icons" package.
          // @see {@link https://atom.io/packages/file-icons|file-icons}
          data-name={this.props.label}
          data-path={this.props.path}>
          {this.props.label}
        </span>
      </div>
    );
  },

  _onClick(event: SyntheticMouseEvent): void {
    if (React.findDOMNode(this.refs['arrow']).contains(event.target)) {
      this.props.onClickArrow(event, this.props.node);
    } else {
      this.props.onClick(event, this.props.node);
    }
  },

  _onDoubleClick(event: SyntheticMouseEvent): void {
    this.props.onDoubleClick(event, this.props.node);
  },

  _onMouseDown(event: SyntheticMouseEvent): void {
    this.props.onMouseDown(event, this.props.node);
  },
});

module.exports = TreeNodeComponent;
