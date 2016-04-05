var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom = require('react-for-atom');

var _QuickSelectionComponent = require('./QuickSelectionComponent');

var _QuickSelectionComponent2 = _interopRequireDefault(_QuickSelectionComponent);

var _atom = require('atom');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

function getSearchResultManager() {
  return require('./SearchResultManager')['default'].getInstance();
}

var DEFAULT_PROVIDER = 'OmniSearchResultProvider';
var TOPBAR_APPROX_HEIGHT = 100; // A reasonable heuristic that prevents us from having to measure.
var MODAL_MARGIN = 32;
// don't pre-fill search input if selection is longer than this
var MAX_SELECTION_LENGTH = 1000;

/**
 * A "session" for the purpose of analytics. It exists from the moment the quick-open UI becomes
 * visible until it gets closed, either via file selection or cancellation.
 */
var analyticsSessionId = null;
var AnalyticsEvents = Object.freeze({
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB: 'quickopen-change-tab',
  CLOSE_PANEL: 'quickopen-close-panel',
  OPEN_PANEL: 'quickopen-open-panel',
  SELECT_FILE: 'quickopen-select-file'
});
var AnalyticsDebounceDelays = Object.freeze({
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100
});

var trackProviderChange = (0, _nuclideCommons.debounce)(function (providerName) {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  (0, _nuclideAnalytics.track)(AnalyticsEvents.CHANGE_TAB, {
    'quickopen-provider': providerName,
    'quickopen-session': analyticsSessionId
  });
}, AnalyticsDebounceDelays.CHANGE_TAB);

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._previousFocus = null;
    this._maxScrollableAreaHeight = 10000;
    this._subscriptions = new _atom.CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    var QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
    QuickSelectionDispatcher.getInstance().register(function (action) {
      if (action.actionType === QuickSelectionDispatcher.ActionType.ACTIVE_PROVIDER_CHANGED) {
        _this.toggleProvider(action.providerName);
        _this._render();
      }
    });
    this._reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({ item: this._reactDiv, visible: false });
    this._debouncedUpdateModalPosition = (0, _nuclideCommons.debounce)(this._updateScrollableHeight.bind(this), 200);
    window.addEventListener('resize', this._debouncedUpdateModalPosition);
    this._customizeModalElement();
    this._updateScrollableHeight();

    this._searchComponent = this._render();

    this._searchComponent.onSelection(function (selection) {
      var options = {};
      if (selection.line) {
        options.initialLine = selection.line;
      }
      if (selection.column) {
        options.initialColumn = selection.column;
      }

      atom.workspace.open(selection.path, options).then(function (textEditor) {
        atom.commands.dispatch(atom.views.getView(textEditor), 'tabs:keep-preview-tab');
      });

      var query = _this._searchComponent.getInputTextEditor().textContent;
      var providerName = _this._currentProvider.name;
      // default to empty string because `track` enforces string-only values
      var sourceProvider = selection.sourceProvider || '';
      (0, _nuclideAnalytics.track)(AnalyticsEvents.SELECT_FILE, {
        'quickopen-filepath': selection.path,
        'quickopen-query': query,
        'quickopen-provider': providerName, // The currently open "tab".
        'quickopen-session': analyticsSessionId || '',
        // Because the `provider` is usually OmniSearch, also track the original provider.
        'quickopen-provider-source': sourceProvider
      });
      _this.closeSearchPanel();
    });

    this._subscriptions.add(atom.commands.add('body', 'core:cancel', function () {
      if (_this._searchPanel && _this._searchPanel.isVisible()) {
        _this.closeSearchPanel();
      }
    }));

    this._searchComponent.onCancellation(function () {
      return _this.closeSearchPanel();
    });
    this._searchComponent.onSelectionChanged((0, _nuclideCommons.debounce)(function (selection) {
      // Only track user-initiated selection-change events.
      if (analyticsSessionId != null) {
        (0, _nuclideAnalytics.track)(AnalyticsEvents.CHANGE_SELECTION, {
          'quickopen-selected-index': selection.selectedItemIndex.toString(),
          'quickopen-selected-service': selection.selectedService,
          'quickopen-selected-directory': selection.selectedDirectory,
          'quickopen-session': analyticsSessionId
        });
      }
    }, AnalyticsDebounceDelays.CHANGE_SELECTION));
  }

  // Customize the element containing the modal.

  _createClass(Activation, [{
    key: '_customizeModalElement',
    value: function _customizeModalElement() {
      var modalElement = this._searchPanel.getItem().parentNode;
      modalElement.style.setProperty('margin-left', '0');
      modalElement.style.setProperty('width', 'auto');
      modalElement.style.setProperty('left', MODAL_MARGIN + 'px');
      modalElement.style.setProperty('right', MODAL_MARGIN + 'px');
    }
  }, {
    key: '_updateScrollableHeight',
    value: function _updateScrollableHeight() {
      var _document$documentElement$getBoundingClientRect = document.documentElement.getBoundingClientRect();

      var height = _document$documentElement$getBoundingClientRect.height;

      this._maxScrollableAreaHeight = height - MODAL_MARGIN - TOPBAR_APPROX_HEIGHT;
      // Force a re-render to update _maxScrollableAreaHeight.
      this._searchComponent = this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      return _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_QuickSelectionComponent2['default'], {
        activeProvider: this._currentProvider,
        onProviderChange: this.handleActiveProviderChange.bind(this),
        maxScrollableAreaHeight: this._maxScrollableAreaHeight
      }), this._reactDiv);
    }
  }, {
    key: 'handleActiveProviderChange',
    value: function handleActiveProviderChange(newProviderName) {
      trackProviderChange(newProviderName);
      this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
      this._searchComponent = this._render();
    }
  }, {
    key: 'toggleOmniSearchProvider',
    value: function toggleOmniSearchProvider() {
      require('./QuickSelectionActions').changeActiveProvider('OmniSearchResultProvider');
    }
  }, {
    key: 'toggleProvider',
    value: function toggleProvider(providerName) {
      analyticsSessionId = analyticsSessionId || Date.now().toString();
      (0, _nuclideAnalytics.track)(AnalyticsEvents.CHANGE_TAB, {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId
      });
      var provider = getSearchResultManager().getProviderByName(providerName);
      // "toggle" behavior
      if (this._searchPanel !== null && this._searchPanel.isVisible() && providerName === this._currentProvider.name) {
        this.closeSearchPanel();
        return;
      }

      this._currentProvider = provider;
      if (this._searchComponent) {
        this._searchComponent = this._render();
      }
      this.showSearchPanel();
    }
  }, {
    key: 'showSearchPanel',
    value: function showSearchPanel() {
      this._previousFocus = document.activeElement;
      if (this._searchComponent && this._searchPanel) {
        // Start a new search "session" for analytics purposes.
        (0, _nuclideAnalytics.track)(AnalyticsEvents.OPEN_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        // showSearchPanel gets called when changing providers even if it's already shown.
        var isAlreadyVisible = this._searchPanel.isVisible();
        this._searchPanel.show();
        this._searchComponent.focus();
        if (_nuclideFeatureConfig2['default'].get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
          var selectedText = this._getFirstSelectionText();
          if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
            this._searchComponent.setInputValue(selectedText.split('\n')[0]);
          }
        }
        this._searchComponent.selectInput();
      }
    }
  }, {
    key: 'closeSearchPanel',
    value: function closeSearchPanel() {
      if (this._searchComponent && this._searchPanel) {
        (0, _nuclideAnalytics.track)(AnalyticsEvents.CLOSE_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        this._searchPanel.hide();
        this._searchComponent.blur();
        analyticsSessionId = null;
      }

      if (this._previousFocus != null) {
        this._previousFocus.focus();
        this._previousFocus = null;
      }
    }
  }, {
    key: '_getFirstSelectionText',
    value: function _getFirstSelectionText() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        return editor.getSelections()[0].getText();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
  }
  return activation;
}

var listeners = null;

module.exports = {
  activate: function activate() {
    listeners = new _atom.CompositeDisposable();
    listeners.add(atom.commands.add('atom-workspace', {
      'nuclide-quick-open:find-anything-via-omni-search': function nuclideQuickOpenFindAnythingViaOmniSearch() {
        getActivation().toggleOmniSearchProvider();
      }
    }));
    getActivation();
  },

  registerProvider: function registerProvider(service) {
    return getSearchResultManager().registerProvider(service);
  },

  registerStore: function registerStore() {
    return getSearchResultManager();
  },

  getHomeFragments: function getHomeFragments() {
    return {
      feature: {
        title: 'Quick Open',
        icon: 'search',
        description: 'A powerful search box to quickly find local and remote files and content.',
        command: 'nuclide-quick-open:find-anything-via-omni-search'
      },
      priority: 10
    };
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
    if (listeners) {
      listeners.dispose();
      listeners = null;
    }
    getSearchResultManager().dispose();
  }
};
//# sourceMappingURL=data:application/json;base64,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S0FDbkI7QUFDRCxRQUFJLFNBQVMsRUFBRTtBQUNiLGVBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNwQixlQUFTLEdBQUcsSUFBSSxDQUFDO0tBQ2xCO0FBQ0QsMEJBQXNCLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztHQUNwQztDQUNGLENBQUMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhvbWUtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50IGZyb20gJy4vUXVpY2tTZWxlY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtkZWJvdW5jZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuZnVuY3Rpb24gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vU2VhcmNoUmVzdWx0TWFuYWdlcicpLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbn1cblxuY29uc3QgREVGQVVMVF9QUk9WSURFUiA9ICdPbW5pU2VhcmNoUmVzdWx0UHJvdmlkZXInO1xuY29uc3QgVE9QQkFSX0FQUFJPWF9IRUlHSFQgPSAxMDA7IC8vIEEgcmVhc29uYWJsZSBoZXVyaXN0aWMgdGhhdCBwcmV2ZW50cyB1cyBmcm9tIGhhdmluZyB0byBtZWFzdXJlLlxuY29uc3QgTU9EQUxfTUFSR0lOID0gMzI7XG4vLyBkb24ndCBwcmUtZmlsbCBzZWFyY2ggaW5wdXQgaWYgc2VsZWN0aW9uIGlzIGxvbmdlciB0aGFuIHRoaXNcbmNvbnN0IE1BWF9TRUxFQ1RJT05fTEVOR1RIID0gMTAwMDtcblxuLyoqXG4gKiBBIFwic2Vzc2lvblwiIGZvciB0aGUgcHVycG9zZSBvZiBhbmFseXRpY3MuIEl0IGV4aXN0cyBmcm9tIHRoZSBtb21lbnQgdGhlIHF1aWNrLW9wZW4gVUkgYmVjb21lc1xuICogdmlzaWJsZSB1bnRpbCBpdCBnZXRzIGNsb3NlZCwgZWl0aGVyIHZpYSBmaWxlIHNlbGVjdGlvbiBvciBjYW5jZWxsYXRpb24uXG4gKi9cbmxldCBhbmFseXRpY3NTZXNzaW9uSWQgPSBudWxsO1xuY29uc3QgQW5hbHl0aWNzRXZlbnRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIENIQU5HRV9TRUxFQ1RJT046ICdxdWlja29wZW4tY2hhbmdlLXNlbGVjdGlvbicsXG4gIENIQU5HRV9UQUI6ICAgICAgICdxdWlja29wZW4tY2hhbmdlLXRhYicsXG4gIENMT1NFX1BBTkVMOiAgICAgICdxdWlja29wZW4tY2xvc2UtcGFuZWwnLFxuICBPUEVOX1BBTkVMOiAgICAgICAncXVpY2tvcGVuLW9wZW4tcGFuZWwnLFxuICBTRUxFQ1RfRklMRTogICAgICAncXVpY2tvcGVuLXNlbGVjdC1maWxlJyxcbn0pO1xuY29uc3QgQW5hbHl0aWNzRGVib3VuY2VEZWxheXMgPSBPYmplY3QuZnJlZXplKHtcbiAgQ0hBTkdFX1RBQjogMTAwLFxuICBDSEFOR0VfU0VMRUNUSU9OOiAxMDAsXG59KTtcblxuY29uc3QgdHJhY2tQcm92aWRlckNoYW5nZSA9IGRlYm91bmNlKHByb3ZpZGVyTmFtZSA9PiB7XG4gIGFuYWx5dGljc1Nlc3Npb25JZCA9IGFuYWx5dGljc1Nlc3Npb25JZCB8fCBEYXRlLm5vdygpLnRvU3RyaW5nKCk7XG4gIHRyYWNrKFxuICAgIEFuYWx5dGljc0V2ZW50cy5DSEFOR0VfVEFCLFxuICAgIHtcbiAgICAgICdxdWlja29wZW4tcHJvdmlkZXInOiBwcm92aWRlck5hbWUsXG4gICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQsXG4gICAgfVxuICApO1xufSwgQW5hbHl0aWNzRGVib3VuY2VEZWxheXMuQ0hBTkdFX1RBQik7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfY3VycmVudFByb3ZpZGVyOiBPYmplY3Q7XG4gIF9wcmV2aW91c0ZvY3VzOiA/SFRNTEVsZW1lbnQ7XG4gIF9yZWFjdERpdjogSFRNTEVsZW1lbnQ7XG4gIF9zZWFyY2hDb21wb25lbnQ6IFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50O1xuICBfc2VhcmNoUGFuZWw6IGF0b20kUGFuZWw7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kZWJvdW5jZWRVcGRhdGVNb2RhbFBvc2l0aW9uOiAoKSA9PiB2b2lkO1xuICBfbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gbnVsbDtcbiAgICB0aGlzLl9tYXhTY3JvbGxhYmxlQXJlYUhlaWdodCA9IDEwMDAwO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2N1cnJlbnRQcm92aWRlciA9IGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKS5nZXRQcm92aWRlckJ5TmFtZShERUZBVUxUX1BST1ZJREVSKTtcbiAgICBjb25zdCBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIgPSByZXF1aXJlKCcuL1F1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlcicpO1xuICAgIFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpLnJlZ2lzdGVyKGFjdGlvbiA9PiB7XG4gICAgICBpZiAoYWN0aW9uLmFjdGlvblR5cGUgPT09IFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5BY3Rpb25UeXBlLkFDVElWRV9QUk9WSURFUl9DSEFOR0VEKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlUHJvdmlkZXIoYWN0aW9uLnByb3ZpZGVyTmFtZSk7XG4gICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3JlYWN0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fc2VhcmNoUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiB0aGlzLl9yZWFjdERpdiwgdmlzaWJsZTogZmFsc2V9KTtcbiAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVNb2RhbFBvc2l0aW9uID0gZGVib3VuY2UodGhpcy5fdXBkYXRlU2Nyb2xsYWJsZUhlaWdodC5iaW5kKHRoaXMpLCAyMDApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9kZWJvdW5jZWRVcGRhdGVNb2RhbFBvc2l0aW9uKTtcbiAgICB0aGlzLl9jdXN0b21pemVNb2RhbEVsZW1lbnQoKTtcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxhYmxlSGVpZ2h0KCk7XG5cbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQgPSB0aGlzLl9yZW5kZXIoKTtcblxuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5vblNlbGVjdGlvbihzZWxlY3Rpb24gPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuICAgICAgaWYgKHNlbGVjdGlvbi5saW5lKSB7XG4gICAgICAgIG9wdGlvbnMuaW5pdGlhbExpbmUgPSBzZWxlY3Rpb24ubGluZTtcbiAgICAgIH1cbiAgICAgIGlmIChzZWxlY3Rpb24uY29sdW1uKSB7XG4gICAgICAgIG9wdGlvbnMuaW5pdGlhbENvbHVtbiA9IHNlbGVjdGlvbi5jb2x1bW47XG4gICAgICB9XG5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oc2VsZWN0aW9uLnBhdGgsIG9wdGlvbnMpLnRoZW4odGV4dEVkaXRvciA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpLCAndGFiczprZWVwLXByZXZpZXctdGFiJyk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLl9zZWFyY2hDb21wb25lbnQuZ2V0SW5wdXRUZXh0RWRpdG9yKCkudGV4dENvbnRlbnQ7XG4gICAgICBjb25zdCBwcm92aWRlck5hbWUgPSB0aGlzLl9jdXJyZW50UHJvdmlkZXIubmFtZTtcbiAgICAgIC8vIGRlZmF1bHQgdG8gZW1wdHkgc3RyaW5nIGJlY2F1c2UgYHRyYWNrYCBlbmZvcmNlcyBzdHJpbmctb25seSB2YWx1ZXNcbiAgICAgIGNvbnN0IHNvdXJjZVByb3ZpZGVyID0gc2VsZWN0aW9uLnNvdXJjZVByb3ZpZGVyIHx8ICcnO1xuICAgICAgdHJhY2soXG4gICAgICAgIEFuYWx5dGljc0V2ZW50cy5TRUxFQ1RfRklMRSxcbiAgICAgICAge1xuICAgICAgICAgICdxdWlja29wZW4tZmlsZXBhdGgnOiBzZWxlY3Rpb24ucGF0aCxcbiAgICAgICAgICAncXVpY2tvcGVuLXF1ZXJ5JzogcXVlcnksXG4gICAgICAgICAgJ3F1aWNrb3Blbi1wcm92aWRlcic6IHByb3ZpZGVyTmFtZSwgLy8gVGhlIGN1cnJlbnRseSBvcGVuIFwidGFiXCIuXG4gICAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkIHx8ICcnLFxuICAgICAgICAgIC8vIEJlY2F1c2UgdGhlIGBwcm92aWRlcmAgaXMgdXN1YWxseSBPbW5pU2VhcmNoLCBhbHNvIHRyYWNrIHRoZSBvcmlnaW5hbCBwcm92aWRlci5cbiAgICAgICAgICAncXVpY2tvcGVuLXByb3ZpZGVyLXNvdXJjZSc6IHNvdXJjZVByb3ZpZGVyLFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdGhpcy5jbG9zZVNlYXJjaFBhbmVsKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdib2R5JywgJ2NvcmU6Y2FuY2VsJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fc2VhcmNoUGFuZWwgJiYgdGhpcy5fc2VhcmNoUGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlU2VhcmNoUGFuZWwoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50Lm9uQ2FuY2VsbGF0aW9uKCgpID0+IHRoaXMuY2xvc2VTZWFyY2hQYW5lbCgpKTtcbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQub25TZWxlY3Rpb25DaGFuZ2VkKGRlYm91bmNlKChzZWxlY3Rpb246IGFueSkgPT4ge1xuICAgICAgLy8gT25seSB0cmFjayB1c2VyLWluaXRpYXRlZCBzZWxlY3Rpb24tY2hhbmdlIGV2ZW50cy5cbiAgICAgIGlmIChhbmFseXRpY3NTZXNzaW9uSWQgIT0gbnVsbCkge1xuICAgICAgICB0cmFjayhcbiAgICAgICAgICBBbmFseXRpY3NFdmVudHMuQ0hBTkdFX1NFTEVDVElPTixcbiAgICAgICAgICB7XG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlbGVjdGVkLWluZGV4Jzogc2VsZWN0aW9uLnNlbGVjdGVkSXRlbUluZGV4LnRvU3RyaW5nKCksXG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlbGVjdGVkLXNlcnZpY2UnOiBzZWxlY3Rpb24uc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICAgICAgJ3F1aWNrb3Blbi1zZWxlY3RlZC1kaXJlY3RvcnknOiBzZWxlY3Rpb24uc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQsXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sIEFuYWx5dGljc0RlYm91bmNlRGVsYXlzLkNIQU5HRV9TRUxFQ1RJT04pKTtcbiAgfVxuXG4gIC8vIEN1c3RvbWl6ZSB0aGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBtb2RhbC5cbiAgX2N1c3RvbWl6ZU1vZGFsRWxlbWVudCgpIHtcbiAgICBjb25zdCBtb2RhbEVsZW1lbnQgPSAoKHRoaXMuX3NlYXJjaFBhbmVsLmdldEl0ZW0oKS5wYXJlbnROb2RlOiBhbnkpOiBIVE1MRWxlbWVudCk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdtYXJnaW4tbGVmdCcsICcwJyk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCd3aWR0aCcsICdhdXRvJyk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgTU9EQUxfTUFSR0lOICsgJ3B4Jyk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdyaWdodCcsIE1PREFMX01BUkdJTiArICdweCcpO1xuICB9XG5cbiAgX3VwZGF0ZVNjcm9sbGFibGVIZWlnaHQoKSB7XG4gICAgY29uc3Qge2hlaWdodH0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5fbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQgPSBoZWlnaHQgLSBNT0RBTF9NQVJHSU4gLSBUT1BCQVJfQVBQUk9YX0hFSUdIVDtcbiAgICAvLyBGb3JjZSBhIHJlLXJlbmRlciB0byB1cGRhdGUgX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0LlxuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudCA9IHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50XG4gICAgICAgIGFjdGl2ZVByb3ZpZGVyPXt0aGlzLl9jdXJyZW50UHJvdmlkZXJ9XG4gICAgICAgIG9uUHJvdmlkZXJDaGFuZ2U9e3RoaXMuaGFuZGxlQWN0aXZlUHJvdmlkZXJDaGFuZ2UuYmluZCh0aGlzKX1cbiAgICAgICAgbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQ9e3RoaXMuX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0fVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9yZWFjdERpdlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVBY3RpdmVQcm92aWRlckNoYW5nZShuZXdQcm92aWRlck5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRyYWNrUHJvdmlkZXJDaGFuZ2UobmV3UHJvdmlkZXJOYW1lKTtcbiAgICB0aGlzLl9jdXJyZW50UHJvdmlkZXIgPSBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZ2V0UHJvdmlkZXJCeU5hbWUobmV3UHJvdmlkZXJOYW1lKTtcbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQgPSB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIHRvZ2dsZU9tbmlTZWFyY2hQcm92aWRlcigpOiB2b2lkIHtcbiAgICByZXF1aXJlKCcuL1F1aWNrU2VsZWN0aW9uQWN0aW9ucycpLmNoYW5nZUFjdGl2ZVByb3ZpZGVyKCdPbW5pU2VhcmNoUmVzdWx0UHJvdmlkZXInKTtcbiAgfVxuXG4gIHRvZ2dsZVByb3ZpZGVyKHByb3ZpZGVyTmFtZTogc3RyaW5nKSB7XG4gICAgYW5hbHl0aWNzU2Vzc2lvbklkID0gYW5hbHl0aWNzU2Vzc2lvbklkIHx8IERhdGUubm93KCkudG9TdHJpbmcoKTtcbiAgICB0cmFjayhcbiAgICAgIEFuYWx5dGljc0V2ZW50cy5DSEFOR0VfVEFCLFxuICAgICAge1xuICAgICAgICAncXVpY2tvcGVuLXByb3ZpZGVyJzogcHJvdmlkZXJOYW1lLFxuICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQsXG4gICAgICB9XG4gICAgKTtcbiAgICBjb25zdCBwcm92aWRlciA9IGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKS5nZXRQcm92aWRlckJ5TmFtZShwcm92aWRlck5hbWUpO1xuICAgIC8vIFwidG9nZ2xlXCIgYmVoYXZpb3JcbiAgICBpZiAoXG4gICAgICB0aGlzLl9zZWFyY2hQYW5lbCAhPT0gbnVsbCAmJlxuICAgICAgdGhpcy5fc2VhcmNoUGFuZWwuaXNWaXNpYmxlKCkgJiZcbiAgICAgIHByb3ZpZGVyTmFtZSA9PT0gdGhpcy5fY3VycmVudFByb3ZpZGVyLm5hbWVcbiAgICApIHtcbiAgICAgIHRoaXMuY2xvc2VTZWFyY2hQYW5lbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2N1cnJlbnRQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgIGlmICh0aGlzLl9zZWFyY2hDb21wb25lbnQpIHtcbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudCA9IHRoaXMuX3JlbmRlcigpO1xuICAgIH1cbiAgICB0aGlzLnNob3dTZWFyY2hQYW5lbCgpO1xuICB9XG5cbiAgc2hvd1NlYXJjaFBhbmVsKCkge1xuICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGlmICh0aGlzLl9zZWFyY2hDb21wb25lbnQgJiYgdGhpcy5fc2VhcmNoUGFuZWwpIHtcbiAgICAgIC8vIFN0YXJ0IGEgbmV3IHNlYXJjaCBcInNlc3Npb25cIiBmb3IgYW5hbHl0aWNzIHB1cnBvc2VzLlxuICAgICAgdHJhY2soXG4gICAgICAgIEFuYWx5dGljc0V2ZW50cy5PUEVOX1BBTkVMLFxuICAgICAgICB7XG4gICAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkIHx8ICcnLFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgLy8gc2hvd1NlYXJjaFBhbmVsIGdldHMgY2FsbGVkIHdoZW4gY2hhbmdpbmcgcHJvdmlkZXJzIGV2ZW4gaWYgaXQncyBhbHJlYWR5IHNob3duLlxuICAgICAgY29uc3QgaXNBbHJlYWR5VmlzaWJsZSA9IHRoaXMuX3NlYXJjaFBhbmVsLmlzVmlzaWJsZSgpO1xuICAgICAgdGhpcy5fc2VhcmNoUGFuZWwuc2hvdygpO1xuICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50LmZvY3VzKCk7XG4gICAgICBpZiAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtcXVpY2stb3Blbi51c2VTZWxlY3Rpb24nKSAmJiAhaXNBbHJlYWR5VmlzaWJsZSkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB0aGlzLl9nZXRGaXJzdFNlbGVjdGlvblRleHQoKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkVGV4dCAmJiBzZWxlY3RlZFRleHQubGVuZ3RoIDw9IE1BWF9TRUxFQ1RJT05fTEVOR1RIKSB7XG4gICAgICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50LnNldElucHV0VmFsdWUoc2VsZWN0ZWRUZXh0LnNwbGl0KCdcXG4nKVswXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5zZWxlY3RJbnB1dCgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlU2VhcmNoUGFuZWwoKSB7XG4gICAgaWYgKHRoaXMuX3NlYXJjaENvbXBvbmVudCAmJiB0aGlzLl9zZWFyY2hQYW5lbCkge1xuICAgICAgdHJhY2soXG4gICAgICAgIEFuYWx5dGljc0V2ZW50cy5DTE9TRV9QQU5FTCxcbiAgICAgICAge1xuICAgICAgICAgICdxdWlja29wZW4tc2Vzc2lvbic6IGFuYWx5dGljc1Nlc3Npb25JZCB8fCAnJyxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMuX3NlYXJjaFBhbmVsLmhpZGUoKTtcbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5ibHVyKCk7XG4gICAgICBhbmFseXRpY3NTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wcmV2aW91c0ZvY3VzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMuZm9jdXMoKTtcbiAgICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRGaXJzdFNlbGVjdGlvblRleHQoKTogP3N0cmluZyB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIHJldHVybiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpWzBdLmdldFRleHQoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5mdW5jdGlvbiBnZXRBY3RpdmF0aW9uKCk6IEFjdGl2YXRpb24ge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKCk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRpb247XG59XG5cbmxldCBsaXN0ZW5lcnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGxpc3RlbmVycyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgbGlzdGVuZXJzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtcXVpY2stb3BlbjpmaW5kLWFueXRoaW5nLXZpYS1vbW5pLXNlYXJjaCc6ICgpID0+IHtcbiAgICAgICAgICBnZXRBY3RpdmF0aW9uKCkudG9nZ2xlT21uaVNlYXJjaFByb3ZpZGVyKCk7XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApO1xuICAgIGdldEFjdGl2YXRpb24oKTtcbiAgfSxcblxuICByZWdpc3RlclByb3ZpZGVyKHNlcnZpY2U6IFByb3ZpZGVyICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpLnJlZ2lzdGVyUHJvdmlkZXIoc2VydmljZSk7XG4gIH0sXG5cbiAgcmVnaXN0ZXJTdG9yZSgpIHtcbiAgICByZXR1cm4gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdRdWljayBPcGVuJyxcbiAgICAgICAgaWNvbjogJ3NlYXJjaCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBwb3dlcmZ1bCBzZWFyY2ggYm94IHRvIHF1aWNrbHkgZmluZCBsb2NhbCBhbmQgcmVtb3RlIGZpbGVzIGFuZCBjb250ZW50LicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXF1aWNrLW9wZW46ZmluZC1hbnl0aGluZy12aWEtb21uaS1zZWFyY2gnLFxuICAgICAgfSxcbiAgICAgIHByaW9yaXR5OiAxMCxcbiAgICB9O1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGxpc3RlbmVycy5kaXNwb3NlKCk7XG4gICAgICBsaXN0ZW5lcnMgPSBudWxsO1xuICAgIH1cbiAgICBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZGlzcG9zZSgpO1xuICB9LFxufTtcbiJdfQ==