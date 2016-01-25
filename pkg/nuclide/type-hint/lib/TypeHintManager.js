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

var _analytics = require('../../analytics');

var _require = require('atom');

var CompositeDisposable = _require.CompositeDisposable;
var Disposable = _require.Disposable;

var remove = require('../../commons').array.remove;

var TYPEHINT_DELAY_MS = 200;

var TypeHintManager = (function () {
  function TypeHintManager() {
    var _this = this;

    _classCallCheck(this, TypeHintManager);

    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-type-hint:toggle', function () {
      _this._typeHintToggle = !_this._typeHintToggle;
      if (_this._typeHintToggle) {
        var editor = atom.workspace.getActiveTextEditor();
        if (editor != null) {
          var position = editor.getCursorScreenPosition();
          _this._typeHintInEditor(editor, position);
        }
      } else {
        _this._typeHintElement.style.display = 'none';
      }
    }));

    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      // When the cursor moves the next time we do a toggle we should show the
      // new type hint
      _this._subscriptions.add(editor.onDidChangeCursorPosition(function () {
        _this._typeHintToggle = false;
      }));

      var editorView = atom.views.getView(editor);
      var mouseMoveListener = function mouseMoveListener(e) {
        _this._delayedTypeHint(e, editor, editorView);
      };
      editorView.addEventListener('mousemove', mouseMoveListener);
      var mouseListenerSubscription = new Disposable(function () {
        return editorView.removeEventListener('mousemove', mouseMoveListener);
      });
      var destroySubscription = editor.onDidDestroy(function () {
        _this._clearTypeHintTimer();
        mouseListenerSubscription.dispose();
        _this._subscriptions.remove(mouseListenerSubscription);
        _this._subscriptions.remove(destroySubscription);
      });
      _this._subscriptions.add(mouseListenerSubscription);
      _this._subscriptions.add(destroySubscription);
    }));
    this._typeHintProviders = [];
    this._typeHintElement = document.createElement('div');
    this._typeHintElement.className = 'nuclide-type-hint-overlay';
    this._marker = null;
    this._typeHintTimer = null;
    this._typeHintToggle = false;
  }

  _createClass(TypeHintManager, [{
    key: '_clearTypeHintTimer',
    value: function _clearTypeHintTimer() {
      clearTimeout(this._typeHintTimer);
      this._typeHintTimer = null;
    }
  }, {
    key: '_delayedTypeHint',
    value: function _delayedTypeHint(e, editor, editorView) {
      var _this2 = this;

      if (this._typeHintTimer) {
        this._clearTypeHintTimer();
      }
      this._typeHintTimer = setTimeout(function () {
        _this2._typeHintTimer = null;
        if (!editorView.component) {
          // The editor was destroyed, but the destroy handler haven't yet been called to cancel
          // the timer.
          return;
        }
        // Delay a bit + Cancel and schedule another update if the mouse keeps moving.
        var screenPosition = editorView.component.screenPositionForMouseEvent(e);
        var position = editor.bufferPositionForScreenPosition(screenPosition);
        _this2._typeHintInEditor(editor, position);
      }, TYPEHINT_DELAY_MS);
    }
  }, {
    key: '_typeHintInEditor',
    value: _asyncToGenerator(function* (editor, position) {
      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var matchingProviders = this._getMatchingProvidersForScopeName(scopeName);

      if (this._marker) {
        this._marker.destroy();
        this._marker = null;
      }

      if (!matchingProviders.length) {
        return;
      }

      var provider = matchingProviders[0];
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
      var range = typeHint.range;

      // For now, actual hint text is required.
      (0, _assert2['default'])(hint != null);

      // We track the timing above, but we still want to know the number of popups that are shown.
      (0, _analytics.track)('type-hint-popup', {
        'scope': scopeName,
        'message': hint
      });

      // Transform the matched element range to the hint range.
      var marker = editor.markBufferRange(range, { invalidate: 'never' });
      this._marker = marker;

      // This relative positioning is to work around the issue that `position: 'head'`
      // doesn't work for overlay decorators are rendered on the bottom right of the given range.
      // Atom issue: https://github.com/atom/atom/issues/6695
      var expressionLength = range.end.column - range.start.column;
      this._typeHintElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) + 'px';
      this._typeHintElement.style.top = -(2 * editor.getLineHeightInPixels()) + 'px';
      this._typeHintElement.textContent = hint;
      this._typeHintElement.style.display = 'block';
      editor.decorateMarker(marker, { type: 'overlay', position: 'head', item: this._typeHintElement });
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
      remove(this._typeHintProviders, provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
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
//# sourceMappingURL=data:application/json;base64,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QkFBaUIsR0FBRyxTQUFTLENBQUMsaUJBQWlCLENBQUM7T0FDbEUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLFFBQTBCLEVBQUU7QUFDdEMsVUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN4Qzs7O1dBRWEsd0JBQUMsUUFBMEIsRUFBUTtBQUMvQyxZQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQzNDOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQXhLRyxlQUFlOzs7QUEyS3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IlR5cGVIaW50TWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtUeXBlSGludFByb3ZpZGVyfSBmcm9tICcuLi8uLi90eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5jb25zdCB7cmVtb3ZlfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5hcnJheTtcblxuaW1wb3J0IHt0cmFjaywgdHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IFRZUEVISU5UX0RFTEFZX01TID0gMjAwO1xuXG5jbGFzcyBUeXBlSGludE1hbmFnZXIge1xuXG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX3R5cGVIaW50VGltZXI6ID9udW1iZXI7XG4gIF90eXBlSGludFRvZ2dsZTogYm9vbGVhbjtcbiAgX3R5cGVIaW50RWxlbWVudDogSFRNTEVsZW1lbnQ7XG5cbiAgX3R5cGVIaW50UHJvdmlkZXJzOiBBcnJheTxUeXBlSGludFByb3ZpZGVyPjtcbiAgLyoqXG4gICAqIFRoaXMgaGVscHMgZGV0ZXJtaW5lIGlmIHdlIHNob3VsZCBzaG93IHRoZSB0eXBlIGhpbnQgd2hlbiB0b2dnbGluZyBpdCB2aWFcbiAgICogY29tbWFuZC4gVGhlIHRvZ2dsZSBjb21tYW5kIGZpcnN0IG5lZ2F0ZXMgdGhpcywgYW5kIHRoZW4gaWYgdGhpcyBpcyB0cnVlXG4gICAqIHNob3dzIGEgdHlwZSBoaW50LCBvdGhlcndpc2UgaXQgaGlkZXMgdGhlIGN1cnJlbnQgdHlwZWhpbnQuXG4gICAqL1xuICBfdHlwZUhpbnRUb2dnbGU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbnVjbGlkZS10eXBlLWhpbnQ6dG9nZ2xlJyxcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5fdHlwZUhpbnRUb2dnbGUgPSAhdGhpcy5fdHlwZUhpbnRUb2dnbGU7XG4gICAgICAgIGlmICh0aGlzLl90eXBlSGludFRvZ2dsZSkge1xuICAgICAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgICAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLl90eXBlSGludEluRWRpdG9yKGVkaXRvciwgcG9zaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl90eXBlSGludEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICkpO1xuXG4gICAgLy8gVE9ETyhtb3N0KTogUmVwbGFjZSB3aXRoIEBqamlhYSdzIG1vdXNlTGlzdGVuZXJGb3JUZXh0RWRpdG9yIGludHJvZHVjZWQgaW4gRDIwMDU1NDUuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBjdXJzb3IgbW92ZXMgdGhlIG5leHQgdGltZSB3ZSBkbyBhIHRvZ2dsZSB3ZSBzaG91bGQgc2hvdyB0aGVcbiAgICAgIC8vIG5ldyB0eXBlIGhpbnRcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5fdHlwZUhpbnRUb2dnbGUgPSBmYWxzZTtcbiAgICAgIH0pKTtcblxuICAgICAgY29uc3QgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICAgICAgY29uc3QgbW91c2VNb3ZlTGlzdGVuZXIgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLl9kZWxheWVkVHlwZUhpbnQoKChlOiBhbnkpOiBNb3VzZUV2ZW50KSwgZWRpdG9yLCBlZGl0b3JWaWV3KTtcbiAgICAgIH07XG4gICAgICBlZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZUxpc3RlbmVyKTtcbiAgICAgIGNvbnN0IG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgICAgICAgIGVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlTGlzdGVuZXIpKTtcbiAgICAgIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgdGhpcy5fY2xlYXJUeXBlSGludFRpbWVyKCk7XG4gICAgICAgIG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgfSkpO1xuICAgIHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzID0gW107XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LmNsYXNzTmFtZSA9ICdudWNsaWRlLXR5cGUtaGludC1vdmVybGF5JztcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX3R5cGVIaW50VGltZXIgPSBudWxsO1xuICAgIHRoaXMuX3R5cGVIaW50VG9nZ2xlID0gZmFsc2U7XG4gIH1cblxuICBfY2xlYXJUeXBlSGludFRpbWVyKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl90eXBlSGludFRpbWVyKTtcbiAgICB0aGlzLl90eXBlSGludFRpbWVyID0gbnVsbDtcbiAgfVxuXG4gIF9kZWxheWVkVHlwZUhpbnQoZTogTW91c2VFdmVudCwgZWRpdG9yOiBUZXh0RWRpdG9yLCBlZGl0b3JWaWV3OiBIVE1MRWxlbWVudCkge1xuICAgIGlmICh0aGlzLl90eXBlSGludFRpbWVyKSB7XG4gICAgICB0aGlzLl9jbGVhclR5cGVIaW50VGltZXIoKTtcbiAgICB9XG4gICAgdGhpcy5fdHlwZUhpbnRUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fdHlwZUhpbnRUaW1lciA9IG51bGw7XG4gICAgICBpZiAoIWVkaXRvclZpZXcuY29tcG9uZW50KSB7XG4gICAgICAgIC8vIFRoZSBlZGl0b3Igd2FzIGRlc3Ryb3llZCwgYnV0IHRoZSBkZXN0cm95IGhhbmRsZXIgaGF2ZW4ndCB5ZXQgYmVlbiBjYWxsZWQgdG8gY2FuY2VsXG4gICAgICAgIC8vIHRoZSB0aW1lci5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gRGVsYXkgYSBiaXQgKyBDYW5jZWwgYW5kIHNjaGVkdWxlIGFub3RoZXIgdXBkYXRlIGlmIHRoZSBtb3VzZSBrZWVwcyBtb3ZpbmcuXG4gICAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IGVkaXRvclZpZXcuY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChlKTtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICAgICAgdGhpcy5fdHlwZUhpbnRJbkVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgICB9LCBUWVBFSElOVF9ERUxBWV9NUyk7XG4gIH1cblxuICBhc3luYyBfdHlwZUhpbnRJbkVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZSB7XG4gICAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IG1hdGNoaW5nUHJvdmlkZXJzID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcblxuICAgIGlmICh0aGlzLl9tYXJrZXIpIHtcbiAgICAgIHRoaXMuX21hcmtlci5kZXN0cm95KCk7XG4gICAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICghbWF0Y2hpbmdQcm92aWRlcnMubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcHJvdmlkZXIgPSBtYXRjaGluZ1Byb3ZpZGVyc1swXTtcbiAgICBsZXQgbmFtZTtcbiAgICBpZiAocHJvdmlkZXIucHJvdmlkZXJOYW1lICE9IG51bGwpIHtcbiAgICAgIG5hbWUgPSBwcm92aWRlci5wcm92aWRlck5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5hbWUgPSAndW5rbm93bic7XG4gICAgICBjb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgICBsb2dnZXIuZXJyb3IoJ1R5cGUgaGludCBwcm92aWRlciBoYXMgbm8gbmFtZScsIHByb3ZpZGVyKTtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlSGludCA9IGF3YWl0IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgbmFtZSArICcudHlwZUhpbnQnLFxuICAgICAgKCkgPT4gcHJvdmlkZXIudHlwZUhpbnQoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgKTtcbiAgICBpZiAoIXR5cGVIaW50IHx8IHRoaXMuX21hcmtlcikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHtoaW50LCByYW5nZX0gPSB0eXBlSGludDtcbiAgICAvLyBGb3Igbm93LCBhY3R1YWwgaGludCB0ZXh0IGlzIHJlcXVpcmVkLlxuICAgIGludmFyaWFudChoaW50ICE9IG51bGwpO1xuXG4gICAgLy8gV2UgdHJhY2sgdGhlIHRpbWluZyBhYm92ZSwgYnV0IHdlIHN0aWxsIHdhbnQgdG8ga25vdyB0aGUgbnVtYmVyIG9mIHBvcHVwcyB0aGF0IGFyZSBzaG93bi5cbiAgICB0cmFjaygndHlwZS1oaW50LXBvcHVwJywge1xuICAgICAgJ3Njb3BlJzogc2NvcGVOYW1lLFxuICAgICAgJ21lc3NhZ2UnOiBoaW50LFxuICAgIH0pO1xuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBtYXRjaGVkIGVsZW1lbnQgcmFuZ2UgdG8gdGhlIGhpbnQgcmFuZ2UuXG4gICAgY29uc3QgbWFya2VyOiBhdG9tJE1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgLy8gVGhpcyByZWxhdGl2ZSBwb3NpdGlvbmluZyBpcyB0byB3b3JrIGFyb3VuZCB0aGUgaXNzdWUgdGhhdCBgcG9zaXRpb246ICdoZWFkJ2BcbiAgICAvLyBkb2Vzbid0IHdvcmsgZm9yIG92ZXJsYXkgZGVjb3JhdG9ycyBhcmUgcmVuZGVyZWQgb24gdGhlIGJvdHRvbSByaWdodCBvZiB0aGUgZ2l2ZW4gcmFuZ2UuXG4gICAgLy8gQXRvbSBpc3N1ZTogaHR0cHM6Ly9naXRodWIuY29tL2F0b20vYXRvbS9pc3N1ZXMvNjY5NVxuICAgIGNvbnN0IGV4cHJlc3Npb25MZW5ndGggPSByYW5nZS5lbmQuY29sdW1uIC0gcmFuZ2Uuc3RhcnQuY29sdW1uO1xuICAgIHRoaXMuX3R5cGVIaW50RWxlbWVudC5zdHlsZS5sZWZ0ID0gLShleHByZXNzaW9uTGVuZ3RoICogZWRpdG9yLmdldERlZmF1bHRDaGFyV2lkdGgoKSkgKyAgJ3B4JztcbiAgICB0aGlzLl90eXBlSGludEVsZW1lbnQuc3R5bGUudG9wID0gLSgyICogZWRpdG9yLmdldExpbmVIZWlnaHRJblBpeGVscygpKSArICdweCc7XG4gICAgdGhpcy5fdHlwZUhpbnRFbGVtZW50LnRleHRDb250ZW50ID0gaGludDtcbiAgICB0aGlzLl90eXBlSGludEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge3R5cGU6ICdvdmVybGF5JywgcG9zaXRpb246ICdoZWFkJywgaXRlbTogdGhpcy5fdHlwZUhpbnRFbGVtZW50fVxuICAgICk7XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxUeXBlSGludFByb3ZpZGVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVIaW50UHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpID0+IHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyR3JhbW1hcnMgPSBwcm92aWRlci5zZWxlY3Rvci5zcGxpdCgvLCA/Lyk7XG4gICAgICByZXR1cm4gcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgPiAwICYmIHByb3ZpZGVyR3JhbW1hcnMuaW5kZXhPZihzY29wZU5hbWUpICE9PSAtMTtcbiAgICB9KS5zb3J0KChwcm92aWRlckE6IFR5cGVIaW50UHJvdmlkZXIsIHByb3ZpZGVyQjogVHlwZUhpbnRQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eSAtIHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlSGludFByb3ZpZGVyKSB7XG4gICAgdGhpcy5fdHlwZUhpbnRQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogVHlwZUhpbnRQcm92aWRlcik6IHZvaWQge1xuICAgIHJlbW92ZSh0aGlzLl90eXBlSGludFByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVIaW50TWFuYWdlcjtcbiJdfQ==