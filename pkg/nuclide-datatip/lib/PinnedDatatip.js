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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _DatatipComponent = require('./DatatipComponent');

var LINE_END_MARGIN = 20;

var _mouseMove$ = undefined;
function documentMouseMove$() {
  if (_mouseMove$ == null) {
    _mouseMove$ = _reactivexRxjs2['default'].Observable.fromEvent(document, 'mousemove');
  }
  return _mouseMove$;
}

var _mouseUp$ = undefined;
function documentMouseUp$() {
  if (_mouseUp$ == null) {
    _mouseUp$ = _reactivexRxjs2['default'].Observable.fromEvent(document, 'mouseup');
  }
  return _mouseUp$;
}

var PinnedDatatip = (function () {
  function PinnedDatatip(datatip, editor, onDispose) {
    var _this = this;

    _classCallCheck(this, PinnedDatatip);

    var component = datatip.component;
    var range = datatip.range;

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
      if (this._mouseSubscription != null) {
        this._mouseSubscription.unsubscribe();
        this._mouseSubscription = null;
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
      this._mouseSubscription = documentMouseMove$().takeUntil(documentMouseUp$()).subscribe(function (e) {
        _this3.handleGlobalMouseMove(e);
      }, function (error) {}, function () {
        _this3.handleGlobalMouseUp();
      });
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
      var ProvidedComponent = this._component;
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
        _reactForAtom.React.createElement(ProvidedComponent, null)
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
      if (this._mouseSubscription != null) {
        this._mouseSubscription.unsubscribe();
      }
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._hostElement);
      this._hostElement.remove();
      this._subscriptions.dispose();
    }
  }]);

  return PinnedDatatip;
})();

exports.PinnedDatatip = PinnedDatatip;
//# sourceMappingURL=data:application/json;base64,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ZUFBZSxDQUFDLENBQUM7T0FDcEM7QUFDRCxVQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxFQUFFO0FBQ3hCLFlBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDeEI7QUFDRCxVQUFJLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7QUFDbkMsWUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3ZDO0FBQ0QsNkJBQVMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25ELFVBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDM0IsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBN01VLGFBQWEiLCJmaWxlIjoiUGlubmVkRGF0YXRpcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcCxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuXG50eXBlIFBvc2l0aW9uID0ge1xuICB4OiBudW1iZXI7XG4gIHk6IG51bWJlcjtcbn07XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0RhdGF0aXBDb21wb25lbnQsIERBVEFUSVBfQUNUSU9OU30gZnJvbSAnLi9EYXRhdGlwQ29tcG9uZW50JztcblxuY29uc3QgTElORV9FTkRfTUFSR0lOID0gMjA7XG5cbmxldCBfbW91c2VNb3ZlJDtcbmZ1bmN0aW9uIGRvY3VtZW50TW91c2VNb3ZlJCgpOiBSeC5PYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgaWYgKF9tb3VzZU1vdmUkID09IG51bGwpIHtcbiAgICBfbW91c2VNb3ZlJCA9IFJ4Lk9ic2VydmFibGUuZnJvbUV2ZW50KGRvY3VtZW50LCAnbW91c2Vtb3ZlJyk7XG4gIH1cbiAgcmV0dXJuIF9tb3VzZU1vdmUkO1xufVxuXG5sZXQgX21vdXNlVXAkO1xuZnVuY3Rpb24gZG9jdW1lbnRNb3VzZVVwJCgpOiBSeC5PYnNlcnZhYmxlPE1vdXNlRXZlbnQ+IHtcbiAgaWYgKF9tb3VzZVVwJCA9PSBudWxsKSB7XG4gICAgX21vdXNlVXAkID0gUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoZG9jdW1lbnQsICdtb3VzZXVwJyk7XG4gIH1cbiAgcmV0dXJuIF9tb3VzZVVwJDtcbn1cblxuZXhwb3J0IGNsYXNzIFBpbm5lZERhdGF0aXAge1xuICBfYm91bmREaXNwb3NlOiBGdW5jdGlvbjtcbiAgX2JvdW5kSGFuZGxlTW91c2VEb3duOiBGdW5jdGlvbjtcbiAgX2JvdW5kSGFuZGxlTW91c2VFbnRlcjogRnVuY3Rpb247XG4gIF9ib3VuZEhhbmRsZU1vdXNlTGVhdmU6IEZ1bmN0aW9uO1xuICBfYm91bmRIYW5kbGVDYXB0dXJlZENsaWNrOiBGdW5jdGlvbjtcbiAgX21vdXNlVXBUaW1lb3V0OiA/bnVtYmVyO1xuICBfaG9zdEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfbWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF9yYW5nZURlY29yYXRpb246ID9hdG9tJERlY29yYXRpb247XG4gIF9tb3VzZVN1YnNjcmlwdGlvbjogP3J4JElTdWJzY3JpcHRpb247XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9yYW5nZTogYXRvbSRSYW5nZTtcbiAgX2NvbXBvbmVudDogUmVhY3RDbGFzcztcbiAgX2VkaXRvcjogVGV4dEVkaXRvcjtcbiAgX2hvc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX2JvdW5kRGlzcG9zZTogRnVuY3Rpb247XG4gIF9kcmFnT3JpZ2luOiA/UG9zaXRpb247XG4gIF9pc0RyYWdnaW5nOiBib29sZWFuO1xuICBfb2Zmc2V0OiBQb3NpdGlvbjtcbiAgX2lzSG92ZXJpbmc6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGF0YXRpcDogRGF0YXRpcCxcbiAgICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gICAgb25EaXNwb3NlOiAocGlubmVkRGF0YXRpcDogUGlubmVkRGF0YXRpcCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IHtcbiAgICAgIGNvbXBvbmVudCxcbiAgICAgIHJhbmdlLFxuICAgIH0gPSBkYXRhdGlwO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IG9uRGlzcG9zZSh0aGlzKSkpO1xuICAgIHRoaXMuX3JhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5fY29tcG9uZW50ID0gY29tcG9uZW50O1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX3JhbmdlRGVjb3JhdGlvbiA9IG51bGw7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5jbGFzc05hbWUgPSAnbnVjbGlkZS1kYXRhdGlwLW92ZXJsYXknO1xuICAgIHRoaXMuX2JvdW5kRGlzcG9zZSA9IHRoaXMuZGlzcG9zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VEb3duID0gdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRW50ZXIgPSB0aGlzLmhhbmRsZU1vdXNlRW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlTGVhdmUgPSB0aGlzLmhhbmRsZU1vdXNlTGVhdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZUNhcHR1cmVkQ2xpY2sgPSB0aGlzLmhhbmRsZUNhcHR1cmVkQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUVudGVyKTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9ob3N0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUVudGVyKTtcbiAgICAgIHRoaXMuX2hvc3RFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pKTtcbiAgICB0aGlzLl9tb3VzZVVwVGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5fb2Zmc2V0ID0ge3g6IDAsIHk6IDB9O1xuICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9kcmFnT3JpZ2luID0gbnVsbDtcbiAgICB0aGlzLl9pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIGhhbmRsZU1vdXNlRW50ZXIoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlTW91c2VMZWF2ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV2dDogTW91c2VFdmVudCA9IChldmVudDogYW55KTtcbiAgICBjb25zdCB7X2RyYWdPcmlnaW59ID0gdGhpcztcbiAgICBpbnZhcmlhbnQoX2RyYWdPcmlnaW4pO1xuICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSB0cnVlO1xuICAgIHRoaXMuX29mZnNldCA9IHtcbiAgICAgIHg6IGV2dC5jbGllbnRYIC0gX2RyYWdPcmlnaW4ueCxcbiAgICAgIHk6IGV2dC5jbGllbnRZIC0gX2RyYWdPcmlnaW4ueSxcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBoYW5kbGVHbG9iYWxNb3VzZVVwKCk6IHZvaWQge1xuICAgIC8vIElmIHRoZSBkYXRhdGlwIHdhcyBtb3ZlZCwgcHVzaCB0aGUgZWZmZWN0cyBvZiBtb3VzZVVwIHRvIHRoZSBuZXh0IHRpY2ssXG4gICAgLy8gaW4gb3JkZXIgdG8gYWxsb3cgY2FuY2VsYXRpb24gb2YgY2FwdHVyZWQgZXZlbnRzIChlLmcuIGNsaWNrcyBvbiBjaGlsZCBjb21wb25lbnRzKS5cbiAgICB0aGlzLl9tb3VzZVVwVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5faXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fZHJhZ09yaWdpbiA9IG51bGw7XG4gICAgICB0aGlzLl9tb3VzZVVwVGltZW91dCA9IG51bGw7XG4gICAgICB0aGlzLl9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgX2Vuc3VyZU1vdXNlU3Vic2NyaXB0aW9uRGlzcG9zZWQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21vdXNlU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX21vdXNlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgICB0aGlzLl9tb3VzZVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlTW91c2VEb3duKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV2dDogTW91c2VFdmVudCA9IChldmVudDogYW55KTtcbiAgICB0aGlzLl9kcmFnT3JpZ2luID0ge1xuICAgICAgeDogZXZ0LmNsaWVudFggLSB0aGlzLl9vZmZzZXQueCxcbiAgICAgIHk6IGV2dC5jbGllbnRZIC0gdGhpcy5fb2Zmc2V0LnksXG4gICAgfTtcbiAgICB0aGlzLl9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk7XG4gICAgdGhpcy5fbW91c2VTdWJzY3JpcHRpb24gPVxuICAgICAgZG9jdW1lbnRNb3VzZU1vdmUkKCkudGFrZVVudGlsKGRvY3VtZW50TW91c2VVcCQoKSkuc3Vic2NyaWJlKFxuICAgICAgKGU6IE1vdXNlRXZlbnQpID0+IHt0aGlzLmhhbmRsZUdsb2JhbE1vdXNlTW92ZShlKTt9LFxuICAgICAgKGVycm9yOiBhbnkpID0+IHt9LFxuICAgICAgKCkgPT4ge3RoaXMuaGFuZGxlR2xvYmFsTW91c2VVcCgpO30sXG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZUNhcHR1cmVkQ2xpY2soZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2lzRHJhZ2dpbmcpIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEVuc3VyZSBwb3NpdGlvbmluZyBvZiB0aGUgRGF0YXRpcCBhdCB0aGUgZW5kIG9mIHRoZSBjdXJyZW50IGxpbmUuXG4gIF91cGRhdGVIb3N0RWxlbWVudFBvc2l0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIF9lZGl0b3IsXG4gICAgICBfcmFuZ2UsXG4gICAgICBfaG9zdEVsZW1lbnQsXG4gICAgICBfb2Zmc2V0LFxuICAgIH0gPSB0aGlzO1xuICAgIGNvbnN0IGNoYXJXaWR0aCA9IF9lZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpO1xuICAgIGNvbnN0IGxpbmVMZW5ndGggPSBfZWRpdG9yLmdldEJ1ZmZlcigpLmdldExpbmVzKClbX3JhbmdlLnN0YXJ0LnJvd10ubGVuZ3RoO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBfaG9zdEVsZW1lbnQuc3R5bGUudG9wID0gLV9lZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKCkgKyBfb2Zmc2V0LnkgKyAncHgnO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS5sZWZ0ID1cbiAgICAgIChsaW5lTGVuZ3RoIC0gX3JhbmdlLmVuZC5jb2x1bW4pICogY2hhcldpZHRoICsgTElORV9FTkRfTUFSR0lOICsgX29mZnNldC54ICsgJ3B4JztcbiAgfVxuXG4gIHJlbmRlcigpOiB2b2lkIHtcbiAgICBjb25zdCB7XG4gICAgICBfZWRpdG9yLFxuICAgICAgX3JhbmdlLFxuICAgICAgX2NvbXBvbmVudDogUHJvdmlkZWRDb21wb25lbnQsXG4gICAgICBfaG9zdEVsZW1lbnQsXG4gICAgICBfaXNEcmFnZ2luZyxcbiAgICAgIF9pc0hvdmVyaW5nLFxuICAgIH0gPSB0aGlzO1xuICAgIHRoaXMuX3VwZGF0ZUhvc3RFbGVtZW50UG9zaXRpb24oKTtcbiAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8RGF0YXRpcENvbXBvbmVudFxuICAgICAgICBhY3Rpb249e0RBVEFUSVBfQUNUSU9OUy5DTE9TRX1cbiAgICAgICAgYWN0aW9uVGl0bGU9XCJDbG9zZSB0aGlzIGRhdGF0aXBcIlxuICAgICAgICBjbGFzc05hbWU9e19pc0RyYWdnaW5nID8gJ251Y2xpZGUtZGF0YXRpcC1kcmFnZ2luZycgOiAnJ31cbiAgICAgICAgb25BY3Rpb25DbGljaz17dGhpcy5fYm91bmREaXNwb3NlfVxuICAgICAgICBvbk1vdXNlRG93bj17dGhpcy5fYm91bmRIYW5kbGVNb3VzZURvd259XG4gICAgICAgIG9uQ2xpY2tDYXB0dXJlPXt0aGlzLl9ib3VuZEhhbmRsZUNhcHR1cmVkQ2xpY2t9PlxuICAgICAgICA8UHJvdmlkZWRDb21wb25lbnQgLz5cbiAgICAgIDwvRGF0YXRpcENvbXBvbmVudD4sXG4gICAgICBfaG9zdEVsZW1lbnQsXG4gICAgKTtcblxuICAgIGxldCByYW5nZUNsYXNzbmFtZSA9ICdudWNsaWRlLWRhdGF0aXAtaGlnaGxpZ2h0LXJlZ2lvbic7XG4gICAgaWYgKF9pc0hvdmVyaW5nKSB7XG4gICAgICByYW5nZUNsYXNzbmFtZSArPSAnIG51Y2xpZGUtZGF0YXRpcC1oaWdobGlnaHQtcmVnaW9uLWFjdGl2ZSc7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21hcmtlciA9PSBudWxsKSB7XG4gICAgICBjb25zdCBtYXJrZXI6IGF0b20kTWFya2VyID0gX2VkaXRvci5tYXJrQnVmZmVyUmFuZ2UoX3JhbmdlLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pO1xuICAgICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuICAgICAgX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgICAgbWFya2VyLFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgICAgIHBvc2l0aW9uOiAnaGVhZCcsXG4gICAgICAgICAgaXRlbTogdGhpcy5faG9zdEVsZW1lbnQsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICB0aGlzLl9yYW5nZURlY29yYXRpb24gPSBfZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgICBtYXJrZXIsXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgICBjbGFzczogcmFuZ2VDbGFzc25hbWUsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGB0aGlzLl9yYW5nZURlY29yYXRpb25gIGlzIGd1YXJhbnRlZWQgdG8gZXhpc3QgaWZmIGB0aGlzLl9tYXJrZXJgIGV4aXN0cy5cbiAgICAgIGludmFyaWFudCh0aGlzLl9yYW5nZURlY29yYXRpb24pO1xuICAgICAgdGhpcy5fcmFuZ2VEZWNvcmF0aW9uLnNldFByb3BlcnRpZXMoe1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6IHJhbmdlQ2xhc3NuYW1lLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbW91c2VVcFRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX21vdXNlVXBUaW1lb3V0KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX21hcmtlciAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tYXJrZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbW91c2VTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbW91c2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcbiAgICB9XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9ob3N0RWxlbWVudCk7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cblxufVxuIl19