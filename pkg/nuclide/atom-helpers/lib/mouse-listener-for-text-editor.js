var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var invariant = require('assert');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;
var Emitter = _require.Emitter;
var Point = _require.Point;

var DEBOUNCE_TIME = 200;

var WindowMouseListener = (function () {
  function WindowMouseListener() {
    var _this = this;

    _classCallCheck(this, WindowMouseListener);

    this._subscriptions = new CompositeDisposable();

    var _require2 = require('../../commons');

    var debounce = _require2.debounce;

    var handler = debounce(function (event) {
      return _this._handleMouseMove(event);
    }, DEBOUNCE_TIME,
    /* immediate */true);
    window.addEventListener('mousemove', handler);
    this._mouseMoveListener = new Disposable(function () {
      window.removeEventListener('mousemove', handler);
    });

    this._textEditorMouseListenersMap = new Map();
    this._textEditorMouseListenersCountMap = new Map();
    this._subscriptions.add(new Disposable(function () {
      _this._textEditorMouseListenersMap.forEach(function (listener) {
        return listener.dispose();
      });
      _this._textEditorMouseListenersMap.clear();
      _this._textEditorMouseListenersCountMap.clear();
    }));
  }

  _createClass(WindowMouseListener, [{
    key: 'mouseListenerForTextEditor',
    value: function mouseListenerForTextEditor(textEditor) {
      var _this2 = this;

      // Keep track of how many mouse listeners were returned for the text editor
      // so we know when it's safe to actually dispose it.
      var count = this._textEditorMouseListenersCountMap.get(textEditor) || 0;
      this._textEditorMouseListenersCountMap.set(textEditor, count + 1);

      var mouseListener = this._textEditorMouseListenersMap.get(textEditor);
      if (!mouseListener) {
        (function () {
          mouseListener = new TextEditorMouseListener(textEditor, /* shouldDispose */function () {
            var currentCount = _this2._textEditorMouseListenersCountMap.get(textEditor) || 0;
            if (currentCount === 1) {
              _this2._textEditorMouseListenersCountMap['delete'](textEditor);
              _this2._textEditorMouseListenersMap['delete'](textEditor);
              return true;
            } else {
              _this2._textEditorMouseListenersCountMap.set(textEditor, currentCount - 1);
              return false;
            }
          });
          _this2._textEditorMouseListenersMap.set(textEditor, mouseListener);

          var destroySubscription = textEditor.onDidDestroy(function () {
            // $FlowIssue: There is no way for this to become null.
            mouseListener.dispose();
            _this2._textEditorMouseListenersMap['delete'](textEditor);
            _this2._textEditorMouseListenersCountMap['delete'](textEditor);
            destroySubscription.dispose();
          });
        })();
      }
      return mouseListener;
    }
  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      this._textEditorMouseListenersMap.forEach(function (mouseListener) {
        return mouseListener._handleMouseMove(event);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
      if (this._mouseMoveListener) {
        this._mouseMoveListener.dispose();
      }
    }
  }]);

  return WindowMouseListener;
})();

var TextEditorMouseListener = (function () {
  function TextEditorMouseListener(textEditor, shouldDispose) {
    _classCallCheck(this, TextEditorMouseListener);

    this._textEditor = textEditor;
    this._textEditorView = atom.views.getView(this._textEditor);

    this._shouldDispose = shouldDispose;
    this._subscriptions = new CompositeDisposable();

    this._emitter = new Emitter();
    this._subscriptions.add(this._emitter);

    this._lastPosition = new Point(0, 0);
  }

  /**
   * Returns the last known text editor screen position under the mouse,
   * initialized to (0, 0).
   */

  _createClass(TextEditorMouseListener, [{
    key: 'getLastPosition',
    value: function getLastPosition() {
      return this._lastPosition;
    }

    /**
     * Calls `fn` when the mouse moves onto another text editor screen position,
     * not pixel position.
     */
  }, {
    key: 'onDidPositionChange',
    value: function onDidPositionChange(fn) {
      return this._emitter.on('did-position-change', fn);
    }
  }, {
    key: 'screenPositionForMouseEvent',
    value: function screenPositionForMouseEvent(event) {
      var component = this._textEditorView.component;
      invariant(component);
      return component.screenPositionForMouseEvent(event);
    }
  }, {
    key: '_handleMouseMove',
    value: function _handleMouseMove(event) {
      var position = this.screenPositionForMouseEvent(event);
      if (position.compare(this._lastPosition) !== 0) {
        this._lastPosition = position;
        this._emitter.emit('did-position-change', {
          nativeEvent: event,
          position: position
        });
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._shouldDispose()) {
        this._subscriptions.dispose();
      }
    }
  }]);

  return TextEditorMouseListener;
})();

module.exports =
/**
 * Returns an object that tracks the mouse position in a text editor.
 *
 * The positions are in text editor screen coordinates and are rounded down
 * to the last position on each line.
 */
function mouseListenerForTextEditor(textEditor) {
  // $FlowFixMe
  atom.nuclide = atom.nuclide || {};
  atom.nuclide.windowMouseListener = atom.nuclide.windowMouseListener || new WindowMouseListener();
  return atom.nuclide.windowMouseListener.mouseListenerForTextEditor(textEditor);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vdXNlLWxpc3RlbmVyLWZvci10ZXh0LWVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2VBQ3NCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxFLG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxVQUFVLFlBQVYsVUFBVTtJQUFFLE9BQU8sWUFBUCxPQUFPO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBT3RELElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQzs7SUFFcEIsbUJBQW1CO0FBTVosV0FOUCxtQkFBbUIsR0FNVDs7OzBCQU5WLG1CQUFtQjs7QUFPckIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7O29CQUU3QixPQUFPLENBQUMsZUFBZSxDQUFDOztRQUFwQyxRQUFRLGFBQVIsUUFBUTs7QUFDZixRQUFNLE9BQU8sR0FBRyxRQUFRLENBQ3BCLFVBQUEsS0FBSzthQUFJLE1BQUssZ0JBQWdCLENBQUMsS0FBSyxDQUFDO0tBQUEsRUFDckMsYUFBYTttQkFDRyxJQUFJLENBQUMsQ0FBQztBQUMxQixVQUFNLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLFVBQVUsQ0FBQyxZQUFNO0FBQzdDLFlBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDbEQsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzlDLFFBQUksQ0FBQyxpQ0FBaUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ25ELFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLFlBQU07QUFDM0MsWUFBSyw0QkFBNEIsQ0FBQyxPQUFPLENB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O0FBRW5GLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7QUFDbEMsTUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixJQUFJLElBQUksbUJBQW1CLEVBQUUsQ0FBQztBQUNqRyxTQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsMEJBQTBCLENBQUMsVUFBVSxDQUFDLENBQUM7Q0FDaEYsQ0FBQyIsImZpbGUiOiJtb3VzZS1saXN0ZW5lci1mb3ItdGV4dC1lZGl0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcbmNvbnN0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlLCBFbWl0dGVyLCBQb2ludH0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbnR5cGUgUG9zaXRpb25DaGFuZ2VFdmVudCA9IHtcbiAgbmF0aXZlRXZlbnQ6IE1vdXNlRXZlbnQ7XG4gIHBvc2l0aW9uOiBQb2ludDtcbn07XG5cbmNvbnN0IERFQk9VTkNFX1RJTUUgPSAyMDA7XG5cbmNsYXNzIFdpbmRvd01vdXNlTGlzdGVuZXIge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21vdXNlTW92ZUxpc3RlbmVyOiBEaXNwb3NhYmxlO1xuICBfdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzTWFwOiBNYXA8VGV4dEVkaXRvciwgVGV4dEVkaXRvck1vdXNlTGlzdGVuZXI+O1xuICBfdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzQ291bnRNYXA6IE1hcDxUZXh0RWRpdG9yLCBudW1iZXI+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgY29uc3Qge2RlYm91bmNlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcbiAgICBjb25zdCBoYW5kbGVyID0gZGVib3VuY2UoXG4gICAgICAgIGV2ZW50ID0+IHRoaXMuX2hhbmRsZU1vdXNlTW92ZShldmVudCksXG4gICAgICAgIERFQk9VTkNFX1RJTUUsXG4gICAgICAgIC8qIGltbWVkaWF0ZSAqLyB0cnVlKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlcik7XG4gICAgdGhpcy5fbW91c2VNb3ZlTGlzdGVuZXIgPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgaGFuZGxlcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzQ291bnRNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzTWFwLmZvckVhY2gobGlzdGVuZXIgPT4gbGlzdGVuZXIuZGlzcG9zZSgpKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc01hcC5jbGVhcigpO1xuICAgICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzQ291bnRNYXAuY2xlYXIoKTtcbiAgICB9KSk7XG4gIH1cblxuICBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogVGV4dEVkaXRvck1vdXNlTGlzdGVuZXIge1xuICAgIC8vIEtlZXAgdHJhY2sgb2YgaG93IG1hbnkgbW91c2UgbGlzdGVuZXJzIHdlcmUgcmV0dXJuZWQgZm9yIHRoZSB0ZXh0IGVkaXRvclxuICAgIC8vIHNvIHdlIGtub3cgd2hlbiBpdCdzIHNhZmUgdG8gYWN0dWFsbHkgZGlzcG9zZSBpdC5cbiAgICBjb25zdCBjb3VudCA9IHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc0NvdW50TWFwLmdldCh0ZXh0RWRpdG9yKSB8fCAwO1xuICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc0NvdW50TWFwLnNldCh0ZXh0RWRpdG9yLCBjb3VudCArIDEpO1xuXG4gICAgbGV0IG1vdXNlTGlzdGVuZXIgPSB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNNYXAuZ2V0KHRleHRFZGl0b3IpO1xuICAgIGlmICghbW91c2VMaXN0ZW5lcikge1xuICAgICAgbW91c2VMaXN0ZW5lciA9IG5ldyBUZXh0RWRpdG9yTW91c2VMaXN0ZW5lcih0ZXh0RWRpdG9yLCAvKiBzaG91bGREaXNwb3NlICovICgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudENvdW50ID0gdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzQ291bnRNYXAuZ2V0KHRleHRFZGl0b3IpIHx8IDA7XG4gICAgICAgIGlmIChjdXJyZW50Q291bnQgPT09IDEpIHtcbiAgICAgICAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNDb3VudE1hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgICAgICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzTWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNDb3VudE1hcC5zZXQodGV4dEVkaXRvciwgY3VycmVudENvdW50IC0gMSk7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc01hcC5zZXQodGV4dEVkaXRvciwgbW91c2VMaXN0ZW5lcik7XG5cbiAgICAgIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSB0ZXh0RWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIC8vICRGbG93SXNzdWU6IFRoZXJlIGlzIG5vIHdheSBmb3IgdGhpcyB0byBiZWNvbWUgbnVsbC5cbiAgICAgICAgbW91c2VMaXN0ZW5lci5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc01hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc0NvdW50TWFwLmRlbGV0ZSh0ZXh0RWRpdG9yKTtcbiAgICAgICAgZGVzdHJveVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG1vdXNlTGlzdGVuZXI7XG4gIH1cblxuICBfaGFuZGxlTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzTWFwLmZvckVhY2goXG4gICAgICAgIG1vdXNlTGlzdGVuZXIgPT4gbW91c2VMaXN0ZW5lci5faGFuZGxlTW91c2VNb3ZlKGV2ZW50KSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGlmICh0aGlzLl9tb3VzZU1vdmVMaXN0ZW5lcikge1xuICAgICAgdGhpcy5fbW91c2VNb3ZlTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBUZXh0RWRpdG9yTW91c2VMaXN0ZW5lciB7XG4gIF90ZXh0RWRpdG9yOiBUZXh0RWRpdG9yO1xuICBfdGV4dEVkaXRvclZpZXc6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQ7XG4gIF9zaG91bGREaXNwb3NlOiAoKSA9PiBib29sZWFuO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9sYXN0UG9zaXRpb246IGF0b20kUG9pbnQ7XG5cbiAgY29uc3RydWN0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvciwgc2hvdWxkRGlzcG9zZTogKCkgPT4gYm9vbGVhbikge1xuICAgIHRoaXMuX3RleHRFZGl0b3IgPSB0ZXh0RWRpdG9yO1xuICAgIHRoaXMuX3RleHRFZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX3RleHRFZGl0b3IpO1xuXG4gICAgdGhpcy5fc2hvdWxkRGlzcG9zZSA9IHNob3VsZERpc3Bvc2U7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl9lbWl0dGVyKTtcblxuICAgIHRoaXMuX2xhc3RQb3NpdGlvbiA9IG5ldyBQb2ludCgwLCAwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBsYXN0IGtub3duIHRleHQgZWRpdG9yIHNjcmVlbiBwb3NpdGlvbiB1bmRlciB0aGUgbW91c2UsXG4gICAqIGluaXRpYWxpemVkIHRvICgwLCAwKS5cbiAgICovXG4gIGdldExhc3RQb3NpdGlvbigpOiBQb2ludCB7XG4gICAgcmV0dXJuIHRoaXMuX2xhc3RQb3NpdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBgZm5gIHdoZW4gdGhlIG1vdXNlIG1vdmVzIG9udG8gYW5vdGhlciB0ZXh0IGVkaXRvciBzY3JlZW4gcG9zaXRpb24sXG4gICAqIG5vdCBwaXhlbCBwb3NpdGlvbi5cbiAgICovXG4gIG9uRGlkUG9zaXRpb25DaGFuZ2UoZm46IChldmVudDogUG9zaXRpb25DaGFuZ2VFdmVudCkgPT4gdm9pZCk6IERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdkaWQtcG9zaXRpb24tY2hhbmdlJywgZm4pO1xuICB9XG5cbiAgc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50OiBNb3VzZUV2ZW50KTogUG9pbnQge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IHRoaXMuX3RleHRFZGl0b3JWaWV3LmNvbXBvbmVudDtcbiAgICBpbnZhcmlhbnQoY29tcG9uZW50KTtcbiAgICByZXR1cm4gY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChldmVudCk7XG4gIH1cblxuICBfaGFuZGxlTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChldmVudCk7XG4gICAgaWYgKHBvc2l0aW9uLmNvbXBhcmUodGhpcy5fbGFzdFBvc2l0aW9uKSAhPT0gMCkge1xuICAgICAgdGhpcy5fbGFzdFBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ2RpZC1wb3NpdGlvbi1jaGFuZ2UnLCB7XG4gICAgICAgIG5hdGl2ZUV2ZW50OiBldmVudCxcbiAgICAgICAgcG9zaXRpb24sXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zaG91bGREaXNwb3NlKCkpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9XG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgdHJhY2tzIHRoZSBtb3VzZSBwb3NpdGlvbiBpbiBhIHRleHQgZWRpdG9yLlxuICpcbiAqIFRoZSBwb3NpdGlvbnMgYXJlIGluIHRleHQgZWRpdG9yIHNjcmVlbiBjb29yZGluYXRlcyBhbmQgYXJlIHJvdW5kZWQgZG93blxuICogdG8gdGhlIGxhc3QgcG9zaXRpb24gb24gZWFjaCBsaW5lLlxuICovXG5mdW5jdGlvbiBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvcih0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogVGV4dEVkaXRvck1vdXNlTGlzdGVuZXIge1xuICAvLyAkRmxvd0ZpeE1lXG4gIGF0b20ubnVjbGlkZSA9IGF0b20ubnVjbGlkZSB8fCB7fTtcbiAgYXRvbS5udWNsaWRlLndpbmRvd01vdXNlTGlzdGVuZXIgPSBhdG9tLm51Y2xpZGUud2luZG93TW91c2VMaXN0ZW5lciB8fCBuZXcgV2luZG93TW91c2VMaXN0ZW5lcigpO1xuICByZXR1cm4gYXRvbS5udWNsaWRlLndpbmRvd01vdXNlTGlzdGVuZXIubW91c2VMaXN0ZW5lckZvclRleHRFZGl0b3IodGV4dEVkaXRvcik7XG59O1xuIl19