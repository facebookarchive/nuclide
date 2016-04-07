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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBpbm5lZERhdGF0aXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQW9COEMsTUFBTTs7NEJBSTdDLGdCQUFnQjs7a0JBQ1IsSUFBSTs7OztzQkFDRyxRQUFROzs7O2dDQUVrQixvQkFBb0I7O0FBRXBFLElBQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQzs7QUFFM0IsSUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixTQUFTLGtCQUFrQixHQUE4QjtBQUN2RCxNQUFJLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDdkIsZUFBVyxHQUFHLGdCQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0dBQzlEO0FBQ0QsU0FBTyxXQUFXLENBQUM7Q0FDcEI7O0FBRUQsSUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLFNBQVMsZ0JBQWdCLEdBQThCO0FBQ3JELE1BQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUNyQixhQUFTLEdBQUcsZ0JBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7R0FDMUQ7QUFDRCxTQUFPLFNBQVMsQ0FBQztDQUNsQjs7SUFFWSxhQUFhO0FBc0JiLFdBdEJBLGFBQWEsQ0F1QnRCLE9BQWdCLEVBQ2hCLE1BQWtCLEVBQ2xCLFNBQWlELEVBQUU7OzswQkF6QjFDLGFBQWE7O1FBMkJwQixLQUFLLEdBRUgsT0FBTyxDQUZULEtBQUs7UUFDTCxTQUFTLEdBQ1AsT0FBTyxDQURULFNBQVM7O0FBRVgsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxxQkFBZTthQUFNLFNBQVMsT0FBTTtLQUFBLENBQUMsQ0FBQyxDQUFDO0FBQy9ELFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsUUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLHlCQUF5QixDQUFDO0FBQ3hELFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFFBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9ELFFBQUksQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9ELFFBQUksQ0FBQyx5QkFBeUIsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JFLFFBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzlFLFFBQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQzlFLFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFlLFlBQU07QUFDM0MsWUFBSyxZQUFZLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLE1BQUssc0JBQXNCLENBQUMsQ0FBQztBQUNqRixZQUFLLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsTUFBSyxzQkFBc0IsQ0FBQyxDQUFDO0tBQ2xGLENBQUMsQ0FBQyxDQUFDO0FBQ0osUUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7QUFDNUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNmOztlQXhEVSxhQUFhOztXQTBEUiwwQkFBQyxLQUFpQixFQUFRO0FBQ3hDLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFZSwwQkFBQyxLQUFpQixFQUFRO0FBQ3hDLFVBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFb0IsK0JBQUMsS0FBWSxFQUFRO0FBQ3hDLFVBQU0sR0FBZSxHQUFJLEtBQUssQUFBTSxDQUFDO1VBQzlCLFdBQVcsR0FBSSxJQUFJLENBQW5CLFdBQVc7O0FBQ2xCLCtCQUFVLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxPQUFPLEdBQUc7QUFDYixTQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQztBQUM5QixTQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQztPQUMvQixDQUFDO0FBQ0YsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2Y7OztXQUVrQiwrQkFBUzs7Ozs7QUFHMUIsVUFBSSxDQUFDLGVBQWUsR0FBRyxVQUFVLENBQUMsWUFBTTtBQUN0QyxlQUFLLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDekIsZUFBSyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLGVBQUssZUFBZSxHQUFHLElBQUksQ0FBQztBQUM1QixlQUFLLGdDQUFnQyxFQUFFLENBQUM7QUFDeEMsZUFBSyxNQUFNLEVBQUUsQ0FBQztPQUNmLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDUDs7O1dBRStCLDRDQUFTO0FBQ3ZDLFVBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUNqQyxZQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEMsWUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQztPQUM5QjtLQUNGOzs7V0FFYyx5QkFBQyxLQUFZLEVBQVE7OztBQUNsQyxVQUFNLEdBQWUsR0FBSSxLQUFLLEFBQU0sQ0FBQztBQUNyQyxVQUFJLENBQUMsV0FBVyxHQUFHO0FBQ2pCLFNBQUMsRUFBRSxHQUFHLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMvQixTQUFDLEVBQUUsR0FBRyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDaEMsQ0FBQztBQUNGLFVBQUksQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxnQkFBZ0IsR0FDbkIsa0JBQWtCLEVBQUUsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxnQkFBRyxRQUFRLENBQUMsTUFBTSxDQUMvRSxVQUFDLENBQUMsRUFBaUI7QUFBQyxlQUFLLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO09BQUMsRUFDbkQsVUFBQyxLQUFLLEVBQVUsRUFBRSxFQUNsQixZQUFNO0FBQUMsZUFBSyxtQkFBbUIsRUFBRSxDQUFDO09BQUMsQ0FDcEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVrQiw2QkFBQyxLQUFxQixFQUFRO0FBQy9DLFVBQUksSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNwQixhQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7T0FDekI7S0FDRjs7Ozs7V0FHeUIsc0NBQVM7VUFFL0IsT0FBTyxHQUlMLElBQUksQ0FKTixPQUFPO1VBQ1AsTUFBTSxHQUdKLElBQUksQ0FITixNQUFNO1VBQ04sWUFBWSxHQUVWLElBQUksQ0FGTixZQUFZO1VBQ1osT0FBTyxHQUNMLElBQUksQ0FETixPQUFPOztBQUVULFVBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ2hELFVBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMzRSxrQkFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3JDLGtCQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0FBQzdFLGtCQUFZLENBQUMsS0FBSyxDQUFDLElBQUksR0FDckIsQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUEsR0FBSSxTQUFTLEdBQUcsZUFBZSxHQUFHLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQ3JGOzs7V0FFSyxrQkFBUztVQUVYLE9BQU8sR0FNTCxJQUFJLENBTk4sT0FBTztVQUNQLE1BQU0sR0FLSixJQUFJLENBTE4sTUFBTTtVQUNOLFVBQVUsR0FJUixJQUFJLENBSk4sVUFBVTtVQUNWLFlBQVksR0FHVixJQUFJLENBSE4sWUFBWTtVQUNaLFdBQVcsR0FFVCxJQUFJLENBRk4sV0FBVztVQUNYLFdBQVcsR0FDVCxJQUFJLENBRE4sV0FBVzs7QUFFYixVQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztBQUNsQyw2QkFBUyxNQUFNLENBQ2I7OztBQUNFLGdCQUFNLEVBQUUsa0NBQWdCLEtBQUssQUFBQztBQUM5QixxQkFBVyxFQUFDLG9CQUFvQjtBQUNoQyxtQkFBUyxFQUFFLFdBQVcsR0FBRywwQkFBMEIsR0FBRyxFQUFFLEFBQUM7QUFDekQsdUJBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxBQUFDO0FBQ2xDLHFCQUFXLEVBQUUsSUFBSSxDQUFDLHFCQUFxQixBQUFDO0FBQ3hDLHdCQUFjLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixBQUFDO1FBQzlDLFVBQVU7T0FDTSxFQUNuQixZQUFZLENBQ2IsQ0FBQzs7QUFFRixVQUFJLGNBQWMsR0FBRyxrQ0FBa0MsQ0FBQztBQUN4RCxVQUFJLFdBQVcsRUFBRTtBQUNmLHNCQUFjLElBQUksMENBQTBDLENBQUM7T0FDOUQ7O0FBRUQsVUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixZQUFNLE1BQW1CLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxVQUFVLEVBQUUsT0FBTyxFQUFDLENBQUMsQ0FBQztBQUNuRixZQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztBQUN0QixlQUFPLENBQUMsY0FBYyxDQUNwQixNQUFNLEVBQ047QUFDRSxjQUFJLEVBQUUsU0FBUztBQUNmLGtCQUFRLEVBQUUsTUFBTTtBQUNoQixjQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVk7U0FDeEIsQ0FDRixDQUFDO0FBQ0YsWUFBSSxDQUFDLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQzVDLE1BQU0sRUFDTjtBQUNFLGNBQUksRUFBRSxXQUFXO0FBQ2pCLG1CQUFPLGNBQWM7U0FDdEIsQ0FDRixDQUFDO09BQ0gsTUFBTTs7QUFFTCxpQ0FBVSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUNqQyxZQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDO0FBQ2xDLGNBQUksRUFBRSxXQUFXO0FBQ2pCLG1CQUFPLGNBQWM7U0FDdEIsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLElBQUksQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFFO0FBQ2hDLG9CQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO09BQ3BDO0FBQ0QsVUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtBQUN4QixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3hCO0FBQ0QsVUFBSSxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQ2pDLFlBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNqQztBQUNELDZCQUFTLHNCQUFzQixDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuRCxVQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzNCLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQTdNVSxhQUFhIiwiZmlsZSI6IlBpbm5lZERhdGF0aXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIERhdGF0aXAsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGF0YXRpcC1pbnRlcmZhY2VzJztcblxudHlwZSBQb3NpdGlvbiA9IHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7RGF0YXRpcENvbXBvbmVudCwgREFUQVRJUF9BQ1RJT05TfSBmcm9tICcuL0RhdGF0aXBDb21wb25lbnQnO1xuXG5jb25zdCBMSU5FX0VORF9NQVJHSU4gPSAyMDtcblxubGV0IF9tb3VzZU1vdmUkO1xuZnVuY3Rpb24gZG9jdW1lbnRNb3VzZU1vdmUkKCk6IFJ4Lk9ic2VydmFibGU8TW91c2VFdmVudD4ge1xuICBpZiAoX21vdXNlTW92ZSQgPT0gbnVsbCkge1xuICAgIF9tb3VzZU1vdmUkID0gUnguT2JzZXJ2YWJsZS5mcm9tRXZlbnQoZG9jdW1lbnQsICdtb3VzZW1vdmUnKTtcbiAgfVxuICByZXR1cm4gX21vdXNlTW92ZSQ7XG59XG5cbmxldCBfbW91c2VVcCQ7XG5mdW5jdGlvbiBkb2N1bWVudE1vdXNlVXAkKCk6IFJ4Lk9ic2VydmFibGU8TW91c2VFdmVudD4ge1xuICBpZiAoX21vdXNlVXAkID09IG51bGwpIHtcbiAgICBfbW91c2VVcCQgPSBSeC5PYnNlcnZhYmxlLmZyb21FdmVudChkb2N1bWVudCwgJ21vdXNldXAnKTtcbiAgfVxuICByZXR1cm4gX21vdXNlVXAkO1xufVxuXG5leHBvcnQgY2xhc3MgUGlubmVkRGF0YXRpcCB7XG4gIF9ib3VuZERpc3Bvc2U6IEZ1bmN0aW9uO1xuICBfYm91bmRIYW5kbGVNb3VzZURvd246IEZ1bmN0aW9uO1xuICBfYm91bmRIYW5kbGVNb3VzZUVudGVyOiBGdW5jdGlvbjtcbiAgX2JvdW5kSGFuZGxlTW91c2VMZWF2ZTogRnVuY3Rpb247XG4gIF9ib3VuZEhhbmRsZUNhcHR1cmVkQ2xpY2s6IEZ1bmN0aW9uO1xuICBfbW91c2VVcFRpbWVvdXQ6ID9udW1iZXI7XG4gIF9ob3N0RWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIF9tYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX3JhbmdlRGVjb3JhdGlvbjogP2F0b20kRGVjb3JhdGlvbjtcbiAgX21vdXNlRGlzcG9zYWJsZTogP0lEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfcmFuZ2U6IGF0b20kUmFuZ2U7XG4gIF9jb21wb25lbnQ6IFJlYWN0RWxlbWVudDtcbiAgX2VkaXRvcjogVGV4dEVkaXRvcjtcbiAgX2hvc3RFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX2JvdW5kRGlzcG9zZTogRnVuY3Rpb247XG4gIF9kcmFnT3JpZ2luOiA/UG9zaXRpb247XG4gIF9pc0RyYWdnaW5nOiBib29sZWFuO1xuICBfb2Zmc2V0OiBQb3NpdGlvbjtcbiAgX2lzSG92ZXJpbmc6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZGF0YXRpcDogRGF0YXRpcCxcbiAgICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gICAgb25EaXNwb3NlOiAocGlubmVkRGF0YXRpcDogUGlubmVkRGF0YXRpcCkgPT4gdm9pZCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHJhbmdlLFxuICAgICAgY29tcG9uZW50LFxuICAgIH0gPSBkYXRhdGlwO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IG9uRGlzcG9zZSh0aGlzKSkpO1xuICAgIHRoaXMuX3JhbmdlID0gcmFuZ2U7XG4gICAgdGhpcy5fY29tcG9uZW50ID0gY29tcG9uZW50O1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX3JhbmdlRGVjb3JhdGlvbiA9IG51bGw7XG4gICAgdGhpcy5faG9zdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5jbGFzc05hbWUgPSAnbnVjbGlkZS1kYXRhdGlwLW92ZXJsYXknO1xuICAgIHRoaXMuX2JvdW5kRGlzcG9zZSA9IHRoaXMuZGlzcG9zZS5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX2JvdW5kSGFuZGxlTW91c2VEb3duID0gdGhpcy5oYW5kbGVNb3VzZURvd24uYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlRW50ZXIgPSB0aGlzLmhhbmRsZU1vdXNlRW50ZXIuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlTGVhdmUgPSB0aGlzLmhhbmRsZU1vdXNlTGVhdmUuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ib3VuZEhhbmRsZUNhcHR1cmVkQ2xpY2sgPSB0aGlzLmhhbmRsZUNhcHR1cmVkQ2xpY2suYmluZCh0aGlzKTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUVudGVyKTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUxlYXZlKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB0aGlzLl9ob3N0RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5fYm91bmRIYW5kbGVNb3VzZUVudGVyKTtcbiAgICAgIHRoaXMuX2hvc3RFbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCB0aGlzLl9ib3VuZEhhbmRsZU1vdXNlTGVhdmUpO1xuICAgIH0pKTtcbiAgICB0aGlzLl9tb3VzZVVwVGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5fb2Zmc2V0ID0ge3g6IDAsIHk6IDB9O1xuICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9kcmFnT3JpZ2luID0gbnVsbDtcbiAgICB0aGlzLl9pc0hvdmVyaW5nID0gZmFsc2U7XG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfVxuXG4gIGhhbmRsZU1vdXNlRW50ZXIoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nID0gdHJ1ZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlTW91c2VMZWF2ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnJlbmRlcigpO1xuICB9XG5cbiAgaGFuZGxlR2xvYmFsTW91c2VNb3ZlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGV2dDogTW91c2VFdmVudCA9IChldmVudDogYW55KTtcbiAgICBjb25zdCB7X2RyYWdPcmlnaW59ID0gdGhpcztcbiAgICBpbnZhcmlhbnQoX2RyYWdPcmlnaW4pO1xuICAgIHRoaXMuX2lzRHJhZ2dpbmcgPSB0cnVlO1xuICAgIHRoaXMuX29mZnNldCA9IHtcbiAgICAgIHg6IGV2dC5jbGllbnRYIC0gX2RyYWdPcmlnaW4ueCxcbiAgICAgIHk6IGV2dC5jbGllbnRZIC0gX2RyYWdPcmlnaW4ueSxcbiAgICB9O1xuICAgIHRoaXMucmVuZGVyKCk7XG4gIH1cblxuICBoYW5kbGVHbG9iYWxNb3VzZVVwKCk6IHZvaWQge1xuICAgIC8vIElmIHRoZSBkYXRhdGlwIHdhcyBtb3ZlZCwgcHVzaCB0aGUgZWZmZWN0cyBvZiBtb3VzZVVwIHRvIHRoZSBuZXh0IHRpY2ssXG4gICAgLy8gaW4gb3JkZXIgdG8gYWxsb3cgY2FuY2VsYXRpb24gb2YgY2FwdHVyZWQgZXZlbnRzIChlLmcuIGNsaWNrcyBvbiBjaGlsZCBjb21wb25lbnRzKS5cbiAgICB0aGlzLl9tb3VzZVVwVGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5faXNEcmFnZ2luZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fZHJhZ09yaWdpbiA9IG51bGw7XG4gICAgICB0aGlzLl9tb3VzZVVwVGltZW91dCA9IG51bGw7XG4gICAgICB0aGlzLl9lbnN1cmVNb3VzZVN1YnNjcmlwdGlvbkRpc3Bvc2VkKCk7XG4gICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH0sIDApO1xuICB9XG5cbiAgX2Vuc3VyZU1vdXNlU3Vic2NyaXB0aW9uRGlzcG9zZWQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21vdXNlRGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tb3VzZURpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fbW91c2VEaXNwb3NhYmxlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVNb3VzZURvd24oZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZXZ0OiBNb3VzZUV2ZW50ID0gKGV2ZW50OiBhbnkpO1xuICAgIHRoaXMuX2RyYWdPcmlnaW4gPSB7XG4gICAgICB4OiBldnQuY2xpZW50WCAtIHRoaXMuX29mZnNldC54LFxuICAgICAgeTogZXZ0LmNsaWVudFkgLSB0aGlzLl9vZmZzZXQueSxcbiAgICB9O1xuICAgIHRoaXMuX2Vuc3VyZU1vdXNlU3Vic2NyaXB0aW9uRGlzcG9zZWQoKTtcbiAgICB0aGlzLl9tb3VzZURpc3Bvc2FibGUgPVxuICAgICAgZG9jdW1lbnRNb3VzZU1vdmUkKCkudGFrZVVudGlsKGRvY3VtZW50TW91c2VVcCQoKSkuc3Vic2NyaWJlKFJ4Lk9ic2VydmVyLmNyZWF0ZShcbiAgICAgIChlOiBNb3VzZUV2ZW50KSA9PiB7dGhpcy5oYW5kbGVHbG9iYWxNb3VzZU1vdmUoZSk7fSxcbiAgICAgIChlcnJvcjogYW55KSA9PiB7fSxcbiAgICAgICgpID0+IHt0aGlzLmhhbmRsZUdsb2JhbE1vdXNlVXAoKTt9LFxuICAgICkpO1xuICB9XG5cbiAgaGFuZGxlQ2FwdHVyZWRDbGljayhldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5faXNEcmFnZ2luZykge1xuICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gRW5zdXJlIHBvc2l0aW9uaW5nIG9mIHRoZSBEYXRhdGlwIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgbGluZS5cbiAgX3VwZGF0ZUhvc3RFbGVtZW50UG9zaXRpb24oKTogdm9pZCB7XG4gICAgY29uc3Qge1xuICAgICAgX2VkaXRvcixcbiAgICAgIF9yYW5nZSxcbiAgICAgIF9ob3N0RWxlbWVudCxcbiAgICAgIF9vZmZzZXQsXG4gICAgfSA9IHRoaXM7XG4gICAgY29uc3QgY2hhcldpZHRoID0gX2VkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKCk7XG4gICAgY29uc3QgbGluZUxlbmd0aCA9IF9lZGl0b3IuZ2V0QnVmZmVyKCkuZ2V0TGluZXMoKVtfcmFuZ2Uuc3RhcnQucm93XS5sZW5ndGg7XG4gICAgX2hvc3RFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIF9ob3N0RWxlbWVudC5zdHlsZS50b3AgPSAtX2VkaXRvci5nZXRMaW5lSGVpZ2h0SW5QaXhlbHMoKSArIF9vZmZzZXQueSArICdweCc7XG4gICAgX2hvc3RFbGVtZW50LnN0eWxlLmxlZnQgPVxuICAgICAgKGxpbmVMZW5ndGggLSBfcmFuZ2UuZW5kLmNvbHVtbikgKiBjaGFyV2lkdGggKyBMSU5FX0VORF9NQVJHSU4gKyBfb2Zmc2V0LnggKyAncHgnO1xuICB9XG5cbiAgcmVuZGVyKCk6IHZvaWQge1xuICAgIGNvbnN0IHtcbiAgICAgIF9lZGl0b3IsXG4gICAgICBfcmFuZ2UsXG4gICAgICBfY29tcG9uZW50LFxuICAgICAgX2hvc3RFbGVtZW50LFxuICAgICAgX2lzRHJhZ2dpbmcsXG4gICAgICBfaXNIb3ZlcmluZyxcbiAgICB9ID0gdGhpcztcbiAgICB0aGlzLl91cGRhdGVIb3N0RWxlbWVudFBvc2l0aW9uKCk7XG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPERhdGF0aXBDb21wb25lbnRcbiAgICAgICAgYWN0aW9uPXtEQVRBVElQX0FDVElPTlMuQ0xPU0V9XG4gICAgICAgIGFjdGlvblRpdGxlPVwiQ2xvc2UgdGhpcyBkYXRhdGlwXCJcbiAgICAgICAgY2xhc3NOYW1lPXtfaXNEcmFnZ2luZyA/ICdudWNsaWRlLWRhdGF0aXAtZHJhZ2dpbmcnIDogJyd9XG4gICAgICAgIG9uQWN0aW9uQ2xpY2s9e3RoaXMuX2JvdW5kRGlzcG9zZX1cbiAgICAgICAgb25Nb3VzZURvd249e3RoaXMuX2JvdW5kSGFuZGxlTW91c2VEb3dufVxuICAgICAgICBvbkNsaWNrQ2FwdHVyZT17dGhpcy5fYm91bmRIYW5kbGVDYXB0dXJlZENsaWNrfT5cbiAgICAgICAge19jb21wb25lbnR9XG4gICAgICA8L0RhdGF0aXBDb21wb25lbnQ+LFxuICAgICAgX2hvc3RFbGVtZW50LFxuICAgICk7XG5cbiAgICBsZXQgcmFuZ2VDbGFzc25hbWUgPSAnbnVjbGlkZS1kYXRhdGlwLWhpZ2hsaWdodC1yZWdpb24nO1xuICAgIGlmIChfaXNIb3ZlcmluZykge1xuICAgICAgcmFuZ2VDbGFzc25hbWUgKz0gJyBudWNsaWRlLWRhdGF0aXAtaGlnaGxpZ2h0LXJlZ2lvbi1hY3RpdmUnO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9tYXJrZXIgPT0gbnVsbCkge1xuICAgICAgY29uc3QgbWFya2VyOiBhdG9tJE1hcmtlciA9IF9lZGl0b3IubWFya0J1ZmZlclJhbmdlKF9yYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICAgIHRoaXMuX21hcmtlciA9IG1hcmtlcjtcbiAgICAgIF9lZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICAgIG1hcmtlcixcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgICBwb3NpdGlvbjogJ2hlYWQnLFxuICAgICAgICAgIGl0ZW06IHRoaXMuX2hvc3RFbGVtZW50LFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdGhpcy5fcmFuZ2VEZWNvcmF0aW9uID0gX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgICAgbWFya2VyLFxuICAgICAgICB7XG4gICAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICAgICAgY2xhc3M6IHJhbmdlQ2xhc3NuYW1lLFxuICAgICAgICB9XG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBgdGhpcy5fcmFuZ2VEZWNvcmF0aW9uYCBpcyBndWFyYW50ZWVkIHRvIGV4aXN0IGlmZiBgdGhpcy5fbWFya2VyYCBleGlzdHMuXG4gICAgICBpbnZhcmlhbnQodGhpcy5fcmFuZ2VEZWNvcmF0aW9uKTtcbiAgICAgIHRoaXMuX3JhbmdlRGVjb3JhdGlvbi5zZXRQcm9wZXJ0aWVzKHtcbiAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICAgIGNsYXNzOiByYW5nZUNsYXNzbmFtZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21vdXNlVXBUaW1lb3V0ICE9IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9tb3VzZVVwVGltZW91dCk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9tYXJrZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fbWFya2VyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX21vdXNlRGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9tb3VzZURpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2hvc3RFbGVtZW50KTtcbiAgICB0aGlzLl9ob3N0RWxlbWVudC5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG4iXX0=