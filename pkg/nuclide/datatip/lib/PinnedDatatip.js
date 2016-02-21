Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DatatipComponent = require('./DatatipComponent');

var LINE_END_MARGIN = 20;

var _mouseMove$ = undefined;
function documentMouseMove$() {
  if (_mouseMove$ == null) {
    _mouseMove$ = _rx2['default'].Observable.fromEvent(document, 'mousemove');
  }
  return _mouseMove$;
}

var _mouseUp$ = undefined;
function documentMouseUp$() {
  if (_mouseUp$ == null) {
    _mouseUp$ = _rx2['default'].Observable.fromEvent(document, 'mouseup');
  }
  return _mouseUp$;
}

var PinnedDatatip = (function () {
  function PinnedDatatip(datatip, editor, onDispose) {
    var _this = this;

    _classCallCheck(this, PinnedDatatip);

    var range = datatip.range;
    var component = datatip.component;

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(new _atom.Disposable(function () {
      return onDispose(_this);
    }));
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
    this._subscriptions.add(new _atom.Disposable(function () {
      _this._hostElement.removeEventListener('mouseenter', _this._boundHandleMouseEnter);
      _this._hostElement.removeEventListener('mouseleave', _this._boundHandleMouseLeave);
    }));
    this._mouseUpTimeout = null;
    this._offset = { x: 0, y: 0 };
    this._isDragging = false;
    this._dragOrigin = null;
    this._isHovering = false;
    this.render();
  }

  _createClass(PinnedDatatip, [{
    key: 'handleMouseEnter',
    value: function handleMouseEnter(event) {
      this._isHovering = true;
      this.render();
    }
  }, {
    key: 'handleMouseLeave',
    value: function handleMouseLeave(event) {
      this._isHovering = false;
      this.render();
    }
  }, {
    key: 'handleGlobalMouseMove',
    value: function handleGlobalMouseMove(event) {
      var evt = event;
      var _dragOrigin = this._dragOrigin;

      (0, _assert2['default'])(_dragOrigin);
      this._isDragging = true;
      this._offset = {
        x: evt.clientX - _dragOrigin.x,
        y: evt.clientY - _dragOrigin.y
      };
      this.render();
    }
  }, {
    key: 'handleGlobalMouseUp',
    value: function handleGlobalMouseUp() {
      var _this2 = this;

      // If the datatip was moved, push the effects of mouseUp to the next tick,
      // in order to allow cancelation of captured events (e.g. clicks on child components).
      this._mouseUpTimeout = setTimeout(function () {
        _this2._isDragging = false;
        _this2._dragOrigin = null;
        _this2._mouseUpTimeout = null;
        _this2._ensureMouseSubscriptionDisposed();
        _this2.render();
      }, 0);
    }
  }, {
    key: '_ensureMouseSubscriptionDisposed',
    value: function _ensureMouseSubscriptionDisposed() {
      if (this._mouseDisposable != null) {
        this._mouseDisposable.dispose();
        this._mouseDisposable = null;
      }
    }
  }, {
    key: 'handleMouseDown',
    value: function handleMouseDown(event) {
      var _this3 = this;

      var evt = event;
      this._dragOrigin = {
        x: evt.clientX - this._offset.x,
        y: evt.clientY - this._offset.y
      };
      this._ensureMouseSubscriptionDisposed();
      this._mouseDisposable = documentMouseMove$().takeUntil(documentMouseUp$()).subscribe(_rx2['default'].Observer.create(function (e) {
        _this3.handleGlobalMouseMove(e);
      }, function (error) {}, function () {
        _this3.handleGlobalMouseUp();
      }));
    }
  }, {
    key: 'handleCapturedClick',
    value: function handleCapturedClick(event) {
      if (this._isDragging) {
        event.stopPropagation();
      }
    }

    // Ensure positioning of the Datatip at the end of the current line.
  }, {
    key: '_updateHostElementPosition',
    value: function _updateHostElementPosition() {
      var _editor = this._editor;
      var _range = this._range;
      var _hostElement = this._hostElement;
      var _offset = this._offset;

      var charWidth = _editor.getDefaultCharWidth();
      var lineLength = _editor.getBuffer().getLines()[_range.start.row].length;
      _hostElement.style.display = 'block';
      _hostElement.style.top = -_editor.getLineHeightInPixels() + _offset.y + 'px';
      _hostElement.style.left = (lineLength - _range.end.column) * charWidth + LINE_END_MARGIN + _offset.x + 'px';
    }
  }, {
    key: 'render',
    value: function render() {
      var _editor = this._editor;
      var _range = this._range;
      var _component = this._component;
      var _hostElement = this._hostElement;
      var _isDragging = this._isDragging;
      var _isHovering = this._isHovering;

      this._updateHostElementPosition();
      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        _DatatipComponent.DatatipComponent,
        {
          action: _DatatipComponent.DATATIP_ACTIONS.CLOSE,
          actionTitle: 'Close this datatip',
          className: _isDragging ? 'nuclide-datatip-dragging' : '',
          onActionClick: this._boundDispose,
          onMouseDown: this._boundHandleMouseDown,
          onClickCapture: this._boundHandleCapturedClick },
        _component
      ), _hostElement);

      var rangeClassname = 'nuclide-datatip-highlight-region';
      if (_isHovering) {
        rangeClassname += ' nuclide-datatip-highlight-region-active';
      }

      if (this._marker == null) {
        var marker = _editor.markBufferRange(_range, { invalidate: 'never' });
        this._marker = marker;
        _editor.decorateMarker(marker, {
          type: 'overlay',
          position: 'head',
          item: this._hostElement
        });
        this._rangeDecoration = _editor.decorateMarker(marker, {
          type: 'highlight',
          'class': rangeClassname
        });
      } else {
        // `this._rangeDecoration` is guaranteed to exist iff `this._marker` exists.
        (0, _assert2['default'])(this._rangeDecoration);
        this._rangeDecoration.setProperties({
          type: 'highlight',
          'class': rangeClassname
        });
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._mouseUpTimeout != null) {
        clearTimeout(this._mouseUpTimeout);
      }
      if (this._marker != null) {
        this._marker.destroy();
      }
      if (this._mouseDisposable != null) {
        this._mouseDisposable.dispose();
      }
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._hostElement);
      this._hostElement.remove();
      this._subscriptions.dispose();
    }
  }]);

  return PinnedDatatip;
})();

exports.PinnedDatatip = PinnedDatatip;
//# sourceMappingURL=data:application/json;base64,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QUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0FBQ0QsVUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNqQztBQUNELDZCQUFTLHNCQUFzQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuRCxVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQTdNVSxhQUFhIiwiZmlsZSI6IlBpbm5lZERhdGF0aXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERhdGF0aXAsXG59IGZyb20gJy4uLy4uL2RhdGF0aXAtaW50ZXJmYWNlcyc7XG5cbnR5cGUgUG9zaXRpb24gPSB7XG4gIHg6IG51bWJlcjtcbiAgeTogbnVtYmVyO1xufVxuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0RhdGF0aXBDb21wb25lbnQsIERBVEFUSVBfQUNUSU9OU30gZnJvbSAnLi9EYXRhdGlwQ29tcG9uZW50JztcblxuY29uc3QgTElORV9FTkRfTUFSR0lOID0gMjA7XG5cbmxldCBfbW91c2VNb3ZlJDtcbmZ1bmN0aW9uIGRvY3VtZW50TW91c2VNb3ZlJCgpOiBSeC5PYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgaWYgKF9tb3VzZU1vdmUkID09IG51bGwpIHtcbiAgICBfbW91c2VNb3ZlJCA9IFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KGRvY3VtZW50LCAnbW91c2Vtb3ZlJyk7XG4gIH1cbiAgcmV0dXJuIF9tb3VzZU1vdmUkO1xufVxuXG5sZXQgX21vdXNlVXAkO1xuZnVuY3Rpb24gZG9jdW1lbnRNb3VzZVVwJCgpOiBSeC5PYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgaWYgKF9tb3VzZVVwJCA9PSBudWxsKSB7XG4gICAgX21vdXNlVXAkID0gUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoZG9jdW1lbnQsICdtb3VzZXVwJyk7XG4gIH1cbiAgcmV0dXJuIF9tb3VzZVVwJDtcbn1cblxuZXhwb3J0IGNsYXNzIFBpbm5lZERhdGF0aXAge1xuICBfYm91bmREaXNwb3NlOiBGdW5jdGlvbjtcbiAgX2JvdW5kSGFuZGxlTW91c2VEb3duOiBGdW5jdGlvbjtcbiAgX2JvdW5kSGFuZGxlTW91c2VFbnRlcjogRnVuY3Rpb247XG4gIF9ib3VuZEhhbmRsZU1vdXNlTGVhdmU6IEZ1bmN0aW9uO1xuICBfYm91bmRIYW5kbGVDYXB0dXJlZENsaWNrOiBGdW5jdGlvbjtcbiAgX21vdXNlVXBUaW1lb3V0OiA/bnVtYmVyO1xuICBfaG9zdEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfbWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF9yYW5nZURlY29yYXRpb246ID9hdG9tJERlY29yYXRpb247XG4gIF9tb3VzZURpc3Bvc2FibGU6ID9JRGlzcG9zYWJsZTtcbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3JhbmdlOiBhdG9tJFJhbmdlO1xuICBfY29tcG9uZW50OiBSZWFjdEVsZW1lbnQ7XG4gIF9lZGl0b3I6IFRleHRFZGl0b3I7XG4gIF9ob3N0RWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIF9ib3VuZERpc3Bvc2U6IEZ1bmN0aW9uO1xuICBfZHJhZ09yaWdpbjogP1Bvc2l0aW9uO1xuICBfaXNEcmFnZ2luZzogYm9vbGVhbjtcbiAgX29mZnNldDogUG9zaXRpb247XG4gIF9pc0hvdmVyaW5nOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRhdGF0aXA6IERhdGF0aXAsXG4gICAgZWRpdG9yOiBUZXh0RWRpdG9yLFxuICAgIG9uRGlzcG9zZTogKHBpbm5lZERhdGF0aXA6IFBpbm5lZERhdGF0aXApID0+IHZvaWQpIHtcbiAgICBjb25zdCB7XG4gICAgICByYW5nZSxcbiAgICAgIGNvbXBvbmVudCxcbiAgICB9ID0gZGF0YXRpcDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBvbkRpc3Bvc2UodGhpcykpKTtcbiAgICB0aGlzLl9yYW5nZSA9IHJhbmdlO1xuICAgIHRoaXMuX2NvbXBvbmVudCA9IGNvbXBvbmVudDtcbiAgICB0aGlzLl9lZGl0b3IgPSBlZGl0b3I7XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl9yYW5nZURlY29yYXRpb24gPSBudWxsO1xuICAgIHRoaXMuX2hvc3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQuY2xhc3NOYW1lID0gJ251Y2xpZGUtZGF0YXRpcC1vdmVybGF5JztcbiAgICB0aGlzLl9ib3VuZERpc3Bvc2UgPSB0aGlzLmRpc3Bvc2UuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRG93biA9IHRoaXMuaGFuZGxlTW91c2VEb3duLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUVudGVyID0gdGhpcy5oYW5kbGVNb3VzZUVudGVyLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUxlYXZlID0gdGhpcy5oYW5kbGVNb3VzZUxlYXZlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVDYXB0dXJlZENsaWNrID0gdGhpcy5oYW5kbGVDYXB0dXJlZENsaWNrLmJpbmQodGhpcyk7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VFbnRlcik7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5faG9zdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VFbnRlcik7XG4gICAgICB0aGlzLl9ob3N0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB9KSk7XG4gICAgdGhpcy5fbW91c2VVcFRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuX29mZnNldCA9IHt4OiAwLCB5OiAwfTtcbiAgICB0aGlzLl9pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fZHJhZ09yaWdpbiA9IG51bGw7XG4gICAgdGhpcy5faXNIb3ZlcmluZyA9IGZhbHNlO1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBoYW5kbGVNb3VzZUVudGVyKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNIb3ZlcmluZyA9IHRydWU7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIGhhbmRsZU1vdXNlTGVhdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIGhhbmRsZUdsb2JhbE1vdXNlTW92ZShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBldnQ6IE1vdXNlRXZlbnQgPSAoZXZlbnQ6IGFueSk7XG4gICAgY29uc3Qge19kcmFnT3JpZ2lufSA9IHRoaXM7XG4gICAgaW52YXJpYW50KF9kcmFnT3JpZ2luKTtcbiAgICB0aGlzLl9pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9vZmZzZXQgPSB7XG4gICAgICB4OiBldnQuY2xpZW50WCAtIF9kcmFnT3JpZ2luLngsXG4gICAgICB5OiBldnQuY2xpZW50WSAtIF9kcmFnT3JpZ2luLnksXG4gICAgfTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlR2xvYmFsTW91c2VVcCgpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgZGF0YXRpcCB3YXMgbW92ZWQsIHB1c2ggdGhlIGVmZmVjdHMgb2YgbW91c2VVcCB0byB0aGUgbmV4dCB0aWNrLFxuICAgIC8vIGluIG9yZGVyIHRvIGFsbG93IGNhbmNlbGF0aW9uIG9mIGNhcHR1cmVkIGV2ZW50cyAoZS5nLiBjbGlja3Mgb24gY2hpbGQgY29tcG9uZW50cykuXG4gICAgdGhpcy5fbW91c2VVcFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2RyYWdPcmlnaW4gPSBudWxsO1xuICAgICAgdGhpcy5fbW91c2VVcFRpbWVvdXQgPSBudWxsO1xuICAgICAgdGhpcy5fZW5zdXJlTW91c2VTdWJzY3JpcHRpb25EaXNwb3NlZCgpO1xuICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9LCAwKTtcbiAgfVxuXG4gIF9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tb3VzZURpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbW91c2VEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX21vdXNlRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTW91c2VEb3duKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV2dDogTW91c2VFdmVudCA9IChldmVudDogYW55KTtcbiAgICB0aGlzLl9kcmFnT3JpZ2luID0ge1xuICAgICAgeDogZXZ0LmNsaWVudFggLSB0aGlzLl9vZmZzZXQueCxcbiAgICAgIHk6IGV2dC5jbGllbnRZIC0gdGhpcy5fb2Zmc2V0LnksXG4gICAgfTtcbiAgICB0aGlzLl9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk7XG4gICAgdGhpcy5fbW91c2VEaXNwb3NhYmxlID1cbiAgICAgIGRvY3VtZW50TW91c2VNb3ZlJCgpLnRha2VVbnRpbChkb2N1bWVudE1vdXNlVXAkKCkpLnN1YnNjcmliZShSeC5PYnNlcnZlci5jcmVhdGUoXG4gICAgICAoZTogTW91c2VFdmVudCkgPT4ge3RoaXMuaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGUpO30sXG4gICAgICAoZXJyb3I6IGFueSkgPT4ge30sXG4gICAgICAoKSA9PiB7dGhpcy5oYW5kbGVHbG9iYWxNb3VzZVVwKCk7fSxcbiAgICApKTtcbiAgfVxuXG4gIGhhbmRsZUNhcHR1cmVkQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzRHJhZ2dpbmcpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVuc3VyZSBwb3NpdGlvbmluZyBvZiB0aGUgRGF0YXRpcCBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gIF91cGRhdGVIb3N0RWxlbWVudFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIF9lZGl0b3IsXG4gICAgICBfcmFuZ2UsXG4gICAgICBfaG9zdEVsZW1lbnQsXG4gICAgICBfb2Zmc2V0LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IGNoYXJXaWR0aCA9IF9lZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpO1xuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBfZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClbX3JhbmdlLnN0YXJ0LnJvd10ubGVuZ3RoO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBfaG9zdEVsZW1lbnQuc3R5bGUudG9wID0gLV9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKyBfb2Zmc2V0LnkgKyAncHgnO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS5sZWZ0ID1cbiAgICAgIChsaW5lTGVuZ3RoIC0gX3JhbmdlLmVuZC5jb2x1bW4pICogY2hhcldpZHRoICsgTElORV9FTkRfTUFSR0lOICsgX29mZnNldC54ICsgJ3B4JztcbiAgfVxuXG4gIHJlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBfZWRpdG9yLFxuICAgICAgX3JhbmdlLFxuICAgICAgX2NvbXBvbmVudCxcbiAgICAgIF9ob3N0RWxlbWVudCxcbiAgICAgIF9pc0RyYWdnaW5nLFxuICAgICAgX2lzSG92ZXJpbmcsXG4gICAgfSA9IHRoaXM7XG4gICAgdGhpcy5fdXBkYXRlSG9zdEVsZW1lbnRQb3NpdGlvbigpO1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEYXRhdGlwQ29tcG9uZW50XG4gICAgICAgIGFjdGlvbj17REFUQVRJUF9BQ1RJT05TLkNMT1NFfVxuICAgICAgICBhY3Rpb25UaXRsZT1cIkNsb3NlIHRoaXMgZGF0YXRpcFwiXG4gICAgICAgIGNsYXNzTmFtZT17X2lzRHJhZ2dpbmcgPyAnbnVjbGlkZS1kYXRhdGlwLWRyYWdnaW5nJyA6ICcnfVxuICAgICAgICBvbkFjdGlvbkNsaWNrPXt0aGlzLl9ib3VuZERpc3Bvc2V9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRG93bn1cbiAgICAgICAgb25DbGlja0NhcHR1cmU9e3RoaXMuX2JvdW5kSGFuZGxlQ2FwdHVyZWRDbGlja30+XG4gICAgICAgIHtfY29tcG9uZW50fVxuICAgICAgPC9EYXRhdGlwQ29tcG9uZW50PixcbiAgICAgIF9ob3N0RWxlbWVudCxcbiAgICApO1xuXG4gICAgbGV0IHJhbmdlQ2xhc3NuYW1lID0gJ251Y2xpZGUtZGF0YXRpcC1oaWdobGlnaHQtcmVnaW9uJztcbiAgICBpZiAoX2lzSG92ZXJpbmcpIHtcbiAgICAgIHJhbmdlQ2xhc3NuYW1lICs9ICcgbnVjbGlkZS1kYXRhdGlwLWhpZ2hsaWdodC1yZWdpb24tYWN0aXZlJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbWFya2VyID09IG51bGwpIHtcbiAgICAgIGNvbnN0IG1hcmtlcjogYXRvbSRNYXJrZXIgPSBfZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShfcmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgICB0aGlzLl9tYXJrZXIgPSBtYXJrZXI7XG4gICAgICBfZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgICBtYXJrZXIsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgICAgcG9zaXRpb246ICdoZWFkJyxcbiAgICAgICAgICBpdGVtOiB0aGlzLl9ob3N0RWxlbWVudCxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMuX3JhbmdlRGVjb3JhdGlvbiA9IF9lZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICAgIG1hcmtlcixcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICAgIGNsYXNzOiByYW5nZUNsYXNzbmFtZSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYHRoaXMuX3JhbmdlRGVjb3JhdGlvbmAgaXMgZ3VhcmFudGVlZCB0byBleGlzdCBpZmYgYHRoaXMuX21hcmtlcmAgZXhpc3RzLlxuICAgICAgaW52YXJpYW50KHRoaXMuX3JhbmdlRGVjb3JhdGlvbik7XG4gICAgICB0aGlzLl9yYW5nZURlY29yYXRpb24uc2V0UHJvcGVydGllcyh7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogcmFuZ2VDbGFzc25hbWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tb3VzZVVwVGltZW91dCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fbW91c2VVcFRpbWVvdXQpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbWFya2VyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX21hcmtlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tb3VzZURpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbW91c2VEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9ob3N0RWxlbWVudCk7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxufVxuIl19