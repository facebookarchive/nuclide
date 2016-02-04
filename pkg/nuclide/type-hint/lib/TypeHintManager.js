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

      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_TypeHintComponent.TypeHintComponent, { content: hintTree || hint }), this._typeHintElement);
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
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._typeHintElement);
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
//# sourceMappingURL=data:application/json;base64,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QixFQUFRO0FBQy9DLHFCQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDakQ7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLDZCQUFTLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvQixVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0FqTkcsZUFBZTs7O0FBb05yQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJUeXBlSGludE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXksIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQge1R5cGVIaW50Q29tcG9uZW50fSBmcm9tICcuL1R5cGVIaW50Q29tcG9uZW50JztcblxuY29uc3QgVFlQRUhJTlRfREVMQVlfTVMgPSA1MDtcblxuY2xhc3MgVHlwZUhpbnRNYW5hZ2VyIHtcblxuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF90eXBlSGludEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfY3VycmVudFJhbmdlOiA/YXRvbSRSYW5nZTtcbiAgX2lzSG92ZXJpbmdUeXBlaGludDogYm9vbGVhbjtcbiAgX3R5cGVIaW50UHJvdmlkZXJzOiBBcnJheTxUeXBlSGludFByb3ZpZGVyPjtcbiAgLyoqXG4gICAqIFRoaXMgaGVscHMgZGV0ZXJtaW5lIGlmIHdlIHNob3VsZCBzaG93IHRoZSB0eXBlIGhpbnQgd2hlbiB0b2dnbGluZyBpdCB2aWFcbiAgICogY29tbWFuZC4gVGhlIHRvZ2dsZSBjb21tYW5kIGZpcnN0IG5lZ2F0ZXMgdGhpcywgYW5kIHRoZW4gaWYgdGhpcyBpcyB0cnVlXG4gICAqIHNob3dzIGEgdHlwZSBoaW50LCBvdGhlcndpc2UgaXQgaGlkZXMgdGhlIGN1cnJlbnQgdHlwZWhpbnQuXG4gICAqL1xuICBfdHlwZUhpbnRUb2dnbGU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbnVjbGlkZS10eXBlLWhpbnQ6dG9nZ2xlJyxcbiAgICAgIHRoaXMudG9nZ2xlVHlwZWhpbnQuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2NvcmU6Y2FuY2VsJyxcbiAgICAgIHRoaXMuaGlkZVR5cGVoaW50LmJpbmQodGhpcylcbiAgICApKTtcblxuICAgIC8vIFRPRE8obW9zdCk6IFJlcGxhY2Ugd2l0aCBAamppYWEncyBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvciBpbnRyb2R1Y2VkIGluIEQyMDA1NTQ1LlxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgY3Vyc29yIG1vdmVzIHRoZSBuZXh0IHRpbWUgd2UgZG8gYSB0b2dnbGUgd2Ugc2hvdWxkIHNob3cgdGhlXG4gICAgICAvLyBuZXcgdHlwZSBoaW50XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX3R5cGVIaW50VG9nZ2xlID0gZmFsc2U7XG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcbiAgICAgIGNvbnN0IG1vdXNlTW92ZUxpc3RlbmVyID0gZGVib3VuY2UoXG4gICAgICAgIChlKSA9PiB7dGhpcy5fdHlwZWhpbnRGb3JNb3VzZUV2ZW50KCgoZTogYW55KTogTW91c2VFdmVudCksIGVkaXRvciwgZWRpdG9yVmlldyk7fSxcbiAgICAgICAgVFlQRUhJTlRfREVMQVlfTVMsXG4gICAgICAgIC8qIGltbWVkaWF0ZSAqLyBmYWxzZSxcbiAgICAgICk7XG4gICAgICBlZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZUxpc3RlbmVyKTtcbiAgICAgIGNvbnN0IG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgICAgICAgIGVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlTGlzdGVuZXIpKTtcbiAgICAgIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgbW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICB9KSk7XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LmNsYXNzTmFtZSA9ICdudWNsaWRlLXR5cGUtaGludC1vdmVybGF5JztcblxuICAgIGNvbnN0IHR5cGVoaW50TW91c2VFbnRlciA9IGV2ZW50ID0+IHRoaXMuX2hhbmRsZUVsZW1lbnRNb3VzZUVudGVyKGV2ZW50KTtcbiAgICBjb25zdCB0eXBlaGludE1vdXNlTGVhdmUgPSBldmVudCA9PiB0aGlzLl9oYW5kbGVFbGVtZW50TW91c2VMZWF2ZShldmVudCk7XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCB0eXBlaGludE1vdXNlRW50ZXIpO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgdHlwZWhpbnRNb3VzZUxlYXZlKTtcblxuICAgIHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzID0gW107XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl90eXBlSGludFRvZ2dsZSA9IGZhbHNlO1xuICAgIHRoaXMuX2N1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgdGhpcy5faXNIb3ZlcmluZ1R5cGVoaW50ID0gZmFsc2U7XG4gIH1cblxuICB0b2dnbGVUeXBlaGludCgpOiB2b2lkIHtcbiAgICB0aGlzLl90eXBlSGludFRvZ2dsZSA9ICF0aGlzLl90eXBlSGludFRvZ2dsZTtcbiAgICBpZiAodGhpcy5fdHlwZUhpbnRUb2dnbGUpIHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIGlmIChlZGl0b3IgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpO1xuICAgICAgICB0aGlzLl90eXBlSGludEluRWRpdG9yKGVkaXRvciwgcG9zaXRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhpZGVUeXBlaGludCgpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGVUeXBlaGludCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbWFya2VyID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGhpcy5fbWFya2VyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgdGhpcy5faXNIb3ZlcmluZ1R5cGVoaW50ID0gZmFsc2U7XG4gIH1cblxuICBfaGFuZGxlRWxlbWVudE1vdXNlRW50ZXIoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNIb3ZlcmluZ1R5cGVoaW50ID0gdHJ1ZTtcbiAgfVxuXG4gIF9oYW5kbGVFbGVtZW50TW91c2VMZWF2ZShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nVHlwZWhpbnQgPSBmYWxzZTtcbiAgfVxuXG4gIF90eXBlaGludEZvck1vdXNlRXZlbnQoZTogTW91c2VFdmVudCwgZWRpdG9yOiBUZXh0RWRpdG9yLCBlZGl0b3JWaWV3OiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghZWRpdG9yVmlldy5jb21wb25lbnQpIHtcbiAgICAgIC8vIFRoZSBlZGl0b3Igd2FzIGRlc3Ryb3llZCwgYnV0IHRoZSBkZXN0cm95IGhhbmRsZXIgaGF2ZW4ndCB5ZXQgYmVlbiBjYWxsZWQgdG8gY2FuY2VsXG4gICAgICAvLyB0aGUgdGltZXIuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gZWRpdG9yVmlldy5jb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGUpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICAgIHRoaXMuX3R5cGVIaW50SW5FZGl0b3IoZWRpdG9yLCBwb3NpdGlvbik7XG4gIH1cblxuICBhc3luYyBfdHlwZUhpbnRJbkVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZSB7XG4gICAgaWYgKHRoaXMuX2lzSG92ZXJpbmdUeXBlaGludCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jdXJyZW50UmFuZ2UgIT0gbnVsbCAmJiB0aGlzLl9jdXJyZW50UmFuZ2UuY29udGFpbnNQb2ludChwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbWFya2VyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuaGlkZVR5cGVoaW50KCk7XG4gICAgfVxuXG4gICAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IFtwcm92aWRlcl0gPSB0aGlzLl9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWUpO1xuICAgIGlmIChwcm92aWRlciA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBuYW1lO1xuICAgIGlmIChwcm92aWRlci5wcm92aWRlck5hbWUgIT0gbnVsbCkge1xuICAgICAgbmFtZSA9IHByb3ZpZGVyLnByb3ZpZGVyTmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9ICd1bmtub3duJztcbiAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgIGxvZ2dlci5lcnJvcignVHlwZSBoaW50IHByb3ZpZGVyIGhhcyBubyBuYW1lJywgcHJvdmlkZXIpO1xuICAgIH1cbiAgICBjb25zdCB0eXBlSGludCA9IGF3YWl0IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgbmFtZSArICcudHlwZUhpbnQnLFxuICAgICAgKCkgPT4gcHJvdmlkZXIudHlwZUhpbnQoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgKTtcbiAgICBpZiAoIXR5cGVIaW50IHx8IHRoaXMuX21hcmtlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtoaW50LCBoaW50VHJlZSwgcmFuZ2V9ID0gdHlwZUhpbnQ7XG4gICAgLy8gRm9yIG5vdywgYWN0dWFsIGhpbnQgdGV4dCBpcyByZXF1aXJlZC5cbiAgICBpbnZhcmlhbnQoaGludCAhPSBudWxsKTtcbiAgICAvLyBXZSB0cmFjayB0aGUgdGltaW5nIGFib3ZlLCBidXQgd2Ugc3RpbGwgd2FudCB0byBrbm93IHRoZSBudW1iZXIgb2YgcG9wdXBzIHRoYXQgYXJlIHNob3duLlxuICAgIHRyYWNrKCd0eXBlLWhpbnQtcG9wdXAnLCB7XG4gICAgICAnc2NvcGUnOiBzY29wZU5hbWUsXG4gICAgICAnbWVzc2FnZSc6IGhpbnQsXG4gICAgfSk7XG4gICAgdGhpcy5fY3VycmVudFJhbmdlID0gcmFuZ2U7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIG1hdGNoZWQgZWxlbWVudCByYW5nZSB0byB0aGUgaGludCByYW5nZS5cbiAgICBjb25zdCBtYXJrZXI6IGF0b20kTWFya2VyID0gZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShyYW5nZSwge2ludmFsaWRhdGU6ICduZXZlcid9KTtcbiAgICB0aGlzLl9tYXJrZXIgPSBtYXJrZXI7XG5cbiAgICBSZWFjdERPTS5yZW5kZXIoXG4gICAgICA8VHlwZUhpbnRDb21wb25lbnQgY29udGVudD17aGludFRyZWUgfHwgaGludH0gLz4sXG4gICAgICB0aGlzLl90eXBlSGludEVsZW1lbnRcbiAgICApO1xuICAgIC8vIFRoaXMgcmVsYXRpdmUgcG9zaXRpb25pbmcgaXMgdG8gd29yayBhcm91bmQgdGhlIGlzc3VlIHRoYXQgYHBvc2l0aW9uOiAnaGVhZCdgXG4gICAgLy8gZG9lc24ndCB3b3JrIGZvciBvdmVybGF5IGRlY29yYXRvcnMgYXJlIHJlbmRlcmVkIG9uIHRoZSBib3R0b20gcmlnaHQgb2YgdGhlIGdpdmVuIHJhbmdlLlxuICAgIC8vIEF0b20gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY2OTVcbiAgICBjb25zdCBleHByZXNzaW9uTGVuZ3RoID0gcmFuZ2UuZW5kLmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtbjtcbiAgICB0aGlzLl90eXBlSGludEVsZW1lbnQuc3R5bGUubGVmdCA9IC0oZXhwcmVzc2lvbkxlbmd0aCAqIGVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKCkpICsgICdweCc7XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgIHBvc2l0aW9uOiAnaGVhZCcsXG4gICAgICAgIGl0ZW06IHRoaXMuX3R5cGVIaW50RWxlbWVudCxcbiAgICAgIH1cbiAgICApO1xuICAgIGVkaXRvci5kZWNvcmF0ZU1hcmtlcihcbiAgICAgIG1hcmtlcixcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ2hpZ2hsaWdodCcsXG4gICAgICAgIGNsYXNzOiAnbnVjbGlkZS10eXBlLWhpbnQtaGlnaGxpZ2h0LXJlZ2lvbicsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIF9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWU6IHN0cmluZyk6IEFycmF5PFR5cGVIaW50UHJvdmlkZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUhpbnRQcm92aWRlcnMuZmlsdGVyKChwcm92aWRlcjogVHlwZUhpbnRQcm92aWRlcikgPT4ge1xuICAgICAgY29uc3QgcHJvdmlkZXJHcmFtbWFycyA9IHByb3ZpZGVyLnNlbGVjdG9yLnNwbGl0KC8sID8vKTtcbiAgICAgIHJldHVybiBwcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA+IDAgJiYgcHJvdmlkZXJHcmFtbWFycy5pbmRleE9mKHNjb3BlTmFtZSkgIT09IC0xO1xuICAgIH0pLnNvcnQoKHByb3ZpZGVyQTogVHlwZUhpbnRQcm92aWRlciwgcHJvdmlkZXJCOiBUeXBlSGludFByb3ZpZGVyKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJBLmluY2x1c2lvblByaW9yaXR5IC0gcHJvdmlkZXJCLmluY2x1c2lvblByaW9yaXR5O1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpIHtcbiAgICB0aGlzLl90eXBlSGludFByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgfVxuXG4gIHJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlSGludFByb3ZpZGVyKTogdm9pZCB7XG4gICAgYXJyYXkucmVtb3ZlKHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzLCBwcm92aWRlcik7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuaGlkZVR5cGVoaW50KCk7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl90eXBlSGludEVsZW1lbnQpO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5yZW1vdmUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVIaW50TWFuYWdlcjtcbiJdfQ==