'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PanelComponent = undefined;

var _observable;

function _load_observable() {
  return _observable = require('../../../commons-node/observable');
}

var _View;

function _load_View() {
  return _View = require('../../../nuclide-ui/View');
}

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

/* global getComputedStyle */

const MINIMUM_LENGTH = 100;
const DEFAULT_INITIAL_SIZE = 300;

/**
 * A container for centralizing the logic for making panels resizable.
 */
class PanelComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isResizing: false,
      size: this.props.initialSize
    };

    // Bind main events to this object. _updateSize is only ever bound within these.
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
  }

  componentDidMount() {
    // Note: This method is called via `requestAnimationFrame` rather than `process.nextTick` like
    // Atom's tree-view does because this does not have a guarantee a paint will have already
    // happened when `componentDidMount` gets called the first time.
    this._animationFrameRequestSubscription = (_observable || _load_observable()).nextAnimationFrame.subscribe(() => {
      this._repaint();
    });
  }

  componentWillUnmount() {
    if (this._resizeSubscriptions != null) {
      this._resizeSubscriptions.dispose();
    }
    if (this._animationFrameRequestSubscription != null) {
      this._animationFrameRequestSubscription.unsubscribe();
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
    const isVisible = getComputedStyle(element).getPropertyValue('visibility');

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
      const className = `nuclide-ui-panel-component-resize-cursor-overlay ${this.props.position}`;
      resizeCursorOverlay = _reactForAtom.React.createElement('div', { className: className });
    }

    const size = this.state.size == null ? this._getInitialSize() : this.state.size;

    let containerStyle;
    if (this.props.position === 'left' || this.props.position === 'right') {
      containerStyle = {
        width: size,
        minWidth: MINIMUM_LENGTH
      };
    } else if (this.props.position === 'top' || this.props.position === 'bottom') {
      containerStyle = {
        height: size,
        minHeight: MINIMUM_LENGTH
      };
    }

    return _reactForAtom.React.createElement(
      'div',
      { className: 'nuclide-workspace-views-panel' },
      _reactForAtom.React.createElement(
        'div',
        {
          className: `nuclide-ui-panel-component ${this.props.position}`,
          style: containerStyle },
        _reactForAtom.React.createElement('div', { className: `nuclide-ui-panel-component-resize-handle ${this.props.position}`,
          ref: 'handle',
          onMouseDown: this._handleMouseDown
        }),
        _reactForAtom.React.createElement(
          'div',
          { className: 'nuclide-ui-panel-component-content' },
          _reactForAtom.React.createElement((_View || _load_View()).View, { ref: 'child', item: this.props.paneContainer })
        ),
        resizeCursorOverlay
      )
    );
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
    if (event.buttons === 0) {
      // We missed the mouseup event. For some reason it happens on Windows
      this._handleMouseUp(event);
      return;
    }

    const containerEl = _reactForAtom.ReactDOM.findDOMNode(this);
    let size = 0;
    switch (this.props.position) {
      case 'left':
        size = event.pageX - containerEl.getBoundingClientRect().left;
        break;
      case 'top':
        size = event.pageY - containerEl.getBoundingClientRect().top;
        break;
      case 'bottom':
        size = containerEl.getBoundingClientRect().bottom - event.pageY;
        break;
      case 'right':
        size = containerEl.getBoundingClientRect().right - event.pageX;
        break;
    }
    this._updateSize(size);
  }

  _handleMouseUp(event) {
    if (this._resizeSubscriptions) {
      this._resizeSubscriptions.dispose();
    }
    this.setState({ isResizing: false });
  }

  // Whether this is width or height depends on the orientation of this panel.
  _updateSize(newSize) {
    this.setState({ size: newSize });
    this.props.onResize.call(null, newSize);
  }

  _getInitialSize() {
    let initialSize;

    if (this.props.initialSize != null) {
      initialSize = this.props.initialSize;
    } else {
      // The item may not have been activated yet. If that's the case, just use the first item.
      const activePaneItem = this.props.paneContainer.getActivePaneItem() || this.props.paneContainer.getPaneItems()[0];
      if (activePaneItem != null) {
        initialSize = getPreferredInitialSize(activePaneItem, this.props.position);
      }
    }
    return initialSize == null ? DEFAULT_INITIAL_SIZE : initialSize;
  }
}

exports.PanelComponent = PanelComponent;
PanelComponent.defaultProps = {
  onResize: width => {}
};
function getPreferredInitialSize(item, position) {
  switch (position) {
    case 'top':
    case 'bottom':
      return typeof item.getPreferredInitialHeight === 'function' ? item.getPreferredInitialHeight() : null;
    case 'left':
    case 'right':
      return typeof item.getPreferredInitialWidth === 'function' ? item.getPreferredInitialWidth() : null;
    default:
      throw new Error(`Invalid position: ${position}`);
  }
}