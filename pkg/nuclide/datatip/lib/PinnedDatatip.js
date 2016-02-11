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
    this._hostElement.addEventListener('mouseenter', this._boundHandleMouseEnter);
    this._hostElement.addEventListener('mouseleave', this._boundHandleMouseLeave);
    this._subscriptions.add(new _atom.Disposable(function () {
      _this._hostElement.removeEventListener('mouseenter', _this._boundHandleMouseEnter);
      _this._hostElement.removeEventListener('mouseleave', _this._boundHandleMouseLeave);
    }));
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
      this._offset = {
        x: evt.clientX - _dragOrigin.x,
        y: evt.clientY - _dragOrigin.y
      };
      this.render();
    }
  }, {
    key: 'handleGlobalMouseUp',
    value: function handleGlobalMouseUp() {
      this._isDragging = false;
      this._dragOrigin = null;
      this._ensureMouseSubscriptionDisposed();
      this.render();
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
      var _this2 = this;

      var evt = event;
      this._isDragging = true;
      this._dragOrigin = {
        x: evt.clientX - this._offset.x,
        y: evt.clientY - this._offset.y
      };
      this._ensureMouseSubscriptionDisposed();
      this._mouseDisposable = documentMouseMove$().takeUntil(documentMouseUp$()).subscribe(_rx2['default'].Observer.create(function (e) {
        _this2.handleGlobalMouseMove(e);
      }, function (error) {}, function () {
        _this2.handleGlobalMouseUp();
      }));
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
          onMouseDown: this._boundHandleMouseDown },
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
//# sourceMappingURL=data:application/json;base64,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bCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEYXRhdGlwLFxufSBmcm9tICcuLi8uLi9kYXRhdGlwLWludGVyZmFjZXMnO1xuXG50eXBlIFBvc2l0aW9uID0ge1xuICB4OiBudW1iZXIsXG4gIHk6IG51bWJlcixcbn1cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHtEYXRhdGlwQ29tcG9uZW50LCBEQVRBVElQX0FDVElPTlN9IGZyb20gJy4vRGF0YXRpcENvbXBvbmVudCc7XG5cbmNvbnN0IExJTkVfRU5EX01BUkdJTiA9IDIwO1xuXG5sZXQgX21vdXNlTW92ZSQ7XG5mdW5jdGlvbiBkb2N1bWVudE1vdXNlTW92ZSQoKTogUnguT2JzZXJ2YWJsZTxNb3VzZUV2ZW50PiB7XG4gIGlmIChfbW91c2VNb3ZlJCA9PSBudWxsKSB7XG4gICAgX21vdXNlTW92ZSQgPSBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChkb2N1bWVudCwgJ21vdXNlbW92ZScpO1xuICB9XG4gIHJldHVybiBfbW91c2VNb3ZlJDtcbn1cblxubGV0IF9tb3VzZVVwJDtcbmZ1bmN0aW9uIGRvY3VtZW50TW91c2VVcCQoKTogUnguT2JzZXJ2YWJsZTxNb3VzZUV2ZW50PiB7XG4gIGlmIChfbW91c2VVcCQgPT0gbnVsbCkge1xuICAgIF9tb3VzZVVwJCA9IFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KGRvY3VtZW50LCAnbW91c2V1cCcpO1xuICB9XG4gIHJldHVybiBfbW91c2VVcCQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQaW5uZWREYXRhdGlwIHtcbiAgX2JvdW5kRGlzcG9zZTogRnVuY3Rpb247XG4gIF9ib3VuZEhhbmRsZU1vdXNlRG93bjogRnVuY3Rpb247XG4gIF9ib3VuZEhhbmRsZU1vdXNlRW50ZXI6IEZ1bmN0aW9uO1xuICBfYm91bmRIYW5kbGVNb3VzZUxlYXZlOiBGdW5jdGlvbjtcbiAgX2hvc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX21hcmtlcjogP2F0b20kTWFya2VyO1xuICBfcmFuZ2VEZWNvcmF0aW9uOiA/YXRvbSREZWNvcmF0aW9uO1xuICBfbW91c2VEaXNwb3NhYmxlOiA/SURpc3Bvc2FibGU7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9yYW5nZTogYXRvbSRSYW5nZTtcbiAgX2NvbXBvbmVudDogUmVhY3RFbGVtZW50O1xuICBfZWRpdG9yOiBUZXh0RWRpdG9yO1xuICBfaG9zdEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfYm91bmREaXNwb3NlOiBGdW5jdGlvbjtcbiAgX2RyYWdPcmlnaW46ID9Qb3NpdGlvbjtcbiAgX2lzRHJhZ2dpbmc6IGJvb2xlYW47XG4gIF9vZmZzZXQ6IFBvc2l0aW9uO1xuICBfaXNIb3ZlcmluZzogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBkYXRhdGlwOiBEYXRhdGlwLFxuICAgIGVkaXRvcjogVGV4dEVkaXRvcixcbiAgICBvbkRpc3Bvc2U6IChwaW5uZWREYXRhdGlwOiBQaW5uZWREYXRhdGlwKSA9PiB2b2lkKSB7XG4gICAgY29uc3Qge1xuICAgICAgcmFuZ2UsXG4gICAgICBjb21wb25lbnQsXG4gICAgfSA9IGRhdGF0aXA7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4gb25EaXNwb3NlKHRoaXMpKSk7XG4gICAgdGhpcy5fcmFuZ2UgPSByYW5nZTtcbiAgICB0aGlzLl9jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX21hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fcmFuZ2VEZWNvcmF0aW9uID0gbnVsbDtcbiAgICB0aGlzLl9ob3N0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2hvc3RFbGVtZW50LmNsYXNzTmFtZSA9ICdudWNsaWRlLWRhdGF0aXAtb3ZlcmxheSc7XG4gICAgdGhpcy5fYm91bmREaXNwb3NlID0gdGhpcy5kaXNwb3NlLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fYm91bmRIYW5kbGVNb3VzZURvd24gPSB0aGlzLmhhbmRsZU1vdXNlRG93bi5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VFbnRlciA9IHRoaXMuaGFuZGxlTW91c2VFbnRlci5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VMZWF2ZSA9IHRoaXMuaGFuZGxlTW91c2VMZWF2ZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2hvc3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRW50ZXIpO1xuICAgIHRoaXMuX2hvc3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX2hvc3RFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRW50ZXIpO1xuICAgICAgdGhpcy5faG9zdEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VMZWF2ZSk7XG4gICAgfSkpO1xuICAgIHRoaXMuX29mZnNldCA9IHt4OiAwLCB5OiAwfTtcbiAgICB0aGlzLl9pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgdGhpcy5fZHJhZ09yaWdpbiA9IG51bGw7XG4gICAgdGhpcy5faXNIb3ZlcmluZyA9IGZhbHNlO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIGhhbmRsZU1vdXNlRW50ZXIoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlTW91c2VMZWF2ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV2dDogTW91c2VFdmVudCA9IChldmVudDogYW55KTtcbiAgICBjb25zdCB7X2RyYWdPcmlnaW59ID0gdGhpcztcbiAgICBpbnZhcmlhbnQoX2RyYWdPcmlnaW4pO1xuICAgIHRoaXMuX29mZnNldCA9IHtcbiAgICAgIHg6IGV2dC5jbGllbnRYIC0gX2RyYWdPcmlnaW4ueCxcbiAgICAgIHk6IGV2dC5jbGllbnRZIC0gX2RyYWdPcmlnaW4ueSxcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBoYW5kbGVHbG9iYWxNb3VzZVVwKCk6IHZvaWQge1xuICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9kcmFnT3JpZ2luID0gbnVsbDtcbiAgICB0aGlzLl9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIF9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tb3VzZURpc3Bvc2FibGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbW91c2VEaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX21vdXNlRGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTW91c2VEb3duKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV2dDogTW91c2VFdmVudCA9IChldmVudDogYW55KTtcbiAgICB0aGlzLl9pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9kcmFnT3JpZ2luID0ge1xuICAgICAgeDogZXZ0LmNsaWVudFggLSB0aGlzLl9vZmZzZXQueCxcbiAgICAgIHk6IGV2dC5jbGllbnRZIC0gdGhpcy5fb2Zmc2V0LnksXG4gICAgfTtcbiAgICB0aGlzLl9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk7XG4gICAgdGhpcy5fbW91c2VEaXNwb3NhYmxlID1cbiAgICAgIGRvY3VtZW50TW91c2VNb3ZlJCgpLnRha2VVbnRpbChkb2N1bWVudE1vdXNlVXAkKCkpLnN1YnNjcmliZShSeC5PYnNlcnZlci5jcmVhdGUoXG4gICAgICAoZTogTW91c2VFdmVudCkgPT4ge3RoaXMuaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGUpO30sXG4gICAgICAoZXJyb3I6IGFueSkgPT4ge30sXG4gICAgICAoKSA9PiB7dGhpcy5oYW5kbGVHbG9iYWxNb3VzZVVwKCk7fSxcbiAgICApKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSBwb3NpdGlvbmluZyBvZiB0aGUgRGF0YXRpcCBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gIF91cGRhdGVIb3N0RWxlbWVudFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIF9lZGl0b3IsXG4gICAgICBfcmFuZ2UsXG4gICAgICBfaG9zdEVsZW1lbnQsXG4gICAgICBfb2Zmc2V0LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IGNoYXJXaWR0aCA9IF9lZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpO1xuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBfZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClbX3JhbmdlLnN0YXJ0LnJvd10ubGVuZ3RoO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBfaG9zdEVsZW1lbnQuc3R5bGUudG9wID0gLV9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKyBfb2Zmc2V0LnkgKyAncHgnO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS5sZWZ0ID1cbiAgICAgIChsaW5lTGVuZ3RoIC0gX3JhbmdlLmVuZC5jb2x1bW4pICogY2hhcldpZHRoICsgTElORV9FTkRfTUFSR0lOICsgX29mZnNldC54ICsgJ3B4JztcbiAgfVxuXG4gIHJlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBfZWRpdG9yLFxuICAgICAgX3JhbmdlLFxuICAgICAgX2NvbXBvbmVudCxcbiAgICAgIF9ob3N0RWxlbWVudCxcbiAgICAgIF9pc0RyYWdnaW5nLFxuICAgICAgX2lzSG92ZXJpbmcsXG4gICAgfSA9IHRoaXM7XG4gICAgdGhpcy5fdXBkYXRlSG9zdEVsZW1lbnRQb3NpdGlvbigpO1xuICAgIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxEYXRhdGlwQ29tcG9uZW50XG4gICAgICAgIGFjdGlvbj17REFUQVRJUF9BQ1RJT05TLkNMT1NFfVxuICAgICAgICBhY3Rpb25UaXRsZT1cIkNsb3NlIHRoaXMgZGF0YXRpcFwiXG4gICAgICAgIGNsYXNzTmFtZT17X2lzRHJhZ2dpbmcgPyAnbnVjbGlkZS1kYXRhdGlwLWRyYWdnaW5nJyA6ICcnfVxuICAgICAgICBvbkFjdGlvbkNsaWNrPXt0aGlzLl9ib3VuZERpc3Bvc2V9XG4gICAgICAgIG9uTW91c2VEb3duPXt0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRG93bn0+XG4gICAgICAgIHtfY29tcG9uZW50fVxuICAgICAgPC9EYXRhdGlwQ29tcG9uZW50PixcbiAgICAgIF9ob3N0RWxlbWVudCxcbiAgICApO1xuXG4gICAgbGV0IHJhbmdlQ2xhc3NuYW1lID0gJ251Y2xpZGUtZGF0YXRpcC1oaWdobGlnaHQtcmVnaW9uJztcbiAgICBpZiAoX2lzSG92ZXJpbmcpIHtcbiAgICAgIHJhbmdlQ2xhc3NuYW1lICs9ICcgbnVjbGlkZS1kYXRhdGlwLWhpZ2hsaWdodC1yZWdpb24tYWN0aXZlJztcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbWFya2VyID09IG51bGwpIHtcbiAgICAgIGNvbnN0IG1hcmtlcjogYXRvbSRNYXJrZXIgPSBfZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShfcmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgICB0aGlzLl9tYXJrZXIgPSBtYXJrZXI7XG4gICAgICBfZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgICBtYXJrZXIsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgICAgcG9zaXRpb246ICdoZWFkJyxcbiAgICAgICAgICBpdGVtOiB0aGlzLl9ob3N0RWxlbWVudCxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMuX3JhbmdlRGVjb3JhdGlvbiA9IF9lZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICAgIG1hcmtlcixcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICAgIGNsYXNzOiByYW5nZUNsYXNzbmFtZSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gYHRoaXMuX3JhbmdlRGVjb3JhdGlvbmAgaXMgZ3VhcmFudGVlZCB0byBleGlzdCBpZmYgYHRoaXMuX21hcmtlcmAgZXhpc3RzLlxuICAgICAgaW52YXJpYW50KHRoaXMuX3JhbmdlRGVjb3JhdGlvbik7XG4gICAgICB0aGlzLl9yYW5nZURlY29yYXRpb24uc2V0UHJvcGVydGllcyh7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogcmFuZ2VDbGFzc25hbWUsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tYXJrZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX21vdXNlRGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tb3VzZURpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2hvc3RFbGVtZW50KTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG4iXX0=