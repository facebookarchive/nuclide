"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DragResizeContainer = void 0;

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class DragResizeContainer extends React.Component {
  constructor(props) {
    super(props);
    this._resizeStarts = new _RxMin.Subject();
    this.state = {
      height: null,
      isDragging: false,
      lastMouseDown: 0
    };
  }

  componentDidMount() {
    const el = (0, _nullthrows().default)(this._node);
    this._disposables = new (_UniversalDisposable().default)(this._resizeStarts.switchMap(startEvent => {
      // Only fire on primary mouse button
      if (startEvent.button !== 0) {
        return _RxMin.Observable.empty();
      } // Abort everything if double click


      const now = Date.now();

      if (now - this.state.lastMouseDown < 500) {
        this.setState({
          height: null,
          isDragging: false,
          lastMouseDown: now
        });
        return _RxMin.Observable.empty();
      }

      this.setState({
        isDragging: true,
        lastMouseDown: now
      });
      const startY = startEvent.pageY;
      const startHeight = el.getBoundingClientRect().height;
      return _RxMin.Observable.fromEvent(document, 'mousemove').takeUntil(_RxMin.Observable.fromEvent(document, 'mouseup')).map(event => {
        const change = event.pageY - startY;
        return startHeight + change;
      }).do({
        complete: () => this.setState({
          isDragging: false
        })
      });
    }).subscribe(height => this.setState({
      height
    })), atom.commands.add(el, 'resize-container:reset-height', () => this.setState({
      height: null
    })), atom.contextMenu.add({
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
    const {
      height,
      isDragging
    } = this.state;
    const style = {};

    if (height == null) {
      style.maxHeight = '20vh';
    } else {
      style.height = height;
    }

    return React.createElement("div", {
      className: "nuclide-ui-drag-resize-container",
      style: style,
      ref: node => this._node = node
    }, this.props.children, React.createElement("div", {
      className: "nuclide-ui-drag-resize-container-handle",
      onMouseDown: event => this._resizeStarts.next(event)
    }, React.createElement("div", {
      className: "nuclide-ui-drag-resize-container-handle-line"
    }), isDragging ? React.createElement("div", {
      className: "nuclide-ui-drag-resize-container-handle-overlay"
    }) : null));
  }

}

exports.DragResizeContainer = DragResizeContainer;