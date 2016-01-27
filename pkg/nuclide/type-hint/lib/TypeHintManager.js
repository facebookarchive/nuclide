var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var _TypeHintComponent = require('./TypeHintComponent');

var TYPEHINT_DELAY_MS = 50;

var TypeHintManager = (function () {
  function TypeHintManager() {
    var _this = this;

    _classCallCheck(this, TypeHintManager);

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-type-hint:toggle', this.toggleTypehint.bind(this)));
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'core:cancel', this.hideTypehint.bind(this)));

    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      // When the cursor moves the next time we do a toggle we should show the
      // new type hint
      _this._subscriptions.add(editor.onDidChangeCursorPosition(function () {
        _this._typeHintToggle = false;
      }));

      var editorView = atom.views.getView(editor);
      var mouseMoveListener = (0, _commons.debounce)(function (e) {
        _this._typehintForMouseEvent(e, editor, editorView);
      }, TYPEHINT_DELAY_MS,
      /* immediate */false);
      editorView.addEventListener('mousemove', mouseMoveListener);
      var mouseListenerSubscription = new _atom.Disposable(function () {
        return editorView.removeEventListener('mousemove', mouseMoveListener);
      });
      var destroySubscription = editor.onDidDestroy(function () {
        mouseListenerSubscription.dispose();
        _this._subscriptions.remove(mouseListenerSubscription);
        _this._subscriptions.remove(destroySubscription);
      });
      _this._subscriptions.add(mouseListenerSubscription);
      _this._subscriptions.add(destroySubscription);
    }));
    this._typeHintElement = document.createElement('div');
    this._typeHintElement.className = 'nuclide-type-hint-overlay';

    var typehintMouseEnter = function typehintMouseEnter(event) {
      return _this._handleElementMouseEnter(event);
    };
    var typehintMouseLeave = function typehintMouseLeave(event) {
      return _this._handleElementMouseLeave(event);
    };
    this._typeHintElement.addEventListener('mouseenter', typehintMouseEnter);
    this._typeHintElement.addEventListener('mouseleave', typehintMouseLeave);

    this._typeHintProviders = [];
    this._marker = null;
    this._typeHintToggle = false;
    this._currentRange = null;
    this._isHoveringTypehint = false;
  }

  _createClass(TypeHintManager, [{
    key: 'toggleTypehint',
    value: function toggleTypehint() {
      this._typeHintToggle = !this._typeHintToggle;
      if (this._typeHintToggle) {
        var editor = atom.workspace.getActiveTextEditor();
        if (editor != null) {
          var position = editor.getCursorScreenPosition();
          this._typeHintInEditor(editor, position);
        }
      } else {
        this.hideTypehint();
      }
    }
  }, {
    key: 'hideTypehint',
    value: function hideTypehint() {
      if (this._marker == null) {
        return;
      }
      this._typeHintElement.style.display = 'none';
      this._marker.destroy();
      this._marker = null;
      this._currentRange = null;
      this._isHoveringTypehint = false;
    }
  }, {
    key: '_handleElementMouseEnter',
    value: function _handleElementMouseEnter(event) {
      this._isHoveringTypehint = true;
    }
  }, {
    key: '_handleElementMouseLeave',
    value: function _handleElementMouseLeave(event) {
      this._isHoveringTypehint = false;
    }
  }, {
    key: '_typehintForMouseEvent',
    value: function _typehintForMouseEvent(e, editor, editorView) {
      if (!editorView.component) {
        // The editor was destroyed, but the destroy handler haven't yet been called to cancel
        // the timer.
        return;
      }
      var screenPosition = editorView.component.screenPositionForMouseEvent(e);
      var position = editor.bufferPositionForScreenPosition(screenPosition);
      this._typeHintInEditor(editor, position);
    }
  }, {
    key: '_typeHintInEditor',
    value: _asyncToGenerator(function* (editor, position) {
      if (this._isHoveringTypehint) {
        return;
      }

      if (this._currentRange != null && this._currentRange.containsPoint(position)) {
        return;
      }

      if (this._marker != null) {
        this.hideTypehint();
      }

      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var _getMatchingProvidersForScopeName2 = this._getMatchingProvidersForScopeName(scopeName);

      var _getMatchingProvidersForScopeName22 = _slicedToArray(_getMatchingProvidersForScopeName2, 1);

      var provider = _getMatchingProvidersForScopeName22[0];

      if (provider == null) {
        return;
      }
      var name = undefined;
      if (provider.providerName != null) {
        name = provider.providerName;
      } else {
        name = 'unknown';
        var logger = require('../../logging').getLogger();
        logger.error('Type hint provider has no name', provider);
      }
      var typeHint = yield (0, _analytics.trackOperationTiming)(name + '.typeHint', function () {
        return provider.typeHint(editor, position);
      });
      if (!typeHint || this._marker) {
        return;
      }

      var hint = typeHint.hint;
      var hintTree = typeHint.hintTree;
      var range = typeHint.range;

      // For now, actual hint text is required.
      (0, _assert2['default'])(hint != null);
      // We track the timing above, but we still want to know the number of popups that are shown.
      (0, _analytics.track)('type-hint-popup', {
        'scope': scopeName,
        'message': hint
      });
      this._currentRange = range;

      // Transform the matched element range to the hint range.
      var marker = editor.markBufferRange(range, { invalidate: 'never' });
      this._marker = marker;

      _reactForAtom.React.render(_reactForAtom.React.createElement(_TypeHintComponent.TypeHintComponent, { content: hintTree || hint }), this._typeHintElement);
      // This relative positioning is to work around the issue that `position: 'head'`
      // doesn't work for overlay decorators are rendered on the bottom right of the given range.
      // Atom issue: https://github.com/atom/atom/issues/6695
      var expressionLength = range.end.column - range.start.column;
      this._typeHintElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) + 'px';
      this._typeHintElement.style.display = 'block';

      editor.decorateMarker(marker, {
        type: 'overlay',
        position: 'head',
        item: this._typeHintElement
      });
      editor.decorateMarker(marker, {
        type: 'highlight',
        'class': 'nuclide-type-hint-highlight-region'
      });
    })
  }, {
    key: '_getMatchingProvidersForScopeName',
    value: function _getMatchingProvidersForScopeName(scopeName) {
      return this._typeHintProviders.filter(function (provider) {
        var providerGrammars = provider.selector.split(/, ?/);
        return provider.inclusionPriority > 0 && providerGrammars.indexOf(scopeName) !== -1;
      }).sort(function (providerA, providerB) {
        return providerA.inclusionPriority - providerB.inclusionPriority;
      });
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      this._typeHintProviders.push(provider);
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      _commons.array.remove(this._typeHintProviders, provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.hideTypehint();
      _reactForAtom.React.unmountComponentAtNode(this._typeHintElement);
      this._typeHintElement.remove();
      this._subscriptions.dispose();
    }
  }]);

  return TypeHintManager;
})();

module.exports = TypeHintManager;

/**
 * This helps determine if we should show the type hint when toggling it via
 * command. The toggle command first negates this, and then if this is true
 * shows a type hint, otherwise it hides the current typehint.
 */
//# sourceMappingURL=data:application/json;base64,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QixFQUFRO0FBQy9DLHFCQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDakQ7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLDBCQUFNLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3BELFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0FqTkcsZUFBZTs7O0FBb05yQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJUeXBlSGludE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5LCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrLCB0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHtUeXBlSGludENvbXBvbmVudH0gZnJvbSAnLi9UeXBlSGludENvbXBvbmVudCc7XG5cbmNvbnN0IFRZUEVISU5UX0RFTEFZX01TID0gNTA7XG5cbmNsYXNzIFR5cGVIaW50TWFuYWdlciB7XG5cbiAgX3N1YnNjcmlwdGlvbnM6IGF0b20kQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21hcmtlcjogP2F0b20kTWFya2VyO1xuICBfdHlwZUhpbnRFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX2N1cnJlbnRSYW5nZTogP2F0b20kUmFuZ2U7XG4gIF9pc0hvdmVyaW5nVHlwZWhpbnQ6IGJvb2xlYW47XG4gIF90eXBlSGludFByb3ZpZGVyczogQXJyYXk8VHlwZUhpbnRQcm92aWRlcj47XG4gIC8qKlxuICAgKiBUaGlzIGhlbHBzIGRldGVybWluZSBpZiB3ZSBzaG91bGQgc2hvdyB0aGUgdHlwZSBoaW50IHdoZW4gdG9nZ2xpbmcgaXQgdmlhXG4gICAqIGNvbW1hbmQuIFRoZSB0b2dnbGUgY29tbWFuZCBmaXJzdCBuZWdhdGVzIHRoaXMsIGFuZCB0aGVuIGlmIHRoaXMgaXMgdHJ1ZVxuICAgKiBzaG93cyBhIHR5cGUgaGludCwgb3RoZXJ3aXNlIGl0IGhpZGVzIHRoZSBjdXJyZW50IHR5cGVoaW50LlxuICAgKi9cbiAgX3R5cGVIaW50VG9nZ2xlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtdHlwZS1oaW50OnRvZ2dsZScsXG4gICAgICB0aGlzLnRvZ2dsZVR5cGVoaW50LmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICB0aGlzLmhpZGVUeXBlaGludC5iaW5kKHRoaXMpXG4gICAgKSk7XG5cbiAgICAvLyBUT0RPKG1vc3QpOiBSZXBsYWNlIHdpdGggQGpqaWFhJ3MgbW91c2VMaXN0ZW5lckZvclRleHRFZGl0b3IgaW50cm9kdWNlZCBpbiBEMjAwNTU0NS5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIGN1cnNvciBtb3ZlcyB0aGUgbmV4dCB0aW1lIHdlIGRvIGEgdG9nZ2xlIHdlIHNob3VsZCBzaG93IHRoZVxuICAgICAgLy8gbmV3IHR5cGUgaGludFxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLl90eXBlSGludFRvZ2dsZSA9IGZhbHNlO1xuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gICAgICBjb25zdCBtb3VzZU1vdmVMaXN0ZW5lciA9IGRlYm91bmNlKFxuICAgICAgICAoZSkgPT4ge3RoaXMuX3R5cGVoaW50Rm9yTW91c2VFdmVudCgoKGU6IGFueSk6IE1vdXNlRXZlbnQpLCBlZGl0b3IsIGVkaXRvclZpZXcpO30sXG4gICAgICAgIFRZUEVISU5UX0RFTEFZX01TLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2UsXG4gICAgICApO1xuICAgICAgZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVMaXN0ZW5lcik7XG4gICAgICBjb25zdCBtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoKCkgPT5cbiAgICAgICAgICBlZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZUxpc3RlbmVyKSk7XG4gICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgfSkpO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5jbGFzc05hbWUgPSAnbnVjbGlkZS10eXBlLWhpbnQtb3ZlcmxheSc7XG5cbiAgICBjb25zdCB0eXBlaGludE1vdXNlRW50ZXIgPSBldmVudCA9PiB0aGlzLl9oYW5kbGVFbGVtZW50TW91c2VFbnRlcihldmVudCk7XG4gICAgY29uc3QgdHlwZWhpbnRNb3VzZUxlYXZlID0gZXZlbnQgPT4gdGhpcy5faGFuZGxlRWxlbWVudE1vdXNlTGVhdmUoZXZlbnQpO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdHlwZWhpbnRNb3VzZUVudGVyKTtcbiAgICB0aGlzLl90eXBlSGludEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIHR5cGVoaW50TW91c2VMZWF2ZSk7XG5cbiAgICB0aGlzLl90eXBlSGludFByb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX21hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fdHlwZUhpbnRUb2dnbGUgPSBmYWxzZTtcbiAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX2lzSG92ZXJpbmdUeXBlaGludCA9IGZhbHNlO1xuICB9XG5cbiAgdG9nZ2xlVHlwZWhpbnQoKTogdm9pZCB7XG4gICAgdGhpcy5fdHlwZUhpbnRUb2dnbGUgPSAhdGhpcy5fdHlwZUhpbnRUb2dnbGU7XG4gICAgaWYgKHRoaXMuX3R5cGVIaW50VG9nZ2xlKSB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5fdHlwZUhpbnRJbkVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWRlVHlwZWhpbnQoKTtcbiAgICB9XG4gIH1cblxuICBoaWRlVHlwZWhpbnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21hcmtlciA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuX21hcmtlci5kZXN0cm95KCk7XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX2lzSG92ZXJpbmdUeXBlaGludCA9IGZhbHNlO1xuICB9XG5cbiAgX2hhbmRsZUVsZW1lbnRNb3VzZUVudGVyKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmdUeXBlaGludCA9IHRydWU7XG4gIH1cblxuICBfaGFuZGxlRWxlbWVudE1vdXNlTGVhdmUoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNIb3ZlcmluZ1R5cGVoaW50ID0gZmFsc2U7XG4gIH1cblxuICBfdHlwZWhpbnRGb3JNb3VzZUV2ZW50KGU6IE1vdXNlRXZlbnQsIGVkaXRvcjogVGV4dEVkaXRvciwgZWRpdG9yVmlldzogSFRNTEVsZW1lbnQpIHtcbiAgICBpZiAoIWVkaXRvclZpZXcuY29tcG9uZW50KSB7XG4gICAgICAvLyBUaGUgZWRpdG9yIHdhcyBkZXN0cm95ZWQsIGJ1dCB0aGUgZGVzdHJveSBoYW5kbGVyIGhhdmVuJ3QgeWV0IGJlZW4gY2FsbGVkIHRvIGNhbmNlbFxuICAgICAgLy8gdGhlIHRpbWVyLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IGVkaXRvclZpZXcuY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChlKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKTtcbiAgICB0aGlzLl90eXBlSGludEluRWRpdG9yKGVkaXRvciwgcG9zaXRpb24pO1xuICB9XG5cbiAgYXN5bmMgX3R5cGVIaW50SW5FZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2Uge1xuICAgIGlmICh0aGlzLl9pc0hvdmVyaW5nVHlwZWhpbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3VycmVudFJhbmdlICE9IG51bGwgJiYgdGhpcy5fY3VycmVudFJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21hcmtlciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmhpZGVUeXBlaGludCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHtzY29wZU5hbWV9ID0gZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICBjb25zdCBbcHJvdmlkZXJdID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcbiAgICBpZiAocHJvdmlkZXIgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgbmFtZTtcbiAgICBpZiAocHJvdmlkZXIucHJvdmlkZXJOYW1lICE9IG51bGwpIHtcbiAgICAgIG5hbWUgPSBwcm92aWRlci5wcm92aWRlck5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSAndW5rbm93bic7XG4gICAgICBjb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgICBsb2dnZXIuZXJyb3IoJ1R5cGUgaGludCBwcm92aWRlciBoYXMgbm8gbmFtZScsIHByb3ZpZGVyKTtcbiAgICB9XG4gICAgY29uc3QgdHlwZUhpbnQgPSBhd2FpdCB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgIG5hbWUgKyAnLnR5cGVIaW50JyxcbiAgICAgICgpID0+IHByb3ZpZGVyLnR5cGVIaW50KGVkaXRvciwgcG9zaXRpb24pLFxuICAgICk7XG4gICAgaWYgKCF0eXBlSGludCB8fCB0aGlzLl9tYXJrZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7aGludCwgaGludFRyZWUsIHJhbmdlfSA9IHR5cGVIaW50O1xuICAgIC8vIEZvciBub3csIGFjdHVhbCBoaW50IHRleHQgaXMgcmVxdWlyZWQuXG4gICAgaW52YXJpYW50KGhpbnQgIT0gbnVsbCk7XG4gICAgLy8gV2UgdHJhY2sgdGhlIHRpbWluZyBhYm92ZSwgYnV0IHdlIHN0aWxsIHdhbnQgdG8ga25vdyB0aGUgbnVtYmVyIG9mIHBvcHVwcyB0aGF0IGFyZSBzaG93bi5cbiAgICB0cmFjaygndHlwZS1oaW50LXBvcHVwJywge1xuICAgICAgJ3Njb3BlJzogc2NvcGVOYW1lLFxuICAgICAgJ21lc3NhZ2UnOiBoaW50LFxuICAgIH0pO1xuICAgIHRoaXMuX2N1cnJlbnRSYW5nZSA9IHJhbmdlO1xuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBtYXRjaGVkIGVsZW1lbnQgcmFuZ2UgdG8gdGhlIGhpbnQgcmFuZ2UuXG4gICAgY29uc3QgbWFya2VyOiBhdG9tJE1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgUmVhY3QucmVuZGVyKFxuICAgICAgPFR5cGVIaW50Q29tcG9uZW50IGNvbnRlbnQ9e2hpbnRUcmVlIHx8IGhpbnR9IC8+LFxuICAgICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50XG4gICAgKTtcbiAgICAvLyBUaGlzIHJlbGF0aXZlIHBvc2l0aW9uaW5nIGlzIHRvIHdvcmsgYXJvdW5kIHRoZSBpc3N1ZSB0aGF0IGBwb3NpdGlvbjogJ2hlYWQnYFxuICAgIC8vIGRvZXNuJ3Qgd29yayBmb3Igb3ZlcmxheSBkZWNvcmF0b3JzIGFyZSByZW5kZXJlZCBvbiB0aGUgYm90dG9tIHJpZ2h0IG9mIHRoZSBnaXZlbiByYW5nZS5cbiAgICAvLyBBdG9tIGlzc3VlOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9hdG9tL2lzc3Vlcy82Njk1XG4gICAgY29uc3QgZXhwcmVzc2lvbkxlbmd0aCA9IHJhbmdlLmVuZC5jb2x1bW4gLSByYW5nZS5zdGFydC5jb2x1bW47XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LnN0eWxlLmxlZnQgPSAtKGV4cHJlc3Npb25MZW5ndGggKiBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKSArICAncHgnO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgIG1hcmtlcixcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgICBwb3NpdGlvbjogJ2hlYWQnLFxuICAgICAgICBpdGVtOiB0aGlzLl90eXBlSGludEVsZW1lbnQsXG4gICAgICB9XG4gICAgKTtcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICBtYXJrZXIsXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogJ251Y2xpZGUtdHlwZS1oaW50LWhpZ2hsaWdodC1yZWdpb24nLFxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxUeXBlSGludFByb3ZpZGVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpID0+IHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyR3JhbW1hcnMgPSBwcm92aWRlci5zZWxlY3Rvci5zcGxpdCgvLCA/Lyk7XG4gICAgICByZXR1cm4gcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgPiAwICYmIHByb3ZpZGVyR3JhbW1hcnMuaW5kZXhPZihzY29wZU5hbWUpICE9PSAtMTtcbiAgICB9KS5zb3J0KChwcm92aWRlckE6IFR5cGVIaW50UHJvdmlkZXIsIHByb3ZpZGVyQjogVHlwZUhpbnRQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eSAtIHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlSGludFByb3ZpZGVyKSB7XG4gICAgdGhpcy5fdHlwZUhpbnRQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogVHlwZUhpbnRQcm92aWRlcik6IHZvaWQge1xuICAgIGFycmF5LnJlbW92ZSh0aGlzLl90eXBlSGludFByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmhpZGVUeXBlaGludCgpO1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fdHlwZUhpbnRFbGVtZW50KTtcbiAgICB0aGlzLl90eXBlSGludEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlSGludE1hbmFnZXI7XG4iXX0=