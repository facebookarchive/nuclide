'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DragResizeContainer = undefined;

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

class DragResizeContainer extends _react.Component {

  constructor(props) {
    super(props);
    this._resizeStarts = new _rxjsBundlesRxMinJs.Subject();
    this.state = {
      height: null,
      isDragging: false,
      lastMouseDown: 0
    };
  }

  componentDidMount() {
    const el = (0, (_nullthrows || _load_nullthrows()).default)(this._node);

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._resizeStarts.switchMap(startEvent => {
      // Only fire on primary mouse button
      if (startEvent.button !== 0) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      // Abort everything if double click
      const now = Date.now();
      if (now - this.state.lastMouseDown < 500) {
        this.setState({
          height: null,
          isDragging: false,
          lastMouseDown: now
        });
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      this.setState({ isDragging: true, lastMouseDown: now });
      const startY = startEvent.pageY;
      const startHeight = el.getBoundingClientRect().height;
      return _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mousemove').takeUntil(_rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mouseup')).map(event => {
        const change = event.pageY - startY;
        return startHeight + change;
      }).do({
        complete: () => this.setState({ isDragging: false })
      });
    }).subscribe(height => this.setState({ height })), atom.commands.add(el, 'resize-container:reset-height', () => this.setState({ height: null })), atom.contextMenu.add({
      '.nuclide-ui-drag-resize-container': [{
        label: 'Reset Height',
        command: 'resize-container:reset-height'
      }]
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  render() {
    const { height, isDragging } = this.state;
    const style = {};
    if (height == null) {
      style.maxHeight = '20vh';
    } else {
      style.height = height;
    }

    return _react.createElement(
      'div',
      {
        className: 'nuclide-ui-drag-resize-container',
        style: style,
        ref: node => this._node = node },
      this.props.children,
      _react.createElement(
        'div',
        {
          className: 'nuclide-ui-drag-resize-container-handle',
          onMouseDown: event => this._resizeStarts.next(event) },
        _react.createElement('div', { className: 'nuclide-ui-drag-resize-container-handle-line' }),
        isDragging ? _react.createElement('div', { className: 'nuclide-ui-drag-resize-container-handle-overlay' }) : null
      )
    );
  }
}
exports.DragResizeContainer = DragResizeContainer;