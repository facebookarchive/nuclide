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

import UniversalDisposable from '../../../commons-node/UniversalDisposable';
import {nextAnimationFrame} from '../../../commons-node/observable';
import rectContainsPoint from '../../../commons-node/rectContainsPoint';
import {View} from '../../../nuclide-ui/View';
import {ToggleButton} from './ToggleButton';
import invariant from 'assert';
import classnames from 'classnames';
import {React, ReactDOM} from 'react-for-atom';
import {Observable} from 'rxjs';

const MINIMUM_SIZE = 100;
const DEFAULT_INITIAL_SIZE = 300;

type Position = 'top' | 'right' | 'bottom' | 'left';

type DefaultProps = {
  onResize: (width: number) => mixed,
};

type Props = {
  draggingItem: boolean, // TODO: Change to the actual item so that we can get the width.
  paneContainer: atom$PaneContainer,
  position: Position,
  initialSize: ?number,
  active: boolean,
  onResize: (width: number) => mixed,
};

type State = {
  resizing: boolean,
  shouldAnimate: boolean,
  showDropTarget: boolean,
  size: ?number,
};

/**
 * A container for centralizing the logic for making panels resizable.
 */
export class PanelComponent extends React.Component {
  _disposables: ?UniversalDisposable;
  _dropTargetDisposable: ?UniversalDisposable;
  _toggleButtonEl: ?HTMLElement;
  _resizeDisposable: ?UniversalDisposable;

  props: Props;
  state: State;
  static defaultProps: DefaultProps = {
    onResize: width => {},
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      resizing: false,
      size: this.props.initialSize,
      shouldAnimate: props.draggingItem,
      showDropTarget: false,
    };

    // Bind main events to this object. _updateSize is only ever bound within these.
    (this: any)._handleMouseDown = this._handleMouseDown.bind(this);
    (this: any)._handleMouseMove = this._handleMouseMove.bind(this);
    (this: any)._handleMouseUp = this._handleMouseUp.bind(this);
    (this: any)._handleDragLeave = this._handleDragLeave.bind(this);
    (this: any)._handleToggleButton = this._handleToggleButton.bind(this);
    (this: any)._revealDropTarget = this._revealDropTarget.bind(this);
  }

  componentDidMount(): void {
    this._disposables = new UniversalDisposable(
      // Note: This method is called via `requestAnimationFrame` rather than `process.nextTick` like
      // Atom's tree-view does because this does not have a guarantee a paint will have already
      // happened when `componentDidMount` gets called the first time.
      nextAnimationFrame.subscribe(() => { this._repaint(); }),
    );
  }

  componentWillUnmount() {
    if (this._resizeDisposable != null) {
      this._resizeDisposable.dispose();
    }
    if (this._dropTargetDisposable != null) {
      this._dropTargetDisposable.dispose();
    }
    invariant(this._disposables != null);
    this._disposables.dispose();
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

  componentWillReceiveProps(nextProps: Props): void {
    // Update the `shouldAnimate` state. This needs to be written to the DOM before updating the
    // class that changes the animated property. Normally we'd have to defer the class change a
    // frame to ensure the property is animated (or not) appropriately, however we luck out in this
    // case because the drag start always happens before the item is dragged into the toggle button.
    if (nextProps.active !== this.props.active) {
      // Never animate toggling visiblity...
      this.setState({shouldAnimate: false});
    } else if (!nextProps.active && nextProps.draggingItem && !this.props.draggingItem) {
      // ...but do animate if you start dragging while the panel is hidden.
      this.setState({shouldAnimate: true});
    }
  }

  render(): React.Element<any> {
    const size = Math.max(
      MINIMUM_SIZE,
      this.state.size == null ? this._getInitialSize() : this.state.size,
    );
    const open = this.props.active || this.state.showDropTarget;
    const widthOrHeight =
      this.props.position === 'left' || this.props.position === 'right' ? 'width' : 'height';

    const wrapperClassName = classnames(
      'nuclide-workspace-views-panel-wrapper',
      this.props.position,
      {
        'nuclide-panel-active': this.props.active,
      },
    );
    const className = classnames('nuclide-workspace-views-panel', this.props.position);
    const maskClassName = classnames(
      'nuclide-workspace-views-panel-mask',
      {'nuclide-panel-should-animate': this.state.shouldAnimate},
    );

    // Obviously we need to render the contents if the panels open. But we also need to render them
    // if it's not open but animating.
    // TODO: Track whether animation is in progress and use that instead of `shouldAnimate`.
    const contents = open || this.state.shouldAnimate
      ? (
        // The content needs to maintain a constant size regardless of the mask size.
        <div className={className} style={{[widthOrHeight]: size}}>
          <div
            className={`nuclide-workspace-views-panel-resize-handle ${this.props.position}`}
            onMouseDown={this._handleMouseDown}
          />
          <div className="nuclide-workspace-views-panel-content">
            <View item={this.props.paneContainer} />
          </div>
          <ResizeCursorOverlay position={this.props.position} resizing={this.state.resizing} />
        </div>
      )
      : null;

    return (
      <div className={wrapperClassName}>
        {/* We need to change the size of the mask. */}
        <div className={maskClassName} style={{[widthOrHeight]: open ? size : 0}}>
          {contents}
        </div>
        {/*
          The toggle button must be rendered outside the mask because (1) it shouldn't be masked and
          (2) if we made the mask larger to avoid masking it, the mask would block mouse events.
        */}
        <ToggleButton
          ref={this._handleToggleButton}
          onDragEnter={this._revealDropTarget}
          visible={this.props.draggingItem && !open}
          position={this.props.position}
        />
      </div>
    );
  }

  _revealDropTarget(): void {
    if (this._dropTargetDisposable != null) {
      this._dropTargetDisposable.dispose();
    }
    this.setState({showDropTarget: true});
    this._dropTargetDisposable = new UniversalDisposable(
      // When we start showing the drop target, listen for when the mouse leaves in order to hide
      // it. We should be able to use `onDragLeave` but for some reason, that's only being triggered
      // sporadically with the correct target.
      Observable.merge(
        Observable.fromEvent(window, 'drag')
          .filter(event => {
            const toggleButtonEl = this._toggleButtonEl;
            const el = ReactDOM.findDOMNode(this);
            if (el == null || toggleButtonEl == null) { return false; }
            const panelArea = el.getBoundingClientRect();
            const toggleButtonArea = toggleButtonEl.getBoundingClientRect();
            const mousePosition = {x: event.pageX, y: event.pageY};
            return !rectContainsPoint(panelArea, mousePosition)
              && !rectContainsPoint(toggleButtonArea, mousePosition);
          }),
        Observable.fromEvent(window, 'dragend'),
      )
        .subscribe(this._handleDragLeave),
    );
  }

  _handleToggleButton(toggleButton: ?ToggleButton): void {
    this._toggleButtonEl = toggleButton == null ? null : ReactDOM.findDOMNode(toggleButton);
  }

  _handleDragLeave(): void {
    if (this._dropTargetDisposable != null) {
      this._dropTargetDisposable.dispose();
      this._dropTargetDisposable = null;
    }
    this.setState({showDropTarget: false});
  }

  _handleMouseDown(event: SyntheticMouseEvent): void {
    if (this._resizeDisposable != null) {
      this._resizeDisposable.dispose();
    }
    this._resizeDisposable = new UniversalDisposable(
      Observable.fromEvent(window, 'mousemove').subscribe(this._handleMouseMove),
      Observable.fromEvent(window, 'mouseup').subscribe(this._handleMouseUp),
    );
    this.setState({resizing: true});
  }

  _handleMouseMove(event: SyntheticMouseEvent): void {
    if (event.buttons === 0) { // We missed the mouseup event. For some reason it happens on Windows
      this._handleMouseUp(event);
      return;
    }

    const containerEl = ReactDOM.findDOMNode(this);
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

  _handleMouseUp(event: SyntheticMouseEvent): void {
    if (this._resizeDisposable) {
      this._resizeDisposable.dispose();
    }
    this.setState({resizing: false});
  }

  // Whether this is width or height depends on the orientation of this panel.
  _updateSize(newSize: number): void {
    this.setState({size: newSize});
    this.props.onResize.call(null, newSize);
  }

  _getInitialSize(): number {
    let initialSize;

    if (this.props.initialSize != null) {
      initialSize = this.props.initialSize;
    } else {
      // The item may not have been activated yet. If that's the case, just use the first item.
      const activePaneItem =
        this.props.paneContainer.getActivePaneItem() || this.props.paneContainer.getPaneItems()[0];
      if (activePaneItem != null) {
        initialSize = getPreferredInitialSize(activePaneItem, this.props.position);
      }
    }
    return initialSize == null ? DEFAULT_INITIAL_SIZE : initialSize;
  }
}

function getPreferredInitialSize(item: Object, position: Position): ?number {
  switch (position) {
    case 'top':
    case 'bottom':
      return typeof item.getPreferredInitialHeight === 'function'
        ? item.getPreferredInitialHeight()
        : null;
    case 'left':
    case 'right':
      return typeof item.getPreferredInitialWidth === 'function'
        ? item.getPreferredInitialWidth()
        : null;
    default:
      throw new Error(`Invalid position: ${position}`);
  }
}

function ResizeCursorOverlay(props: {resizing: boolean, position: Position}): ?React.Element<any> {
  // We create an overlay to always display the resize cursor while the user is resizing the panel,
  // even if their mouse leaves the handle.
  return props.resizing
    ? <div className={`nuclide-workspace-views-panel-resize-cursor-overlay ${props.position}`} />
    : null;
}
