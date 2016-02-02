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

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _analytics = require('../../analytics');

var debounceFunction = null;
function debounce() {
  var debounceFunc = debounceFunction || (debounceFunction = require('../../commons').debounce);

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return debounceFunc.apply(null, args);
}

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
var AnalyticsEvents = {
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB: 'quickopen-change-tab',
  CLOSE_PANEL: 'quickopen-close-panel',
  OPEN_PANEL: 'quickopen-open-panel',
  SELECT_FILE: 'quickopen-select-file'
};
var AnalyticsDebounceDelays = {
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100
};

var trackProviderChange = debounce(function (providerName) {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  (0, _analytics.track)(AnalyticsEvents.CHANGE_TAB, {
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
    this._debouncedUpdateModalPosition = debounce(this._updateScrollableHeight.bind(this), 200);
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
      (0, _analytics.track)(AnalyticsEvents.SELECT_FILE, {
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
    this._searchComponent.onSelectionChanged(debounce(function (selection) {
      // Only track user-initiated selection-change events.
      if (analyticsSessionId != null) {
        (0, _analytics.track)(AnalyticsEvents.CHANGE_SELECTION, {
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
      (0, _analytics.track)(AnalyticsEvents.CHANGE_TAB, {
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
        (0, _analytics.track)(AnalyticsEvents.OPEN_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        // showSearchPanel gets called when changing providers even if it's already shown.
        var isAlreadyVisible = this._searchPanel.isVisible();
        this._searchPanel.show();
        this._searchComponent.focus();
        if (_featureConfig2['default'].get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
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
        (0, _analytics.track)(AnalyticsEvents.CLOSE_PANEL, {
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
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsMkVBQTJFO0FBQ3hGLGVBQU8sRUFBRSxrREFBa0Q7T0FDNUQ7QUFDRCxjQUFRLEVBQUUsRUFBRTtLQUNiLENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsUUFBSSxVQUFVLEVBQUU7QUFDZCxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGdCQUFVLEdBQUcsSUFBSSxDQUFDO0tBQ25CO0FBQ0QsUUFBSSxTQUFTLEVBQUU7QUFDYixlQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEIsZUFBUyxHQUFHLElBQUksQ0FBQztLQUNsQjtBQUNELDBCQUFzQixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDcEM7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL2hvbWUtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50IGZyb20gJy4vUXVpY2tTZWxlY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmxldCBkZWJvdW5jZUZ1bmN0aW9uID0gbnVsbDtcbmZ1bmN0aW9uIGRlYm91bmNlKC4uLmFyZ3MpIHtcbiAgY29uc3QgZGVib3VuY2VGdW5jID0gZGVib3VuY2VGdW5jdGlvbiB8fCAoZGVib3VuY2VGdW5jdGlvbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5kZWJvdW5jZSk7XG4gIHJldHVybiBkZWJvdW5jZUZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG59XG5cbmZ1bmN0aW9uIGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL1NlYXJjaFJlc3VsdE1hbmFnZXInKS5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG59XG5cbmNvbnN0IERFRkFVTFRfUFJPVklERVIgPSAnT21uaVNlYXJjaFJlc3VsdFByb3ZpZGVyJztcbmNvbnN0IFRPUEJBUl9BUFBST1hfSEVJR0hUID0gMTAwOyAvLyBBIHJlYXNvbmFibGUgaGV1cmlzdGljIHRoYXQgcHJldmVudHMgdXMgZnJvbSBoYXZpbmcgdG8gbWVhc3VyZS5cbmNvbnN0IE1PREFMX01BUkdJTiA9IDMyO1xuLy8gZG9uJ3QgcHJlLWZpbGwgc2VhcmNoIGlucHV0IGlmIHNlbGVjdGlvbiBpcyBsb25nZXIgdGhhbiB0aGlzXG5jb25zdCBNQVhfU0VMRUNUSU9OX0xFTkdUSCA9IDEwMDA7XG5cbi8qKlxuICogQSBcInNlc3Npb25cIiBmb3IgdGhlIHB1cnBvc2Ugb2YgYW5hbHl0aWNzLiBJdCBleGlzdHMgZnJvbSB0aGUgbW9tZW50IHRoZSBxdWljay1vcGVuIFVJIGJlY29tZXNcbiAqIHZpc2libGUgdW50aWwgaXQgZ2V0cyBjbG9zZWQsIGVpdGhlciB2aWEgZmlsZSBzZWxlY3Rpb24gb3IgY2FuY2VsbGF0aW9uLlxuICovXG5sZXQgYW5hbHl0aWNzU2Vzc2lvbklkID0gbnVsbDtcbmNvbnN0IEFuYWx5dGljc0V2ZW50cyA9IHtcbiAgQ0hBTkdFX1NFTEVDVElPTjogJ3F1aWNrb3Blbi1jaGFuZ2Utc2VsZWN0aW9uJyxcbiAgQ0hBTkdFX1RBQjogICAgICAgJ3F1aWNrb3Blbi1jaGFuZ2UtdGFiJyxcbiAgQ0xPU0VfUEFORUw6ICAgICAgJ3F1aWNrb3Blbi1jbG9zZS1wYW5lbCcsXG4gIE9QRU5fUEFORUw6ICAgICAgICdxdWlja29wZW4tb3Blbi1wYW5lbCcsXG4gIFNFTEVDVF9GSUxFOiAgICAgICdxdWlja29wZW4tc2VsZWN0LWZpbGUnLFxufTtcbmNvbnN0IEFuYWx5dGljc0RlYm91bmNlRGVsYXlzID0ge1xuICBDSEFOR0VfVEFCOiAxMDAsXG4gIENIQU5HRV9TRUxFQ1RJT046IDEwMCxcbn07XG5cbmNvbnN0IHRyYWNrUHJvdmlkZXJDaGFuZ2UgPSBkZWJvdW5jZShwcm92aWRlck5hbWUgPT4ge1xuICBhbmFseXRpY3NTZXNzaW9uSWQgPSBhbmFseXRpY3NTZXNzaW9uSWQgfHwgRGF0ZS5ub3coKS50b1N0cmluZygpO1xuICB0cmFjayhcbiAgICBBbmFseXRpY3NFdmVudHMuQ0hBTkdFX1RBQixcbiAgICB7XG4gICAgICAncXVpY2tvcGVuLXByb3ZpZGVyJzogcHJvdmlkZXJOYW1lLFxuICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkLFxuICAgIH1cbiAgKTtcbn0sIEFuYWx5dGljc0RlYm91bmNlRGVsYXlzLkNIQU5HRV9UQUIpO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2N1cnJlbnRQcm92aWRlcjogT2JqZWN0O1xuICBfcHJldmlvdXNGb2N1czogP0hUTUxFbGVtZW50O1xuICBfcmVhY3REaXY6IEhUTUxFbGVtZW50O1xuICBfc2VhcmNoQ29tcG9uZW50OiBRdWlja1NlbGVjdGlvbkNvbXBvbmVudDtcbiAgX3NlYXJjaFBhbmVsOiBhdG9tJFBhbmVsO1xuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGVib3VuY2VkVXBkYXRlTW9kYWxQb3NpdGlvbjogKCkgPT4gdm9pZDtcbiAgX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcHJldmlvdXNGb2N1cyA9IG51bGw7XG4gICAgdGhpcy5fbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQgPSAxMDAwMDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9jdXJyZW50UHJvdmlkZXIgPSBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZ2V0UHJvdmlkZXJCeU5hbWUoREVGQVVMVF9QUk9WSURFUik7XG4gICAgY29uc3QgUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9RdWlja1NlbGVjdGlvbkRpc3BhdGNoZXInKTtcbiAgICBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKS5yZWdpc3RlcihhY3Rpb24gPT4ge1xuICAgICAgaWYgKGFjdGlvbi5hY3Rpb25UeXBlID09PSBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuQWN0aW9uVHlwZS5BQ1RJVkVfUFJPVklERVJfQ0hBTkdFRCkge1xuICAgICAgICB0aGlzLnRvZ2dsZVByb3ZpZGVyKGFjdGlvbi5wcm92aWRlck5hbWUpO1xuICAgICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9yZWFjdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX3NlYXJjaFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogdGhpcy5fcmVhY3REaXYsIHZpc2libGU6IGZhbHNlfSk7XG4gICAgdGhpcy5fZGVib3VuY2VkVXBkYXRlTW9kYWxQb3NpdGlvbiA9IGRlYm91bmNlKHRoaXMuX3VwZGF0ZVNjcm9sbGFibGVIZWlnaHQuYmluZCh0aGlzKSwgMjAwKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fZGVib3VuY2VkVXBkYXRlTW9kYWxQb3NpdGlvbik7XG4gICAgdGhpcy5fY3VzdG9taXplTW9kYWxFbGVtZW50KCk7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYWJsZUhlaWdodCgpO1xuXG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50ID0gdGhpcy5fcmVuZGVyKCk7XG5cbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQub25TZWxlY3Rpb24oKHNlbGVjdGlvbikgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHt9O1xuICAgICAgaWYgKHNlbGVjdGlvbi5saW5lKSB7XG4gICAgICAgIG9wdGlvbnMuaW5pdGlhbExpbmUgPSBzZWxlY3Rpb24ubGluZTtcbiAgICAgIH1cbiAgICAgIGlmIChzZWxlY3Rpb24uY29sdW1uKSB7XG4gICAgICAgIG9wdGlvbnMuaW5pdGlhbENvbHVtbiA9IHNlbGVjdGlvbi5jb2x1bW47XG4gICAgICB9XG5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oc2VsZWN0aW9uLnBhdGgsIG9wdGlvbnMpLnRoZW4odGV4dEVkaXRvciA9PiB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KHRleHRFZGl0b3IpLCAndGFiczprZWVwLXByZXZpZXctdGFiJyk7XG4gICAgICB9KTtcblxuICAgICAgY29uc3QgcXVlcnkgPSB0aGlzLl9zZWFyY2hDb21wb25lbnQuZ2V0SW5wdXRUZXh0RWRpdG9yKCkudGV4dENvbnRlbnQ7XG4gICAgICBjb25zdCBwcm92aWRlck5hbWUgPSB0aGlzLl9jdXJyZW50UHJvdmlkZXIubmFtZTtcbiAgICAgIC8vIGRlZmF1bHQgdG8gZW1wdHkgc3RyaW5nIGJlY2F1c2UgYHRyYWNrYCBlbmZvcmNlcyBzdHJpbmctb25seSB2YWx1ZXNcbiAgICAgIGNvbnN0IHNvdXJjZVByb3ZpZGVyID0gc2VsZWN0aW9uLnNvdXJjZVByb3ZpZGVyIHx8ICcnO1xuICAgICAgdHJhY2soXG4gICAgICAgIEFuYWx5dGljc0V2ZW50cy5TRUxFQ1RfRklMRSxcbiAgICAgICAge1xuICAgICAgICAgICdxdWlja29wZW4tZmlsZXBhdGgnOiBzZWxlY3Rpb24ucGF0aCxcbiAgICAgICAgICAncXVpY2tvcGVuLXF1ZXJ5JzogcXVlcnksXG4gICAgICAgICAgJ3F1aWNrb3Blbi1wcm92aWRlcic6IHByb3ZpZGVyTmFtZSwgLy8gVGhlIGN1cnJlbnRseSBvcGVuIFwidGFiXCIuXG4gICAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkIHx8ICcnLFxuICAgICAgICAgIC8vIEJlY2F1c2UgdGhlIGBwcm92aWRlcmAgaXMgdXN1YWxseSBPbW5pU2VhcmNoLCBhbHNvIHRyYWNrIHRoZSBvcmlnaW5hbCBwcm92aWRlci5cbiAgICAgICAgICAncXVpY2tvcGVuLXByb3ZpZGVyLXNvdXJjZSc6IHNvdXJjZVByb3ZpZGVyLFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdGhpcy5jbG9zZVNlYXJjaFBhbmVsKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdib2R5JywgJ2NvcmU6Y2FuY2VsJywgKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fc2VhcmNoUGFuZWwgJiYgdGhpcy5fc2VhcmNoUGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgICAgICB0aGlzLmNsb3NlU2VhcmNoUGFuZWwoKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuXG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50Lm9uQ2FuY2VsbGF0aW9uKCgpID0+IHRoaXMuY2xvc2VTZWFyY2hQYW5lbCgpKTtcbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQub25TZWxlY3Rpb25DaGFuZ2VkKGRlYm91bmNlKChzZWxlY3Rpb246IGFueSkgPT4ge1xuICAgICAgLy8gT25seSB0cmFjayB1c2VyLWluaXRpYXRlZCBzZWxlY3Rpb24tY2hhbmdlIGV2ZW50cy5cbiAgICAgIGlmIChhbmFseXRpY3NTZXNzaW9uSWQgIT0gbnVsbCkge1xuICAgICAgICB0cmFjayhcbiAgICAgICAgICBBbmFseXRpY3NFdmVudHMuQ0hBTkdFX1NFTEVDVElPTixcbiAgICAgICAgICB7XG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlbGVjdGVkLWluZGV4Jzogc2VsZWN0aW9uLnNlbGVjdGVkSXRlbUluZGV4LnRvU3RyaW5nKCksXG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlbGVjdGVkLXNlcnZpY2UnOiBzZWxlY3Rpb24uc2VsZWN0ZWRTZXJ2aWNlLFxuICAgICAgICAgICAgJ3F1aWNrb3Blbi1zZWxlY3RlZC1kaXJlY3RvcnknOiBzZWxlY3Rpb24uc2VsZWN0ZWREaXJlY3RvcnksXG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQsXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0sIEFuYWx5dGljc0RlYm91bmNlRGVsYXlzLkNIQU5HRV9TRUxFQ1RJT04pKTtcbiAgfVxuXG4gIC8vIEN1c3RvbWl6ZSB0aGUgZWxlbWVudCBjb250YWluaW5nIHRoZSBtb2RhbC5cbiAgX2N1c3RvbWl6ZU1vZGFsRWxlbWVudCgpIHtcbiAgICBjb25zdCBtb2RhbEVsZW1lbnQgPSAoKHRoaXMuX3NlYXJjaFBhbmVsLmdldEl0ZW0oKS5wYXJlbnROb2RlOiBhbnkpOiBIVE1MRWxlbWVudCk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdtYXJnaW4tbGVmdCcsICcwJyk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCd3aWR0aCcsICdhdXRvJyk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdsZWZ0JywgTU9EQUxfTUFSR0lOICsgJ3B4Jyk7XG4gICAgbW9kYWxFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdyaWdodCcsIE1PREFMX01BUkdJTiArICdweCcpO1xuICB9XG5cbiAgX3VwZGF0ZVNjcm9sbGFibGVIZWlnaHQoKSB7XG4gICAgY29uc3Qge2hlaWdodH0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgdGhpcy5fbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQgPSBoZWlnaHQgLSBNT0RBTF9NQVJHSU4gLSBUT1BCQVJfQVBQUk9YX0hFSUdIVDtcbiAgICAvLyBGb3JjZSBhIHJlLXJlbmRlciB0byB1cGRhdGUgX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0LlxuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudCA9IHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICByZXR1cm4gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50XG4gICAgICAgIGFjdGl2ZVByb3ZpZGVyPXt0aGlzLl9jdXJyZW50UHJvdmlkZXJ9XG4gICAgICAgIG9uUHJvdmlkZXJDaGFuZ2U9e3RoaXMuaGFuZGxlQWN0aXZlUHJvdmlkZXJDaGFuZ2UuYmluZCh0aGlzKX1cbiAgICAgICAgbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQ9e3RoaXMuX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0fVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9yZWFjdERpdlxuICAgICk7XG4gIH1cblxuICBoYW5kbGVBY3RpdmVQcm92aWRlckNoYW5nZShuZXdQcm92aWRlck5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRyYWNrUHJvdmlkZXJDaGFuZ2UobmV3UHJvdmlkZXJOYW1lKTtcbiAgICB0aGlzLl9jdXJyZW50UHJvdmlkZXIgPSBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZ2V0UHJvdmlkZXJCeU5hbWUobmV3UHJvdmlkZXJOYW1lKTtcbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQgPSB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIHRvZ2dsZU9tbmlTZWFyY2hQcm92aWRlcigpOiB2b2lkIHtcbiAgICByZXF1aXJlKCcuL1F1aWNrU2VsZWN0aW9uQWN0aW9ucycpLmNoYW5nZUFjdGl2ZVByb3ZpZGVyKCdPbW5pU2VhcmNoUmVzdWx0UHJvdmlkZXInKTtcbiAgfVxuXG4gIHRvZ2dsZVByb3ZpZGVyKHByb3ZpZGVyTmFtZTogc3RyaW5nKSB7XG4gICAgYW5hbHl0aWNzU2Vzc2lvbklkID0gYW5hbHl0aWNzU2Vzc2lvbklkIHx8IERhdGUubm93KCkudG9TdHJpbmcoKTtcbiAgICB0cmFjayhcbiAgICAgIEFuYWx5dGljc0V2ZW50cy5DSEFOR0VfVEFCLFxuICAgICAge1xuICAgICAgICAncXVpY2tvcGVuLXByb3ZpZGVyJzogcHJvdmlkZXJOYW1lLFxuICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQsXG4gICAgICB9XG4gICAgKTtcbiAgICBjb25zdCBwcm92aWRlciA9IGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKS5nZXRQcm92aWRlckJ5TmFtZShwcm92aWRlck5hbWUpO1xuICAgIC8vIFwidG9nZ2xlXCIgYmVoYXZpb3JcbiAgICBpZiAoXG4gICAgICB0aGlzLl9zZWFyY2hQYW5lbCAhPT0gbnVsbCAmJlxuICAgICAgdGhpcy5fc2VhcmNoUGFuZWwuaXNWaXNpYmxlKCkgJiZcbiAgICAgIHByb3ZpZGVyTmFtZSA9PT0gdGhpcy5fY3VycmVudFByb3ZpZGVyLm5hbWVcbiAgICApIHtcbiAgICAgIHRoaXMuY2xvc2VTZWFyY2hQYW5lbCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2N1cnJlbnRQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgIGlmICh0aGlzLl9zZWFyY2hDb21wb25lbnQpIHtcbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudCA9IHRoaXMuX3JlbmRlcigpO1xuICAgIH1cbiAgICB0aGlzLnNob3dTZWFyY2hQYW5lbCgpO1xuICB9XG5cbiAgc2hvd1NlYXJjaFBhbmVsKCkge1xuICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGlmICh0aGlzLl9zZWFyY2hDb21wb25lbnQgJiYgdGhpcy5fc2VhcmNoUGFuZWwpIHtcbiAgICAgIC8vIFN0YXJ0IGEgbmV3IHNlYXJjaCBcInNlc3Npb25cIiBmb3IgYW5hbHl0aWNzIHB1cnBvc2VzLlxuICAgICAgdHJhY2soXG4gICAgICAgIEFuYWx5dGljc0V2ZW50cy5PUEVOX1BBTkVMLFxuICAgICAgICB7XG4gICAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkIHx8ICcnLFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgLy8gc2hvd1NlYXJjaFBhbmVsIGdldHMgY2FsbGVkIHdoZW4gY2hhbmdpbmcgcHJvdmlkZXJzIGV2ZW4gaWYgaXQncyBhbHJlYWR5IHNob3duLlxuICAgICAgY29uc3QgaXNBbHJlYWR5VmlzaWJsZSA9IHRoaXMuX3NlYXJjaFBhbmVsLmlzVmlzaWJsZSgpO1xuICAgICAgdGhpcy5fc2VhcmNoUGFuZWwuc2hvdygpO1xuICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50LmZvY3VzKCk7XG4gICAgICBpZiAoZmVhdHVyZUNvbmZpZy5nZXQoJ251Y2xpZGUtcXVpY2stb3Blbi51c2VTZWxlY3Rpb24nKSAmJiAhaXNBbHJlYWR5VmlzaWJsZSkge1xuICAgICAgICBjb25zdCBzZWxlY3RlZFRleHQgPSB0aGlzLl9nZXRGaXJzdFNlbGVjdGlvblRleHQoKTtcbiAgICAgICAgaWYgKHNlbGVjdGVkVGV4dCAmJiBzZWxlY3RlZFRleHQubGVuZ3RoIDw9IE1BWF9TRUxFQ1RJT05fTEVOR1RIKSB7XG4gICAgICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50LnNldElucHV0VmFsdWUoc2VsZWN0ZWRUZXh0LnNwbGl0KCdcXG4nKVswXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5zZWxlY3RJbnB1dCgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlU2VhcmNoUGFuZWwoKSB7XG4gICAgaWYgKHRoaXMuX3NlYXJjaENvbXBvbmVudCAmJiB0aGlzLl9zZWFyY2hQYW5lbCkge1xuICAgICAgdHJhY2soXG4gICAgICAgIEFuYWx5dGljc0V2ZW50cy5DTE9TRV9QQU5FTCxcbiAgICAgICAge1xuICAgICAgICAgICdxdWlja29wZW4tc2Vzc2lvbic6IGFuYWx5dGljc1Nlc3Npb25JZCB8fCAnJyxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMuX3NlYXJjaFBhbmVsLmhpZGUoKTtcbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5ibHVyKCk7XG4gICAgICBhbmFseXRpY3NTZXNzaW9uSWQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wcmV2aW91c0ZvY3VzICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMuZm9jdXMoKTtcbiAgICAgIHRoaXMuX3ByZXZpb3VzRm9jdXMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRGaXJzdFNlbGVjdGlvblRleHQoKTogP3N0cmluZyB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChlZGl0b3IpIHtcbiAgICAgIHJldHVybiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpWzBdLmdldFRleHQoKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmxldCBhY3RpdmF0aW9uOiA/QWN0aXZhdGlvbiA9IG51bGw7XG5mdW5jdGlvbiBnZXRBY3RpdmF0aW9uKCk6IEFjdGl2YXRpb24ge1xuICBpZiAoYWN0aXZhdGlvbiA9PSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbiA9IG5ldyBBY3RpdmF0aW9uKCk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRpb247XG59XG5cbmxldCBsaXN0ZW5lcnM6ID9Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGxpc3RlbmVycyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgbGlzdGVuZXJzLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtcXVpY2stb3BlbjpmaW5kLWFueXRoaW5nLXZpYS1vbW5pLXNlYXJjaCc6ICgpID0+IHtcbiAgICAgICAgICBnZXRBY3RpdmF0aW9uKCkudG9nZ2xlT21uaVNlYXJjaFByb3ZpZGVyKCk7XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICApO1xuICAgIGdldEFjdGl2YXRpb24oKTtcbiAgfSxcblxuICByZWdpc3RlclByb3ZpZGVyKHNlcnZpY2U6IFByb3ZpZGVyICk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpLnJlZ2lzdGVyUHJvdmlkZXIoc2VydmljZSk7XG4gIH0sXG5cbiAgcmVnaXN0ZXJTdG9yZSgpIHtcbiAgICByZXR1cm4gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdRdWljayBPcGVuJyxcbiAgICAgICAgaWNvbjogJ3NlYXJjaCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBwb3dlcmZ1bCBzZWFyY2ggYm94IHRvIHF1aWNrbHkgZmluZCBsb2NhbCBhbmQgcmVtb3RlIGZpbGVzIGFuZCBjb250ZW50LicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXF1aWNrLW9wZW46ZmluZC1hbnl0aGluZy12aWEtb21uaS1zZWFyY2gnLFxuICAgICAgfSxcbiAgICAgIHByaW9yaXR5OiAxMCxcbiAgICB9O1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGxpc3RlbmVycy5kaXNwb3NlKCk7XG4gICAgICBsaXN0ZW5lcnMgPSBudWxsO1xuICAgIH1cbiAgICBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZGlzcG9zZSgpO1xuICB9LFxufTtcbiJdfQ==