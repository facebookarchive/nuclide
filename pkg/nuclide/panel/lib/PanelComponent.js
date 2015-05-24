'use babel';
/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
/* @flow */
var {CompositeDisposable} = require('atom');
var React = require('react-for-atom');
var {
  addons,
  PropTypes,
} = React;


const CONTAINER_MINIMUM_WIDTH_IN_PIXELS = 100;
const DOUBLE_CLICK_TIME_INTERVAL_THRESHOLD_MS = 500;

/**
 * A container for centralizing the logic for making panels scrollable,
 * resizeable, dockable, etc.
 */
var PanelComponent = React.createClass({
  propTypes: {
    initialContainerWidthInPixels: PropTypes.number,
  },

  getInitialState(): mixed {
    return {
      isResizing: false,
      containerWidthInPixels: this.props.initialContainerWidthInPixels || 200,
    };
  },

  render(): ReactElement {
    // We create an overlay to always display the resize cursor while the user
    // is resizing the panel, even if their mouse leaves the handle.
    var resizeCursorOverlay = null;
    if (this.state.isResizing) {
      resizeCursorOverlay = <div className='nuclide-panel-component-resize-cursor-overlay' />;
    }

    var containerStyle = {
      width: this.state.containerWidthInPixels,
      minWidth: CONTAINER_MINIMUM_WIDTH_IN_PIXELS,
    };

    var children = addons.createFragment(
      addons.cloneWithProps(
        React.Children.only(this.props.children),
        {'ref': 'child'}
      )
    );

    // The `tabIndex` makes the element focusable so it can handle events. We
    // put it on the content div because its CSS expands it to fill the panel.
    return (
      <div>
        <div key='nuclide-panel-component'
             className='nuclide-panel-component-container'
             ref='container'
             style={containerStyle}>
          <div className='nuclide-panel-component-scroller'>
            <div className='nuclide-panel-component-content' tabIndex={-1} ref='focusReceiver'>
              {children}
            </div>
          </div>
          <div className='nuclide-panel-component-resize-handle' onMouseDown={this._handleMouseDown} />
          {resizeCursorOverlay}
        </div>
      </div>
    );
  },

  getContainerWidthInPixels(): number {
    return this.state.containerWidthInPixels;
  },

  _handleMouseDown(event: MouseEvent): void {
    this._resizeSubscriptions = new CompositeDisposable();

    var handleMouseMove = (e) => this._handleMouseMove(e);
    window.addEventListener('mousemove', handleMouseMove);
    this._resizeSubscriptions.add({dispose: () => window.removeEventListener('mousemove', handleMouseMove)});

    var handleMouseUp = (e) => this._handleMouseUp(e);
    window.addEventListener('mouseup', handleMouseUp);
    this._resizeSubscriptions.add({dispose: () => window.removeEventListener('mouseup', handleMouseUp)});

    this.setState({isResizing: true});
  },

  _handleMouseMove(event: MouseEvent): void {
    var containerEl = this.refs['container'].getDOMNode();
    var containerWidthInPixels = event.pageX - containerEl.getBoundingClientRect().left;
    this.setState({containerWidthInPixels});
  },

  _handleMouseUp(event: MouseEvent): void {
    // Since we cannot listen to both 'click' and 'dblclick' on the same element,
    // determine if this is a double click, and handle it first.
    var now = new Date();
    if (this._lastClick) {
      var difference = now - this._lastClick;
      if (difference <= DOUBLE_CLICK_TIME_INTERVAL_THRESHOLD_MS) {
        this._handleDoubleClick();
      }
    }
    this._lastClick = now;

    if (this._resizeSubscriptions) {
      this._resizeSubscriptions.dispose();
    }
    this.setState({isResizing: false});
  },

  /**
   * Resize the pane to fit its contents.
   */
  _handleDoubleClick(): void {
      // Set the width to 0 so that resizing works when width exceeds the offsetwidth of the 'focusReceiver'.
      var containerWidthInPixels = 0;
      this.setState({containerWidthInPixels});
      containerWidthInPixels = this.refs['focusReceiver'].getDOMNode().offsetWidth;
      this.setState({containerWidthInPixels});
  },

  focus(): void {
    this.refs['focusReceiver'].getDOMNode().focus();
  },
});

module.exports = PanelComponent;
