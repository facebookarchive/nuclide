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
exports.PinnedDatatip = undefined;

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DatatipComponent;

function _load_DatatipComponent() {
  return _DatatipComponent = require('./DatatipComponent');
}

const LINE_END_MARGIN = 20;

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

let PinnedDatatip = exports.PinnedDatatip = class PinnedDatatip {

  constructor(datatip, editor, onDispose) {
    const component = datatip.component,
          range = datatip.range;

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(new _atom.Disposable(() => onDispose(this)));
    this._range = range;
    this._component = component;
    this._editor = editor;
    this._marker = null;
    this._rangeDecoration = null;
    this._hostElement = document.createElement('div');
    this._hostElement.className = 'nuclide-datatip-overlay';
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
    this.render();
  }

  handleMouseEnter(event) {
    this._isHovering = true;
    this.render();
  }

  handleMouseLeave(event) {
    this._isHovering = false;
    this.render();
  }

  handleGlobalMouseMove(event) {
    const evt = event;
    const _dragOrigin = this._dragOrigin;

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
    // in order to allow cancelation of captured events (e.g. clicks on child components).
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

  // Ensure positioning of the Datatip at the end of the current line.
  _updateHostElementPosition() {
    const _editor = this._editor,
          _range = this._range,
          _hostElement = this._hostElement,
          _offset = this._offset;

    const charWidth = _editor.getDefaultCharWidth();
    const lineLength = _editor.getBuffer().getLines()[_range.start.row].length;
    _hostElement.style.display = 'block';
    _hostElement.style.top = -_editor.getLineHeightInPixels() + _offset.y + 'px';
    _hostElement.style.left = (lineLength - _range.end.column) * charWidth + LINE_END_MARGIN + _offset.x + 'px';
  }

  render() {
    const _editor = this._editor,
          _range = this._range,
          ProvidedComponent = this._component,
          _hostElement = this._hostElement,
          _isDragging = this._isDragging,
          _isHovering = this._isHovering;

    this._updateHostElementPosition();
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
      (_DatatipComponent || _load_DatatipComponent()).DatatipComponent,
      {
        action: (_DatatipComponent || _load_DatatipComponent()).DATATIP_ACTIONS.CLOSE,
        actionTitle: 'Close this datatip',
        className: _isDragging ? 'nuclide-datatip-dragging' : '',
        onActionClick: this._boundDispose,
        onMouseDown: this._boundHandleMouseDown,
        onClickCapture: this._boundHandleCapturedClick },
      _reactForAtom.React.createElement(ProvidedComponent, null)
    ), _hostElement);

    let rangeClassname = 'nuclide-datatip-highlight-region';
    if (_isHovering) {
      rangeClassname += ' nuclide-datatip-highlight-region-active';
    }

    if (this._marker == null) {
      const marker = _editor.markBufferRange(_range, { invalidate: 'never' });
      this._marker = marker;
      _editor.decorateMarker(marker, {
        type: 'overlay',
        position: 'head',
        item: this._hostElement
      });
      this._rangeDecoration = _editor.decorateMarker(marker, {
        type: 'highlight',
        class: rangeClassname
      });
    } else {
      // `this._rangeDecoration` is guaranteed to exist iff `this._marker` exists.
      if (!this._rangeDecoration) {
        throw new Error('Invariant violation: "this._rangeDecoration"');
      }

      this._rangeDecoration.setProperties({
        type: 'highlight',
        class: rangeClassname
      });
    }
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
    _reactForAtom.ReactDOM.unmountComponentAtNode(this._hostElement);
    this._hostElement.remove();
    this._subscriptions.dispose();
  }

};