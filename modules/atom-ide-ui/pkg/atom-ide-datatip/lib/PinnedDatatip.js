'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PinnedDatatip = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _DatatipComponent;

function _load_DatatipComponent() {
  return _DatatipComponent = require('./DatatipComponent');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LINE_END_MARGIN = 20; /**
                             * Copyright (c) 2017-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the BSD-style license found in the
                             * LICENSE file in the root directory of this source tree. An additional grant
                             * of patent rights can be found in the PATENTS file in the same directory.
                             *
                             * 
                             * @format
                             */

let _mouseMove$;
function documentMouseMove$() {
  if (_mouseMove$ == null) {
    _mouseMove$ = _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mousemove');
  }
  return _mouseMove$;
}

let _mouseUp$;
function documentMouseUp$() {
  if (_mouseUp$ == null) {
    _mouseUp$ = _rxjsBundlesRxMinJs.Observable.fromEvent(document, 'mouseup');
  }
  return _mouseUp$;
}

class PinnedDatatip {

  constructor(datatip, editor, params) {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._subscriptions.add(new _atom.Disposable(() => params.onDispose(this)));
    this._datatip = datatip;
    this._editor = editor;
    this._marker = null;
    this._rangeDecoration = null;
    this._hostElement = document.createElement('div');
    this._hostElement.className = 'datatip-overlay';
    this._boundDispose = this.dispose.bind(this);
    this._boundHandleMouseDown = this.handleMouseDown.bind(this);
    this._boundHandleMouseEnter = this.handleMouseEnter.bind(this);
    this._boundHandleMouseLeave = this.handleMouseLeave.bind(this);
    this._boundHandleCapturedClick = this.handleCapturedClick.bind(this);
    this._hostElement.addEventListener('mouseenter', this._boundHandleMouseEnter);
    this._hostElement.addEventListener('mouseleave', this._boundHandleMouseLeave);
    this._subscriptions.add(new _atom.Disposable(() => {
      this._hostElement.removeEventListener('mouseenter', this._boundHandleMouseEnter);
      this._hostElement.removeEventListener('mouseleave', this._boundHandleMouseLeave);
    }));
    this._mouseUpTimeout = null;
    this._offset = { x: 0, y: 0 };
    this._isDragging = false;
    this._dragOrigin = null;
    this._isHovering = false;
    this._hideDataTips = params.hideDataTips;
    this._position = params.position == null ? 'end-of-line' : params.position;
    this._showRangeHighlight = params.showRangeHighlight == null ? true : params.showRangeHighlight;
    this.render();
  }

  handleMouseEnter(event) {
    this._isHovering = true;
    this._hideDataTips();
  }

  handleMouseLeave(event) {
    this._isHovering = false;
  }

  isHovering() {
    return this._isHovering;
  }

  handleGlobalMouseMove(event) {
    const evt = event;
    const { _dragOrigin } = this;

    if (!_dragOrigin) {
      throw new Error('Invariant violation: "_dragOrigin"');
    }

    this._isDragging = true;
    this._offset = {
      x: evt.clientX - _dragOrigin.x,
      y: evt.clientY - _dragOrigin.y
    };
    this.render();
  }

  handleGlobalMouseUp() {
    // If the datatip was moved, push the effects of mouseUp to the next tick,
    // in order to allow cancellation of captured events (e.g. clicks on child components).
    this._mouseUpTimeout = setTimeout(() => {
      this._isDragging = false;
      this._dragOrigin = null;
      this._mouseUpTimeout = null;
      this._ensureMouseSubscriptionDisposed();
      this.render();
    }, 0);
  }

  _ensureMouseSubscriptionDisposed() {
    if (this._mouseSubscription != null) {
      this._mouseSubscription.unsubscribe();
      this._mouseSubscription = null;
    }
  }

  handleMouseDown(event) {
    const evt = event;
    this._dragOrigin = {
      x: evt.clientX - this._offset.x,
      y: evt.clientY - this._offset.y
    };
    this._ensureMouseSubscriptionDisposed();
    this._mouseSubscription = documentMouseMove$().takeUntil(documentMouseUp$()).subscribe(e => {
      this.handleGlobalMouseMove(e);
    }, error => {}, () => {
      this.handleGlobalMouseUp();
    });
  }

  handleCapturedClick(event) {
    if (this._isDragging) {
      event.stopPropagation();
    }
  }

  // Update the position of the pinned datatip.
  _updateHostElementPosition() {
    const { _editor, _datatip, _hostElement, _offset, _position } = this;
    const { range } = _datatip;
    _hostElement.style.display = 'block';
    switch (_position) {
      case 'end-of-line':
        const charWidth = _editor.getDefaultCharWidth();
        const lineLength = _editor.getBuffer().getLines()[range.start.row].length;
        _hostElement.style.top = -_editor.getLineHeightInPixels() + _offset.y + 'px';
        _hostElement.style.left = (lineLength - range.end.column) * charWidth + LINE_END_MARGIN + _offset.x + 'px';
        break;
      case 'above-range':
        _hostElement.style.bottom = _editor.getLineHeightInPixels() + _hostElement.clientHeight + _offset.y + 'px';
        _hostElement.style.left = _offset.x + 'px';
        break;
      default:
        _position;
        throw Error(`Unexpected PinnedDatatip position: ${this._position}`);
    }
  }

  render() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { _editor, _datatip, _hostElement, _isDragging, _isHovering } = _this;

      let rangeClassname = 'datatip-highlight-region';
      if (_isHovering) {
        rangeClassname += ' datatip-highlight-region-active';
      }

      if (_this._marker == null) {
        const marker = _editor.markBufferRange(_datatip.range, {
          invalidate: 'never'
        });
        _this._marker = marker;
        _editor.decorateMarker(marker, {
          type: 'overlay',
          position: 'head',
          item: _this._hostElement
        });
        if (_this._showRangeHighlight) {
          _this._rangeDecoration = _editor.decorateMarker(marker, {
            type: 'highlight',
            class: rangeClassname
          });
        }
        yield _editor.getElement().getNextUpdatePromise();
        // Guard against disposals during the await.
        if (marker.isDestroyed() || _editor.isDestroyed()) {
          return;
        }
      } else if (_this._rangeDecoration != null) {
        _this._rangeDecoration.setProperties({
          type: 'highlight',
          class: rangeClassname
        });
      }

      _reactDom.default.render(_react.createElement((_DatatipComponent || _load_DatatipComponent()).DatatipComponent, {
        action: (_DatatipComponent || _load_DatatipComponent()).DATATIP_ACTIONS.CLOSE,
        actionTitle: 'Close this datatip',
        className: (0, (_classnames || _load_classnames()).default)(_isDragging ? 'datatip-dragging' : '', 'datatip-pinned'),
        datatip: _datatip,
        onActionClick: _this._boundDispose,
        onMouseDown: _this._boundHandleMouseDown,
        onClickCapture: _this._boundHandleCapturedClick
      }), _hostElement);
      _this._updateHostElementPosition();
    })();
  }

  dispose() {
    if (this._mouseUpTimeout != null) {
      clearTimeout(this._mouseUpTimeout);
    }
    if (this._marker != null) {
      this._marker.destroy();
    }
    if (this._mouseSubscription != null) {
      this._mouseSubscription.unsubscribe();
    }
    _reactDom.default.unmountComponentAtNode(this._hostElement);
    this._hostElement.remove();
    this._subscriptions.dispose();
  }
}
exports.PinnedDatatip = PinnedDatatip;