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
var React = require('react-for-atom');
var {
  addons,
  PropTypes,
} = React;

const MINIMUM_LENGTH = 100;
const DOUBLE_CLICK_TIME_INTERVAL_THRESHOLD_MS = 500;

/**
 * A container for centralizing the logic for making panels scrollable,
 * resizeable, dockable, etc.
 */
var PanelComponent = React.createClass({
  propTypes: {
    initialLength: PropTypes.number,
    dock: PropTypes.oneOf(['left', 'bottom']).isRequired,
    /**
     * Scrollable contents are mounted in a div that may overflow.
     * Non-scrollable contents may match their bounds directly to that of the
     * container.
     */
    scrollable: PropTypes.bool,
  },

  getDefaultProps(): Object {
    return {
      initalLength: 200,
      scrollable: false,
    };
  },

  getInitialState(): Object {
    return {
      isResizing: false,
      length: this.props.initialLength,
    };
  },

  render(): ReactElement {
    // We create an overlay to always display the resize cursor while the user
    // is resizing the panel, even if their mouse leaves the handle.
    var resizeCursorOverlay = null;
    if (this.state.isResizing) {
      resizeCursorOverlay = <div className={`nuclide-panel-component-resize-cursor-overlay ${this.props.dock}`} />;
    }

    var containerStyle;
    if (this.props.dock === 'left') {
      containerStyle = {
        width: this.state.length,
        minWidth: MINIMUM_LENGTH,
      };
    } else if (this.props.dock === 'bottom') {
      containerStyle = {
        height: this.state.length,
        minHeight: MINIMUM_LENGTH,
      };
    }

    // The `tabIndex` makes the element focusable so it can handle events.
    var content = React.cloneElement(
      React.Children.only(this.props.children),
      {tabIndex: -1, ref: 'child'});
    if (this.props.scrollable) {
      content = <div className='nuclide-panel-component-scrollable-content'>{content}</div>;
    }

    return (
      <div className={`nuclide-panel-component ${this.props.dock}`}
           ref='container'
           style={containerStyle}>
        <div className={`nuclide-panel-component-resize-handle ${this.props.dock}`}
             onMouseDown={this._handleMouseDown}
             onDoubleClick={this._handleDoubleClick} />
        <div className='nuclide-panel-component-scroller'>
          {content}
        </div>
        {resizeCursorOverlay}
      </div>
    );
  },

  /**
   * Returns the current resizable length.
   *
   * For panels docked left or right, the length is the width. For panels
   * docked top or bottom, it's the height.
   */
  getLength(): number {
    return this.state.length;
  },

  focus(): void {
    this.refs.child.getDOMNode().focus();
  },

  getChildComponent(): void {
    return this.refs.child;
  },

  _handleMouseDown(event: SyntheticMouseEvent): void {
    this._resizeSubscriptions = new CompositeDisposable();

    window.addEventListener('mousemove', this._handleMouseMove);
    this._resizeSubscriptions.add({
      dispose: () => window.removeEventListener('mousemove', this._handleMouseMove)
    });

    window.addEventListener('mouseup', this._handleMouseUp);
    this._resizeSubscriptions.add({
      dispose: () => window.removeEventListener('mouseup', this._handleMouseUp)
    });

    this.setState({isResizing: true});
  },

  _handleMouseMove(event: SyntheticMouseEvent): void {
    var containerEl = this.refs['container'].getDOMNode();
    var length = 0;
    if (this.props.dock === 'left') {
      length = event.pageX - containerEl.getBoundingClientRect().left;
    } else if (this.props.dock === 'bottom') {
      length = containerEl.getBoundingClientRect().bottom - event.pageY;
    }
    this.setState({length});
  },

  _handleMouseUp(event: SyntheticMouseEvent): void {
    if (this._resizeSubscriptions) {
      this._resizeSubscriptions.dispose();
    }
    this.setState({isResizing: false});
  },

  /**
   * Resize the pane to fit its contents.
   */
  _handleDoubleClick(): void {
    // Reset size to 0 and read the content's natural width (after re-layout)
    // to determine the size to scale to.
    this.setState({length: 0});
    this.forceUpdate(() => {
      var length = 0;
      var childNode = this.refs.child.getDOMNode();
      if (this.props.dock === 'left') {
        length = childNode.offsetWidth;
      } else if (this.props.dock === 'bottom') {
        length = childNode.offsetHeight;
      } else {
        throw new Error('unhandled dock');
      }
      this.setState({length});
    });
  },
});

module.exports = PanelComponent;
