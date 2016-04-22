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

    var _require2 = require('../../nuclide-commons');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vdXNlLWxpc3RlbmVyLWZvci10ZXh0LWVkaXRvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2VBQ3NCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxFLG1CQUFtQixZQUFuQixtQkFBbUI7SUFBRSxVQUFVLFlBQVYsVUFBVTtJQUFFLE9BQU8sWUFBUCxPQUFPO0lBQUUsS0FBSyxZQUFMLEtBQUs7O0FBT3RELElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQzs7SUFFcEIsbUJBQW1CO0FBTVosV0FOUCxtQkFBbUIsR0FNVDs7OzBCQU5WLG1CQUFtQjs7QUFPckIsUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7O29CQUU3QixPQUFPLENBQUMsdUJBQXVCLENBQUM7O1FBQTVDLFFBQVEsYUFBUixRQUFROztBQUNmLFFBQU0sT0FBTyxHQUFHLFFBQVEsQ0FDcEIsVUFBQSxLQUFLO2FBQUksTUFBSyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7S0FBQSxFQUNyQyxhQUFhO21CQUNHLElBQUksQ0FBQyxDQUFDO0FBQzFCLFVBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDOUMsUUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksVUFBVSxDQUFDLFlBQU07QUFDN0MsWUFBTSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNsRCxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLGlDQUFpQyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkQsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxVQUFVLENBQUMsWUFBTTtBQUMzQyxZQUFLLDRCQUE0QixDQUFDLE9BQU8s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Qjs7QUFFbkYsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztBQUNsQyxNQUFJLENBQUMsT0FBTyxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLElBQUksSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBQ2pHLFNBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQywwQkFBMEIsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUNoRixDQUFDIiwiZmlsZSI6Im1vdXNlLWxpc3RlbmVyLWZvci10ZXh0LWVkaXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGUsIEVtaXR0ZXIsIFBvaW50fSA9IHJlcXVpcmUoJ2F0b20nKTtcblxudHlwZSBQb3NpdGlvbkNoYW5nZUV2ZW50ID0ge1xuICBuYXRpdmVFdmVudDogTW91c2VFdmVudDtcbiAgcG9zaXRpb246IFBvaW50O1xufTtcblxuY29uc3QgREVCT1VOQ0VfVElNRSA9IDIwMDtcblxuY2xhc3MgV2luZG93TW91c2VMaXN0ZW5lciB7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbW91c2VNb3ZlTGlzdGVuZXI6IERpc3Bvc2FibGU7XG4gIF90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNNYXA6IE1hcDxUZXh0RWRpdG9yLCBUZXh0RWRpdG9yTW91c2VMaXN0ZW5lcj47XG4gIF90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNDb3VudE1hcDogTWFwPFRleHRFZGl0b3IsIG51bWJlcj47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICBjb25zdCB7ZGVib3VuY2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG4gICAgY29uc3QgaGFuZGxlciA9IGRlYm91bmNlKFxuICAgICAgICBldmVudCA9PiB0aGlzLl9oYW5kbGVNb3VzZU1vdmUoZXZlbnQpLFxuICAgICAgICBERUJPVU5DRV9USU1FLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gdHJ1ZSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZXIpO1xuICAgIHRoaXMuX21vdXNlTW92ZUxpc3RlbmVyID0gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZXIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc0NvdW50TWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc01hcC5mb3JFYWNoKGxpc3RlbmVyID0+IGxpc3RlbmVyLmRpc3Bvc2UoKSk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNNYXAuY2xlYXIoKTtcbiAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc0NvdW50TWFwLmNsZWFyKCk7XG4gICAgfSkpO1xuICB9XG5cbiAgbW91c2VMaXN0ZW5lckZvclRleHRFZGl0b3IodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFRleHRFZGl0b3JNb3VzZUxpc3RlbmVyIHtcbiAgICAvLyBLZWVwIHRyYWNrIG9mIGhvdyBtYW55IG1vdXNlIGxpc3RlbmVycyB3ZXJlIHJldHVybmVkIGZvciB0aGUgdGV4dCBlZGl0b3JcbiAgICAvLyBzbyB3ZSBrbm93IHdoZW4gaXQncyBzYWZlIHRvIGFjdHVhbGx5IGRpc3Bvc2UgaXQuXG4gICAgY29uc3QgY291bnQgPSB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNDb3VudE1hcC5nZXQodGV4dEVkaXRvcikgfHwgMDtcbiAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNDb3VudE1hcC5zZXQodGV4dEVkaXRvciwgY291bnQgKyAxKTtcblxuICAgIGxldCBtb3VzZUxpc3RlbmVyID0gdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzTWFwLmdldCh0ZXh0RWRpdG9yKTtcbiAgICBpZiAoIW1vdXNlTGlzdGVuZXIpIHtcbiAgICAgIG1vdXNlTGlzdGVuZXIgPSBuZXcgVGV4dEVkaXRvck1vdXNlTGlzdGVuZXIodGV4dEVkaXRvciwgLyogc2hvdWxkRGlzcG9zZSAqLyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRDb3VudCA9IHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc0NvdW50TWFwLmdldCh0ZXh0RWRpdG9yKSB8fCAwO1xuICAgICAgICBpZiAoY3VycmVudENvdW50ID09PSAxKSB7XG4gICAgICAgICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzQ291bnRNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgICAgICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc01hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fdGV4dEVkaXRvck1vdXNlTGlzdGVuZXJzQ291bnRNYXAuc2V0KHRleHRFZGl0b3IsIGN1cnJlbnRDb3VudCAtIDEpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNNYXAuc2V0KHRleHRFZGl0b3IsIG1vdXNlTGlzdGVuZXIpO1xuXG4gICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gdGV4dEVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICAvLyAkRmxvd0lzc3VlOiBUaGVyZSBpcyBubyB3YXkgZm9yIHRoaXMgdG8gYmVjb21lIG51bGwuXG4gICAgICAgIG1vdXNlTGlzdGVuZXIuZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNNYXAuZGVsZXRlKHRleHRFZGl0b3IpO1xuICAgICAgICB0aGlzLl90ZXh0RWRpdG9yTW91c2VMaXN0ZW5lcnNDb3VudE1hcC5kZWxldGUodGV4dEVkaXRvcik7XG4gICAgICAgIGRlc3Ryb3lTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBtb3VzZUxpc3RlbmVyO1xuICB9XG5cbiAgX2hhbmRsZU1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX3RleHRFZGl0b3JNb3VzZUxpc3RlbmVyc01hcC5mb3JFYWNoKFxuICAgICAgICBtb3VzZUxpc3RlbmVyID0+IG1vdXNlTGlzdGVuZXIuX2hhbmRsZU1vdXNlTW92ZShldmVudCkpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBpZiAodGhpcy5fbW91c2VNb3ZlTGlzdGVuZXIpIHtcbiAgICAgIHRoaXMuX21vdXNlTW92ZUxpc3RlbmVyLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgVGV4dEVkaXRvck1vdXNlTGlzdGVuZXIge1xuICBfdGV4dEVkaXRvcjogVGV4dEVkaXRvcjtcbiAgX3RleHRFZGl0b3JWaWV3OiBhdG9tJFRleHRFZGl0b3JFbGVtZW50O1xuICBfc2hvdWxkRGlzcG9zZTogKCkgPT4gYm9vbGVhbjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfbGFzdFBvc2l0aW9uOiBhdG9tJFBvaW50O1xuXG4gIGNvbnN0cnVjdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IsIHNob3VsZERpc3Bvc2U6ICgpID0+IGJvb2xlYW4pIHtcbiAgICB0aGlzLl90ZXh0RWRpdG9yID0gdGV4dEVkaXRvcjtcbiAgICB0aGlzLl90ZXh0RWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl90ZXh0RWRpdG9yKTtcblxuICAgIHRoaXMuX3Nob3VsZERpc3Bvc2UgPSBzaG91bGREaXNwb3NlO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZW1pdHRlcik7XG5cbiAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBuZXcgUG9pbnQoMCwgMCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbGFzdCBrbm93biB0ZXh0IGVkaXRvciBzY3JlZW4gcG9zaXRpb24gdW5kZXIgdGhlIG1vdXNlLFxuICAgKiBpbml0aWFsaXplZCB0byAoMCwgMCkuXG4gICAqL1xuICBnZXRMYXN0UG9zaXRpb24oKTogUG9pbnQge1xuICAgIHJldHVybiB0aGlzLl9sYXN0UG9zaXRpb247XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgYGZuYCB3aGVuIHRoZSBtb3VzZSBtb3ZlcyBvbnRvIGFub3RoZXIgdGV4dCBlZGl0b3Igc2NyZWVuIHBvc2l0aW9uLFxuICAgKiBub3QgcGl4ZWwgcG9zaXRpb24uXG4gICAqL1xuICBvbkRpZFBvc2l0aW9uQ2hhbmdlKGZuOiAoZXZlbnQ6IFBvc2l0aW9uQ2hhbmdlRXZlbnQpID0+IHZvaWQpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oJ2RpZC1wb3NpdGlvbi1jaGFuZ2UnLCBmbik7XG4gIH1cblxuICBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZXZlbnQ6IE1vdXNlRXZlbnQpOiBQb2ludCB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5fdGV4dEVkaXRvclZpZXcuY29tcG9uZW50O1xuICAgIGludmFyaWFudChjb21wb25lbnQpO1xuICAgIHJldHVybiBjb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KTtcbiAgfVxuXG4gIF9oYW5kbGVNb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHRoaXMuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGV2ZW50KTtcbiAgICBpZiAocG9zaXRpb24uY29tcGFyZSh0aGlzLl9sYXN0UG9zaXRpb24pICE9PSAwKSB7XG4gICAgICB0aGlzLl9sYXN0UG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZGlkLXBvc2l0aW9uLWNoYW5nZScsIHtcbiAgICAgICAgbmF0aXZlRXZlbnQ6IGV2ZW50LFxuICAgICAgICBwb3NpdGlvbixcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3Nob3VsZERpc3Bvc2UoKSkge1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID1cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3QgdGhhdCB0cmFja3MgdGhlIG1vdXNlIHBvc2l0aW9uIGluIGEgdGV4dCBlZGl0b3IuXG4gKlxuICogVGhlIHBvc2l0aW9ucyBhcmUgaW4gdGV4dCBlZGl0b3Igc2NyZWVuIGNvb3JkaW5hdGVzIGFuZCBhcmUgcm91bmRlZCBkb3duXG4gKiB0byB0aGUgbGFzdCBwb3NpdGlvbiBvbiBlYWNoIGxpbmUuXG4gKi9cbmZ1bmN0aW9uIG1vdXNlTGlzdGVuZXJGb3JUZXh0RWRpdG9yKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBUZXh0RWRpdG9yTW91c2VMaXN0ZW5lciB7XG4gIC8vICRGbG93Rml4TWVcbiAgYXRvbS5udWNsaWRlID0gYXRvbS5udWNsaWRlIHx8IHt9O1xuICBhdG9tLm51Y2xpZGUud2luZG93TW91c2VMaXN0ZW5lciA9IGF0b20ubnVjbGlkZS53aW5kb3dNb3VzZUxpc3RlbmVyIHx8IG5ldyBXaW5kb3dNb3VzZUxpc3RlbmVyKCk7XG4gIHJldHVybiBhdG9tLm51Y2xpZGUud2luZG93TW91c2VMaXN0ZW5lci5tb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvcih0ZXh0RWRpdG9yKTtcbn07XG4iXX0=