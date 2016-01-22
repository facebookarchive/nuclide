'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {CompositeDisposable} = require('atom');
const {React} = require('react-for-atom');

const {PropTypes} = React;

const MINIMUM_LENGTH = 100;

const emptyFunction = () => {};

/**
 * A container for centralizing the logic for making panels scrollable,
 * resizeable, dockable, etc.
 */
class PanelComponent extends React.Component {

  _resizeSubscriptions: CompositeDisposable;

  static propTypes = {
    children: PropTypes.element.isRequired,
    dock: PropTypes.oneOf(['left', 'bottom', 'right']).isRequired,
    initialLength: PropTypes.number.isRequired,
    onResize: PropTypes.func.isRequired,
    overflowX: PropTypes.string,
  };

  static defaultProps = {
    initialLength: 200,
    onResize: emptyFunction,
  };

  constructor(props: Object) {
    super(props);
    this.state = {
      isResizing: false,
      length: this.props.initialLength,
    };

    // Bind main events to this object. _updateSize is only ever bound within these.
    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleMouseDown = this._handleMouseDown.bind(this);
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
  }

  render(): ReactElement {
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
    } else if (this.props.dock === 'bottom') {
      containerStyle = {
        height: this.state.length,
        minHeight: MINIMUM_LENGTH,
      };
    }

    const content = React.cloneElement(
      React.Children.only(this.props.children),
      {ref: 'child'});

    const scrollerStyle = {};
    if (this.props.overflowX) {
      scrollerStyle.overflowX = this.props.overflowX;
    }

    return (
      <div
        className={`nuclide-ui-panel-component ${this.props.dock}`}
        ref="container"
        style={containerStyle}>
        <div className={`nuclide-ui-panel-component-resize-handle ${this.props.dock}`}
          ref="handle"
          onMouseDown={this._handleMouseDown}
          onDoubleClick={this._handleDoubleClick}
        />
        <div className="nuclide-ui-panel-component-scroller" style={scrollerStyle}>
          {content}
        </div>
        {resizeCursorOverlay}
      </div>
    );
  }

  /**
   * Returns the current resizable length.
   *
   * For panels docked left or right, the length is the width. For panels
   * docked top or bottom, it's the height.
   */
  getLength(): number {
    return this.state.length;
  }

  focus(): void {
    React.findDOMNode(this.refs['child']).focus();
  }

  getChildComponent(): ReactComponent {
    return this.refs.child;
  }

  _handleMouseDown(event: SyntheticMouseEvent): void {
    this._resizeSubscriptions = new CompositeDisposable();

    window.addEventListener('mousemove', this._handleMouseMove);
    this._resizeSubscriptions.add({
      dispose: () => window.removeEventListener('mousemove', this._handleMouseMove),
    });

    window.addEventListener('mouseup', this._handleMouseUp);
    this._resizeSubscriptions.add({
      dispose: () => window.removeEventListener('mouseup', this._handleMouseUp),
    });

    this.setState({isResizing: true});
  }

  _handleMouseMove(event: SyntheticMouseEvent): void {
    const containerEl = React.findDOMNode(this.refs['container']);
    let length = 0;
    if (this.props.dock === 'left') {
      length = event.pageX - containerEl.getBoundingClientRect().left;
    } else if (this.props.dock === 'bottom') {
      length = containerEl.getBoundingClientRect().bottom - event.pageY;
    } else if (this.props.dock === 'right') {
      length = containerEl.getBoundingClientRect().right - event.pageX;
    }
    this._updateSize(length);
  }

  _handleMouseUp(event: SyntheticMouseEvent): void {
    if (this._resizeSubscriptions) {
      this._resizeSubscriptions.dispose();
    }
    this.setState({isResizing: false});
  }

  /**
   * Resize the pane to fit its contents.
   */
  _handleDoubleClick(): void {
    // Reset size to 0 and read the content's natural width (after re-layout)
    // to determine the size to scale to.
    this.setState({length: 0});
    this.forceUpdate(() => {
      let length = 0;
      const childNode = React.findDOMNode(this.refs['child']);
      const handle = React.findDOMNode(this.refs['handle']);
      if (this.props.dock === 'left' || this.props.dock === 'right') {
        length = childNode.offsetWidth + handle.offsetWidth;
      } else if (this.props.dock === 'bottom') {
        length = childNode.offsetHeight + handle.offsetHeight;
      } else {
        throw new Error('unhandled dock');
      }
      this._updateSize(length);
    });
  }

  // Whether this is width or height depends on the orientation of this panel.
  _updateSize(newSize: number): void {
    this.setState({length: newSize});
    this.props.onResize.call(null, newSize);
  }
}

module.exports = PanelComponent;
