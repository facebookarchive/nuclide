/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* global getComputedStyle */

import {nextAnimationFrame} from '../../../commons-node/observable';
import {CompositeDisposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';

const MINIMUM_LENGTH = 100;

type DefaultProps = {
  initialLength: number,
  onResize: (width: number) => mixed,
};

type Props = {
  children?: mixed,
  dock: 'top' | 'right' | 'bottom' | 'left',
  initialLength: number,
  onResize: (width: number) => mixed,
};

type State = {
  isResizing: boolean,
  length: number,
};

/**
 * A container for centralizing the logic for making panels scrollable,
 * resizeable, dockable, etc.
 */
export class PanelComponent extends React.Component {
  _animationFrameRequestSubscription: ?rxjs$Subscription;
  _resizeSubscriptions: ?CompositeDisposable;

  props: Props;
  state: State;
  static defaultProps: DefaultProps = {
    initialLength: 200,
    onResize: width => {},
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      isResizing: false,
      length: this.props.initialLength,
    };

    // Bind main events to this object. _updateSize is only ever bound within these.
    (this: any)._handleMouseDown = this._handleMouseDown.bind(this);
    (this: any)._handleMouseMove = this._handleMouseMove.bind(this);
    (this: any)._handleMouseUp = this._handleMouseUp.bind(this);
  }

  componentDidMount() {
    // Note: This method is called via `requestAnimationFrame` rather than `process.nextTick` like
    // Atom's tree-view does because this does not have a guarantee a paint will have already
    // happened when `componentDidMount` gets called the first time.
    this._animationFrameRequestSubscription = nextAnimationFrame.subscribe(() => {
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
    const element = ReactDOM.findDOMNode(this);
    const isVisible = getComputedStyle(element).getPropertyValue('visibility');

    if (isVisible) {
      // Force a redraw so the scrollbars are styled correctly based on the theme
      element.style.display = 'none';
      element.offsetWidth;
      element.style.display = '';
    }
  }

  render(): React.Element<any> {
    // We create an overlay to always display the resize cursor while the user
    // is resizing the panel, even if their mouse leaves the handle.
    let resizeCursorOverlay = null;
    if (this.state.isResizing) {
      resizeCursorOverlay =
        <div className={`nuclide-ui-panel-component-resize-cursor-overlay ${this.props.dock}`} />;
    }

    let containerStyle;
    if (this.props.dock === 'left' || this.props.dock === 'right') {
      containerStyle = {
        width: this.state.length,
        minWidth: MINIMUM_LENGTH,
      };
    } else if (this.props.dock === 'top' || this.props.dock === 'bottom') {
      containerStyle = {
        height: this.state.length,
        minHeight: MINIMUM_LENGTH,
      };
    }

    const content = React.cloneElement(React.Children.only(this.props.children), {ref: 'child'});

    return (
      <div
        className={`nuclide-ui-panel-component ${this.props.dock}`}
        style={containerStyle}>
        <div className={`nuclide-ui-panel-component-resize-handle ${this.props.dock}`}
          ref="handle"
          onMouseDown={this._handleMouseDown}
        />
        <div className="nuclide-ui-panel-component-content">
          {content}
        </div>
        {resizeCursorOverlay}
      </div>
    );
  }

  _handleMouseDown(event: SyntheticMouseEvent): void {
    if (this._resizeSubscriptions != null) {
      this._resizeSubscriptions.dispose();
    }

    window.addEventListener('mousemove', this._handleMouseMove);
    window.addEventListener('mouseup', this._handleMouseUp);
    this._resizeSubscriptions = new CompositeDisposable(
      {dispose: () => { window.removeEventListener('mousemove', this._handleMouseMove); }},
      {dispose: () => { window.removeEventListener('mouseup', this._handleMouseUp); }},
    );

    this.setState({isResizing: true});
  }

  _handleMouseMove(event: SyntheticMouseEvent): void {
    if (event.buttons === 0) { // We missed the mouseup event. For some reason it happens on Windows
      this._handleMouseUp(event);
      return;
    }

    const containerEl = ReactDOM.findDOMNode(this);
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

  _handleMouseUp(event: SyntheticMouseEvent): void {
    if (this._resizeSubscriptions) {
      this._resizeSubscriptions.dispose();
    }
    this.setState({isResizing: false});
  }

  // Whether this is width or height depends on the orientation of this panel.
  _updateSize(newSize: number): void {
    this.setState({length: newSize});
    this.props.onResize.call(null, newSize);
  }
}
