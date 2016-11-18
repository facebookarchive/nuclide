'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelComponent = undefined;

var _class, _temp;

var _atom = require('atom');

var _PanelComponentScroller;

function _load_PanelComponentScroller() {
  return _PanelComponentScroller = require('./PanelComponentScroller');
}

var _reactForAtom = require('react-for-atom');

const MINIMUM_LENGTH = 100;

/**
 * A container for centralizing the logic for making panels scrollable,
 * resizeable, dockable, etc.
 */
let PanelComponent = exports.PanelComponent = (_temp = _class = class PanelComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isResizing: false,
      length: this.props.initialLength
    };

    // Bind main events to this object. _updateSize is only ever bound within these.
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
  }

  componentDidMount() {
    // Note: This method is called via `requestAnimationFrame` rather than `process.nextTick` like
    // Atom's tree-view does because this does not have a guarantee a paint will have already
    // happened when `componentDidMount` gets called the first time.
    this._animationFrameRequestId = window.requestAnimationFrame(this._repaint.bind(this));
  }

  componentWillUnmount() {
    if (this._resizeSubscriptions != null) {
      this._resizeSubscriptions.dispose();
    }
    if (this._animationFrameRequestId != null) {
      window.cancelAnimationFrame(this._animationFrameRequestId);
    }
  }

  /**
   * Forces the potentially scrollable region to redraw so its scrollbars are drawn with styles from
   * the active theme. This mimics the login in Atom's tree-view [`onStylesheetChange`][1].
   *
   * [1] https://github.com/atom/tree-view/blob/v0.201.5/lib/tree-view.coffee#L722
   */
  _repaint() {
    const element = _reactForAtom.ReactDOM.findDOMNode(this);
    const isVisible = window.getComputedStyle(element, null).getPropertyValue('visibility');

    if (isVisible) {
      // Force a redraw so the scrollbars are styled correctly based on the theme
      element.style.display = 'none';
      element.offsetWidth;
      element.style.display = '';
    }
  }

  render() {
    // We create an overlay to always display the resize cursor while the user
    // is resizing the panel, even if their mouse leaves the handle.
    let resizeCursorOverlay = null;
    if (this.state.isResizing) {
      resizeCursorOverlay = _reactForAtom.React.createElement('div', { className: `nuclide-ui-panel-component-resize-cursor-overlay ${ this.props.dock }` });
    }

    let containerStyle;
    if (this.props.dock === 'left' || this.props.dock === 'right') {
      containerStyle = {
        width: this.state.length,
        minWidth: MINIMUM_LENGTH
      };
    } else if (this.props.dock === 'top' || this.props.dock === 'bottom') {
      containerStyle = {
        height: this.state.length,
        minHeight: MINIMUM_LENGTH
      };
    }

    const content = _reactForAtom.React.cloneElement(_reactForAtom.React.Children.only(this.props.children), { ref: 'child' });

    let wrappedContent;
    if (this.props.noScroll) {
      wrappedContent = content;
    } else {
      wrappedContent = _reactForAtom.React.createElement(
        (_PanelComponentScroller || _load_PanelComponentScroller()).PanelComponentScroller,
        { overflowX: this.props.overflowX },
        content
      );
    }

    // Use the `tree-view-resizer` class from Atom's [tree-view][1] because it is targeted by some
    // themes, like [spacegray-dark-ui][2], to customize the scroll bar in the tree-view. Use this
    // inside `PanelComponent` rather than just file-tree so any scrollable panels created with this
    // component are styled accordingly.
    //
    // [1] https://github.com/atom/tree-view/blob/v0.201.5/lib/tree-view.coffee#L28
    // [2] https://github.com/cannikin/spacegray-dark-ui/blob/v0.12.0/styles/tree-view.less#L21
    return _reactForAtom.React.createElement(
      'div',
      {
        className: `nuclide-ui-panel-component tree-view-resizer ${ this.props.dock }`,
        hidden: this.props.hidden,
        style: containerStyle },
      _reactForAtom.React.createElement('div', { className: `nuclide-ui-panel-component-resize-handle ${ this.props.dock }`,
        ref: 'handle',
        onMouseDown: this._handleMouseDown,
        onDoubleClick: this._handleDoubleClick
      }),
      _reactForAtom.React.createElement(
        'div',
        { className: 'nuclide-ui-panel-component-content' },
        wrappedContent
      ),
      resizeCursorOverlay
    );
  }

  /**
   * Returns the current resizable length.
   *
   * For panels docked left or right, the length is the width. For panels
   * docked top or bottom, it's the height.
   */
  getLength() {
    return this.state.length;
  }

  focus() {
    this.refs.child.focus();
  }

  getChildComponent() {
    return this.refs.child;
  }

  _handleMouseDown(event) {
    if (this._resizeSubscriptions != null) {
      this._resizeSubscriptions.dispose();
    }

    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp);
    this._resizeSubscriptions = new _atom.CompositeDisposable({ dispose: () => {
        window.removeEventListener('mousemove', this._handleMouseMove);
      } }, { dispose: () => {
        window.removeEventListener('mouseup', this._handleMouseUp);
      } });

    this.setState({ isResizing: true });
  }

  _handleMouseMove(event) {
    const containerEl = _reactForAtom.ReactDOM.findDOMNode(this);
    let length = 0;
    switch (this.props.dock) {
      case 'left':
        length = event.pageX - containerEl.getBoundingClientRect().left;
        break;
      case 'top':
        length = event.pageY - containerEl.getBoundingClientRect().top;
        break;
      case 'bottom':
        length = containerEl.getBoundingClientRect().bottom - event.pageY;
        break;
      case 'right':
        length = containerEl.getBoundingClientRect().right - event.pageX;
        break;
    }
    this._updateSize(length);
  }

  _handleMouseUp(event) {
    if (this._resizeSubscriptions) {
      this._resizeSubscriptions.dispose();
    }
    this.setState({ isResizing: false });
  }

  /**
   * Resize the pane to fit its contents.
   */
  _handleDoubleClick() {
    // Reset size to 0 and read the content's natural width (after re-layout)
    // to determine the size to scale to.
    this.setState({ length: 0 });
    this.forceUpdate(() => {
      let length = 0;
      const childNode = _reactForAtom.ReactDOM.findDOMNode(this.refs.child);
      const handle = _reactForAtom.ReactDOM.findDOMNode(this.refs.handle);
      if (this.props.dock === 'left' || this.props.dock === 'right') {
        length = childNode.offsetWidth + handle.offsetWidth;
      } else if (this.props.dock === 'top' || this.props.dock === 'bottom') {
        length = childNode.offsetHeight + handle.offsetHeight;
      } else {
        throw new Error('unhandled dock');
      }
      this._updateSize(length);
    });
  }

  // Whether this is width or height depends on the orientation of this panel.
  _updateSize(newSize) {
    this.setState({ length: newSize });
    this.props.onResize.call(null, newSize);
  }
}, _class.defaultProps = {
  hidden: false,
  initialLength: 200,
  noScroll: false,
  onResize: width => {}
}, _temp);