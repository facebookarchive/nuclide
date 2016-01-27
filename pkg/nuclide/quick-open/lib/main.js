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
      return _reactForAtom.React.render(_reactForAtom.React.createElement(_QuickSelectionComponent2['default'], {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7NEJBZ0JvQixnQkFBZ0I7O3VDQUNBLDJCQUEyQjs7OztvQkFDN0IsTUFBTTs7NkJBQ2Qsc0JBQXNCOzs7O3lCQUM1QixpQkFBaUI7O0FBRXJDLElBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFNBQVMsUUFBUSxHQUFVO0FBQ3pCLE1BQU0sWUFBWSxHQUFHLGdCQUFnQixLQUFLLGdCQUFnQixHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQyxRQUFRLENBQUEsQUFBQyxDQUFDOztvQ0FEN0UsSUFBSTtBQUFKLFFBQUk7OztBQUV2QixTQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3ZDOztBQUVELFNBQVMsc0JBQXNCLEdBQUc7QUFDaEMsU0FBTyxPQUFPLENBQUMsdUJBQXVCLENBQUMsV0FBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0NBQy9EOztBQUVELElBQU0sZ0JBQWdCLEdBQUcsMEJBQTBCLENBQUM7QUFDcEQsSUFBTSxvQkFBb0IsR0FBRyxHQUFHLENBQUM7QUFDakMsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDOztBQUV4QixJQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQzs7Ozs7O0FBTWxDLElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDO0FBQzlCLElBQU0sZUFBZSxHQUFHO0FBQ3RCLGtCQUFnQixFQUFFLDRCQUE0QjtBQUM5QyxZQUFVLEVBQVEsc0JBQXNCO0FBQ3hDLGFBQVcsRUFBTyx1QkFBdUI7QUFDekMsWUFBVSxFQUFRLHNCQUFzQjtBQUN4QyxhQUFXLEVBQU8sdUJBQXVCO0NBQzFDLENBQUM7QUFDRixJQUFNLHVCQUF1QixHQUFHO0FBQzlCLFlBQVUsRUFBRSxHQUFHO0FBQ2Ysa0JBQWdCLEVBQUUsR0FBRztDQUN0QixDQUFDOztBQUVGLElBQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLFVBQUEsWUFBWSxFQUFJO0FBQ25ELG9CQUFrQixHQUFHLGtCQUFrQixJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNqRSx3QkFDRSxlQUFlLENBQUMsVUFBVSxFQUMxQjtBQUNFLHdCQUFvQixFQUFFLFlBQVk7QUFDbEMsdUJBQW1CLEVBQUUsa0JBQWtCO0dBQ3hDLENBQ0YsQ0FBQztDQUNILEVBQUUsdUJBQXVCLENBQUMsVUFBVSxDQUFDLENBQUM7O0lBRWpDLFVBQVU7QUFVSCxXQVZQLFVBQVUsR0FVQTs7OzBCQVZWLFVBQVU7O0FBV1osUUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDM0IsUUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztBQUN0QyxRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDO0FBQ2hELFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxzQkFBc0IsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDckYsUUFBTSx3QkFBd0IsR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN2RSw0QkFBd0IsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxRQUFRLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDeEQsVUFBSSxNQUFNLENBQUMsVUFBVSxLQUFLLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsRUFBRTtBQUNyRixjQUFLLGNBQWMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDekMsY0FBSyxPQUFPLEVBQUUsQ0FBQztPQUNoQjtLQUNGLENBQUMsQ0FBQztBQUNILFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMvQyxRQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDekYsUUFBSSxDQUFDLDZCQUE2QixHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzVGLFVBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7QUFDdEUsUUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7QUFDOUIsUUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7O0FBRS9CLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRXZDLFFBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsVUFBQyxTQUFTLEVBQUs7QUFDL0MsVUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ25CLFVBQUksU0FBUyxDQUFDLElBQUksRUFBRTtBQUNsQixlQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7T0FDdEM7QUFDRCxVQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDcEIsZUFBTyxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO09BQzFDOztBQUVELFVBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsVUFBVSxFQUFJO0FBQzlELFlBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLENBQUM7T0FDakYsQ0FBQyxDQUFDOztBQUVILFVBQU0sS0FBSyxHQUFHLE1BQUssZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxXQUFXLENBQUM7QUFDckUsVUFBTSxZQUFZLEdBQUcsTUFBSyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7O0FBRWhELFVBQU0sY0FBYyxHQUFHLFNBQVMsQ0FBQyxjQUFjLElBQUksRUFBRSxDQUFDO0FBQ3RELDRCQUNFLGVBQWUsQ0FBQyxXQUFXLEVBQzNCO0FBQ0UsNEJBQW9CLEVBQUUsU0FBUyxDQUFDLElBQUk7QUFDcEMseUJBQWlCLEVBQUUsS0FBSztBQUN4Qiw0QkFBb0IsRUFBRSxZQUFZO0FBQ2xDLDJCQUFtQixFQUFFLGtCQUFrQixJQUFJLEVBQUU7O0FBRTdDLG1DQUEyQixFQUFFLGNBQWM7T0FDNUMsQ0FDRixDQUFDO0FBQ0YsWUFBSyxnQkFBZ0IsRUFBRSxDQUFDO0tBQ3pCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGFBQWEsRUFBRSxZQUFNO0FBQzdDLFVBQUksTUFBSyxZQUFZLElBQUksTUFBSyxZQUFZLENBQUMsU0FBUyxFQUFFLEVBQUU7QUFDdEQsY0FBSyxnQkFBZ0IsRUFBRSxDQUFDO09BQ3pCO0tBQ0YsQ0FBQyxDQUNILENBQUM7O0FBRUYsUUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQzthQUFNLE1BQUssZ0JBQWdCLEVBQUU7S0FBQSxDQUFDLENBQUM7QUFDcEUsUUFBSSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxVQUFDLFNBQVMsRUFBVTs7QUFFcEUsVUFBSSxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7QUFDOUIsOEJBQ0UsZUFBZSxDQUFDLGdCQUFnQixFQUNoQztBQUNFLG9DQUEwQixFQUFFLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLEVBQUU7QUFDbEUsc0NBQTRCLEVBQUUsU0FBUyxDQUFDLGVBQWU7QUFDdkQsd0NBQThCLEVBQUUsU0FBUyxDQUFDLGlCQUFpQjtBQUMzRCw2QkFBbUIsRUFBRSxrQkFBa0I7U0FDeEMsQ0FDRixDQUFDO09BQ0g7S0FDRixFQUFFLHVCQUF1QixDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztHQUMvQzs7OztlQXJGRyxVQUFVOztXQXdGUSxrQ0FBRztBQUN2QixVQUFNLFlBQVksR0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQUFBb0IsQ0FBQztBQUNsRixrQkFBWSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ25ELGtCQUFZLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEQsa0JBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDNUQsa0JBQVksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDOUQ7OztXQUVzQixtQ0FBRzs0REFDUCxRQUFRLENBQUMsZUFBZSxDQUFDLHFCQUFxQixFQUFFOztVQUExRCxNQUFNLG1EQUFOLE1BQU07O0FBQ2IsVUFBSSxDQUFDLHdCQUF3QixHQUFHLE1BQU0sR0FBRyxZQUFZLEdBQUcsb0JBQW9CLENBQUM7O0FBRTdFLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEM7OztXQUVNLG1CQUFHO0FBQ1IsYUFBTyxvQkFBTSxNQUFNLENBQ2pCO0FBQ0Usc0JBQWMsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLEFBQUM7QUFDdEMsd0JBQWdCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFBQztBQUM3RCwrQkFBdUIsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEFBQUM7UUFDdkQsRUFDRixJQUFJLENBQUMsU0FBUyxDQUNmLENBQUM7S0FDSDs7O1dBRXlCLG9DQUFDLGVBQXVCLEVBQVE7QUFDeEQseUJBQW1CLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDckMsVUFBSSxDQUFDLGdCQUFnQixHQUFHLHNCQUFzQixFQUFFLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDcEYsVUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qzs7O1dBRXVCLG9DQUFTO0FBQy9CLGFBQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLDBCQUEwQixDQUFDLENBQUM7S0FDckY7OztXQUVhLHdCQUFDLFlBQW9CLEVBQUU7QUFDbkMsd0JBQWtCLEdBQUcsa0JBQWtCLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2pFLDRCQUNFLGVBQWUsQ0FBQyxVQUFVLEVBQzFCO0FBQ0UsNEJBQW9CLEVBQUUsWUFBWTtBQUNsQywyQkFBbUIsRUFBRSxrQkFBa0I7T0FDeEMsQ0FDRixDQUFDO0FBQ0YsVUFBTSxRQUFRLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFMUUsVUFDRSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksSUFDMUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsSUFDN0IsWUFBWSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQzNDO0FBQ0EsWUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDeEIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7QUFDakMsVUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7QUFDekIsWUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN4QztBQUNELFVBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztLQUN4Qjs7O1dBRWMsMkJBQUc7QUFDaEIsVUFBSSxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO0FBQzdDLFVBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7O0FBRTlDLDhCQUNFLGVBQWUsQ0FBQyxVQUFVLEVBQzFCO0FBQ0UsNkJBQW1CLEVBQUUsa0JBQWtCLElBQUksRUFBRTtTQUM5QyxDQUNGLENBQUM7O0FBRUYsWUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3ZELFlBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzlCLFlBQUksMkJBQWMsR0FBRyxDQUFDLGlDQUFpQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUM3RSxjQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUNuRCxjQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsTUFBTSxJQUFJLG9CQUFvQixFQUFFO0FBQy9ELGdCQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztXQUNsRTtTQUNGO0FBQ0QsWUFBSSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3JDO0tBQ0Y7OztXQUVlLDRCQUFHO0FBQ2pCLFVBQUksSUFBSSxDQUFDLGdCQUFnQixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDOUMsOEJBQ0UsZUFBZSxDQUFDLFdBQVcsRUFDM0I7QUFDRSw2QkFBbUIsRUFBRSxrQkFBa0IsSUFBSSxFQUFFO1NBQzlDLENBQ0YsQ0FBQztBQUNGLFlBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDekIsWUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdCLDBCQUFrQixHQUFHLElBQUksQ0FBQztPQUMzQjs7QUFFRCxVQUFJLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxFQUFFO0FBQy9CLFlBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7T0FDNUI7S0FDRjs7O1dBRXFCLGtDQUFZO0FBQ2hDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxVQUFJLE1BQU0sRUFBRTtBQUNWLGVBQU8sTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQzVDO0tBQ0Y7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMvQjs7O1NBM01HLFVBQVU7OztBQThNaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQztBQUNuQyxTQUFTLGFBQWEsR0FBZTtBQUNuQyxNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBVSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUM7R0FDL0I7QUFDRCxTQUFPLFVBQVUsQ0FBQztDQUNuQjs7QUFFRCxJQUFJLFNBQStCLEdBQUcsSUFBSSxDQUFDOztBQUUzQyxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsVUFBUSxFQUFBLG9CQUFTO0FBQ2YsYUFBUyxHQUFHLCtCQUF5QixDQUFDO0FBQ3RDLGFBQVMsQ0FBQyxHQUFHLENBQ1gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsd0RBQWtELEVBQUUscURBQU07QUFDeEQscUJBQWEsRUFBRSxDQUFDLHdCQUF3QixFQUFFLENBQUM7T0FDNUM7S0FDRixDQUFDLENBQ0gsQ0FBQztBQUNGLGlCQUFhLEVBQUUsQ0FBQztHQUNqQjs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxPQUFpQixFQUFvQjtBQUNwRCxXQUFPLHNCQUFzQixFQUFFLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDM0Q7O0FBRUQsZUFBYSxFQUFBLHlCQUFHO0FBQ2QsV0FBTyxzQkFBc0IsRUFBRSxDQUFDO0dBQ2pDOztBQUVELGtCQUFnQixFQUFBLDRCQUFrQjtBQUNoQyxXQUFPO0FBQ0wsYUFBTyxFQUFFO0FBQ1AsYUFBSyxFQUFFLFlBQVk7QUFDbkIsWUFBSSxFQUFFLFFBQVE7QUFDZCxtQkFBVyxFQUFFLDJFQUEyRTtBQUN4RixlQUFPLEVBQUUsa0RBQWtEO09BQzVEO0FBQ0QsY0FBUSxFQUFFLEVBQUU7S0FDYixDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFTO0FBQ2pCLFFBQUksVUFBVSxFQUFFO0FBQ2QsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixnQkFBVSxHQUFHLElBQUksQ0FBQztLQUNuQjtBQUNELFFBQUksU0FBUyxFQUFFO0FBQ2IsZUFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BCLGVBQVMsR0FBRyxJQUFJLENBQUM7S0FDbEI7QUFDRCwwQkFBc0IsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0dBQ3BDO0NBQ0YsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBQcm92aWRlcixcbn0gZnJvbSAnLi4vLi4vcXVpY2stb3Blbi1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIHtIb21lRnJhZ21lbnRzfSBmcm9tICcuLi8uLi9ob21lLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUXVpY2tTZWxlY3Rpb25Db21wb25lbnQgZnJvbSAnLi9RdWlja1NlbGVjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxubGV0IGRlYm91bmNlRnVuY3Rpb24gPSBudWxsO1xuZnVuY3Rpb24gZGVib3VuY2UoLi4uYXJncykge1xuICBjb25zdCBkZWJvdW5jZUZ1bmMgPSBkZWJvdW5jZUZ1bmN0aW9uIHx8IChkZWJvdW5jZUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpLmRlYm91bmNlKTtcbiAgcmV0dXJuIGRlYm91bmNlRnVuYy5hcHBseShudWxsLCBhcmdzKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpIHtcbiAgcmV0dXJuIHJlcXVpcmUoJy4vU2VhcmNoUmVzdWx0TWFuYWdlcicpLmRlZmF1bHQuZ2V0SW5zdGFuY2UoKTtcbn1cblxuY29uc3QgREVGQVVMVF9QUk9WSURFUiA9ICdPbW5pU2VhcmNoUmVzdWx0UHJvdmlkZXInO1xuY29uc3QgVE9QQkFSX0FQUFJPWF9IRUlHSFQgPSAxMDA7IC8vIEEgcmVhc29uYWJsZSBoZXVyaXN0aWMgdGhhdCBwcmV2ZW50cyB1cyBmcm9tIGhhdmluZyB0byBtZWFzdXJlLlxuY29uc3QgTU9EQUxfTUFSR0lOID0gMzI7XG4vLyBkb24ndCBwcmUtZmlsbCBzZWFyY2ggaW5wdXQgaWYgc2VsZWN0aW9uIGlzIGxvbmdlciB0aGFuIHRoaXNcbmNvbnN0IE1BWF9TRUxFQ1RJT05fTEVOR1RIID0gMTAwMDtcblxuLyoqXG4gKiBBIFwic2Vzc2lvblwiIGZvciB0aGUgcHVycG9zZSBvZiBhbmFseXRpY3MuIEl0IGV4aXN0cyBmcm9tIHRoZSBtb21lbnQgdGhlIHF1aWNrLW9wZW4gVUkgYmVjb21lc1xuICogdmlzaWJsZSB1bnRpbCBpdCBnZXRzIGNsb3NlZCwgZWl0aGVyIHZpYSBmaWxlIHNlbGVjdGlvbiBvciBjYW5jZWxsYXRpb24uXG4gKi9cbmxldCBhbmFseXRpY3NTZXNzaW9uSWQgPSBudWxsO1xuY29uc3QgQW5hbHl0aWNzRXZlbnRzID0ge1xuICBDSEFOR0VfU0VMRUNUSU9OOiAncXVpY2tvcGVuLWNoYW5nZS1zZWxlY3Rpb24nLFxuICBDSEFOR0VfVEFCOiAgICAgICAncXVpY2tvcGVuLWNoYW5nZS10YWInLFxuICBDTE9TRV9QQU5FTDogICAgICAncXVpY2tvcGVuLWNsb3NlLXBhbmVsJyxcbiAgT1BFTl9QQU5FTDogICAgICAgJ3F1aWNrb3Blbi1vcGVuLXBhbmVsJyxcbiAgU0VMRUNUX0ZJTEU6ICAgICAgJ3F1aWNrb3Blbi1zZWxlY3QtZmlsZScsXG59O1xuY29uc3QgQW5hbHl0aWNzRGVib3VuY2VEZWxheXMgPSB7XG4gIENIQU5HRV9UQUI6IDEwMCxcbiAgQ0hBTkdFX1NFTEVDVElPTjogMTAwLFxufTtcblxuY29uc3QgdHJhY2tQcm92aWRlckNoYW5nZSA9IGRlYm91bmNlKHByb3ZpZGVyTmFtZSA9PiB7XG4gIGFuYWx5dGljc1Nlc3Npb25JZCA9IGFuYWx5dGljc1Nlc3Npb25JZCB8fCBEYXRlLm5vdygpLnRvU3RyaW5nKCk7XG4gIHRyYWNrKFxuICAgIEFuYWx5dGljc0V2ZW50cy5DSEFOR0VfVEFCLFxuICAgIHtcbiAgICAgICdxdWlja29wZW4tcHJvdmlkZXInOiBwcm92aWRlck5hbWUsXG4gICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQsXG4gICAgfVxuICApO1xufSwgQW5hbHl0aWNzRGVib3VuY2VEZWxheXMuQ0hBTkdFX1RBQik7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfY3VycmVudFByb3ZpZGVyOiBPYmplY3Q7XG4gIF9wcmV2aW91c0ZvY3VzOiA/SFRNTEVsZW1lbnQ7XG4gIF9yZWFjdERpdjogSFRNTEVsZW1lbnQ7XG4gIF9zZWFyY2hDb21wb25lbnQ6IFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50O1xuICBfc2VhcmNoUGFuZWw6IGF0b20kUGFuZWw7XG4gIF9zdWJzY3JpcHRpb25zOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kZWJvdW5jZWRVcGRhdGVNb2RhbFBvc2l0aW9uOiAoKSA9PiB2b2lkO1xuICBfbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gbnVsbDtcbiAgICB0aGlzLl9tYXhTY3JvbGxhYmxlQXJlYUhlaWdodCA9IDEwMDAwO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2N1cnJlbnRQcm92aWRlciA9IGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKS5nZXRQcm92aWRlckJ5TmFtZShERUZBVUxUX1BST1ZJREVSKTtcbiAgICBjb25zdCBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIgPSByZXF1aXJlKCcuL1F1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlcicpO1xuICAgIFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5nZXRJbnN0YW5jZSgpLnJlZ2lzdGVyKGFjdGlvbiA9PiB7XG4gICAgICBpZiAoYWN0aW9uLmFjdGlvblR5cGUgPT09IFF1aWNrU2VsZWN0aW9uRGlzcGF0Y2hlci5BY3Rpb25UeXBlLkFDVElWRV9QUk9WSURFUl9DSEFOR0VEKSB7XG4gICAgICAgIHRoaXMudG9nZ2xlUHJvdmlkZXIoYWN0aW9uLnByb3ZpZGVyTmFtZSk7XG4gICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3JlYWN0RGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fc2VhcmNoUGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHtpdGVtOiB0aGlzLl9yZWFjdERpdiwgdmlzaWJsZTogZmFsc2V9KTtcbiAgICB0aGlzLl9kZWJvdW5jZWRVcGRhdGVNb2RhbFBvc2l0aW9uID0gZGVib3VuY2UodGhpcy5fdXBkYXRlU2Nyb2xsYWJsZUhlaWdodC5iaW5kKHRoaXMpLCAyMDApO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLl9kZWJvdW5jZWRVcGRhdGVNb2RhbFBvc2l0aW9uKTtcbiAgICB0aGlzLl9jdXN0b21pemVNb2RhbEVsZW1lbnQoKTtcbiAgICB0aGlzLl91cGRhdGVTY3JvbGxhYmxlSGVpZ2h0KCk7XG5cbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQgPSB0aGlzLl9yZW5kZXIoKTtcblxuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5vblNlbGVjdGlvbigoc2VsZWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCBvcHRpb25zID0ge307XG4gICAgICBpZiAoc2VsZWN0aW9uLmxpbmUpIHtcbiAgICAgICAgb3B0aW9ucy5pbml0aWFsTGluZSA9IHNlbGVjdGlvbi5saW5lO1xuICAgICAgfVxuICAgICAgaWYgKHNlbGVjdGlvbi5jb2x1bW4pIHtcbiAgICAgICAgb3B0aW9ucy5pbml0aWFsQ29sdW1uID0gc2VsZWN0aW9uLmNvbHVtbjtcbiAgICAgIH1cblxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihzZWxlY3Rpb24ucGF0aCwgb3B0aW9ucykudGhlbih0ZXh0RWRpdG9yID0+IHtcbiAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcodGV4dEVkaXRvciksICd0YWJzOmtlZXAtcHJldmlldy10YWInKTtcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBxdWVyeSA9IHRoaXMuX3NlYXJjaENvbXBvbmVudC5nZXRJbnB1dFRleHRFZGl0b3IoKS50ZXh0Q29udGVudDtcbiAgICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IHRoaXMuX2N1cnJlbnRQcm92aWRlci5uYW1lO1xuICAgICAgLy8gZGVmYXVsdCB0byBlbXB0eSBzdHJpbmcgYmVjYXVzZSBgdHJhY2tgIGVuZm9yY2VzIHN0cmluZy1vbmx5IHZhbHVlc1xuICAgICAgY29uc3Qgc291cmNlUHJvdmlkZXIgPSBzZWxlY3Rpb24uc291cmNlUHJvdmlkZXIgfHwgJyc7XG4gICAgICB0cmFjayhcbiAgICAgICAgQW5hbHl0aWNzRXZlbnRzLlNFTEVDVF9GSUxFLFxuICAgICAgICB7XG4gICAgICAgICAgJ3F1aWNrb3Blbi1maWxlcGF0aCc6IHNlbGVjdGlvbi5wYXRoLFxuICAgICAgICAgICdxdWlja29wZW4tcXVlcnknOiBxdWVyeSxcbiAgICAgICAgICAncXVpY2tvcGVuLXByb3ZpZGVyJzogcHJvdmlkZXJOYW1lLCAvLyBUaGUgY3VycmVudGx5IG9wZW4gXCJ0YWJcIi5cbiAgICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQgfHwgJycsXG4gICAgICAgICAgLy8gQmVjYXVzZSB0aGUgYHByb3ZpZGVyYCBpcyB1c3VhbGx5IE9tbmlTZWFyY2gsIGFsc28gdHJhY2sgdGhlIG9yaWdpbmFsIHByb3ZpZGVyLlxuICAgICAgICAgICdxdWlja29wZW4tcHJvdmlkZXItc291cmNlJzogc291cmNlUHJvdmlkZXIsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICB0aGlzLmNsb3NlU2VhcmNoUGFuZWwoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2JvZHknLCAnY29yZTpjYW5jZWwnLCAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9zZWFyY2hQYW5lbCAmJiB0aGlzLl9zZWFyY2hQYW5lbC5pc1Zpc2libGUoKSkge1xuICAgICAgICAgIHRoaXMuY2xvc2VTZWFyY2hQYW5lbCgpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICk7XG5cbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQub25DYW5jZWxsYXRpb24oKCkgPT4gdGhpcy5jbG9zZVNlYXJjaFBhbmVsKCkpO1xuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5vblNlbGVjdGlvbkNoYW5nZWQoZGVib3VuY2UoKHNlbGVjdGlvbjogYW55KSA9PiB7XG4gICAgICAvLyBPbmx5IHRyYWNrIHVzZXItaW5pdGlhdGVkIHNlbGVjdGlvbi1jaGFuZ2UgZXZlbnRzLlxuICAgICAgaWYgKGFuYWx5dGljc1Nlc3Npb25JZCAhPSBudWxsKSB7XG4gICAgICAgIHRyYWNrKFxuICAgICAgICAgIEFuYWx5dGljc0V2ZW50cy5DSEFOR0VfU0VMRUNUSU9OLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdxdWlja29wZW4tc2VsZWN0ZWQtaW5kZXgnOiBzZWxlY3Rpb24uc2VsZWN0ZWRJdGVtSW5kZXgudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICdxdWlja29wZW4tc2VsZWN0ZWQtc2VydmljZSc6IHNlbGVjdGlvbi5zZWxlY3RlZFNlcnZpY2UsXG4gICAgICAgICAgICAncXVpY2tvcGVuLXNlbGVjdGVkLWRpcmVjdG9yeSc6IHNlbGVjdGlvbi5zZWxlY3RlZERpcmVjdG9yeSxcbiAgICAgICAgICAgICdxdWlja29wZW4tc2Vzc2lvbic6IGFuYWx5dGljc1Nlc3Npb25JZCxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSwgQW5hbHl0aWNzRGVib3VuY2VEZWxheXMuQ0hBTkdFX1NFTEVDVElPTikpO1xuICB9XG5cbiAgLy8gQ3VzdG9taXplIHRoZSBlbGVtZW50IGNvbnRhaW5pbmcgdGhlIG1vZGFsLlxuICBfY3VzdG9taXplTW9kYWxFbGVtZW50KCkge1xuICAgIGNvbnN0IG1vZGFsRWxlbWVudCA9ICgodGhpcy5fc2VhcmNoUGFuZWwuZ2V0SXRlbSgpLnBhcmVudE5vZGU6IGFueSk6IEhUTUxFbGVtZW50KTtcbiAgICBtb2RhbEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ21hcmdpbi1sZWZ0JywgJzAnKTtcbiAgICBtb2RhbEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ3dpZHRoJywgJ2F1dG8nKTtcbiAgICBtb2RhbEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ2xlZnQnLCBNT0RBTF9NQVJHSU4gKyAncHgnKTtcbiAgICBtb2RhbEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoJ3JpZ2h0JywgTU9EQUxfTUFSR0lOICsgJ3B4Jyk7XG4gIH1cblxuICBfdXBkYXRlU2Nyb2xsYWJsZUhlaWdodCgpIHtcbiAgICBjb25zdCB7aGVpZ2h0fSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0aGlzLl9tYXhTY3JvbGxhYmxlQXJlYUhlaWdodCA9IGhlaWdodCAtIE1PREFMX01BUkdJTiAtIFRPUEJBUl9BUFBST1hfSEVJR0hUO1xuICAgIC8vIEZvcmNlIGEgcmUtcmVuZGVyIHRvIHVwZGF0ZSBfbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQuXG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50ID0gdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIHJldHVybiBSZWFjdC5yZW5kZXIoXG4gICAgICA8UXVpY2tTZWxlY3Rpb25Db21wb25lbnRcbiAgICAgICAgYWN0aXZlUHJvdmlkZXI9e3RoaXMuX2N1cnJlbnRQcm92aWRlcn1cbiAgICAgICAgb25Qcm92aWRlckNoYW5nZT17dGhpcy5oYW5kbGVBY3RpdmVQcm92aWRlckNoYW5nZS5iaW5kKHRoaXMpfVxuICAgICAgICBtYXhTY3JvbGxhYmxlQXJlYUhlaWdodD17dGhpcy5fbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHR9XG4gICAgICAvPixcbiAgICAgIHRoaXMuX3JlYWN0RGl2XG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZUFjdGl2ZVByb3ZpZGVyQ2hhbmdlKG5ld1Byb3ZpZGVyTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdHJhY2tQcm92aWRlckNoYW5nZShuZXdQcm92aWRlck5hbWUpO1xuICAgIHRoaXMuX2N1cnJlbnRQcm92aWRlciA9IGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKS5nZXRQcm92aWRlckJ5TmFtZShuZXdQcm92aWRlck5hbWUpO1xuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudCA9IHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgdG9nZ2xlT21uaVNlYXJjaFByb3ZpZGVyKCk6IHZvaWQge1xuICAgIHJlcXVpcmUoJy4vUXVpY2tTZWxlY3Rpb25BY3Rpb25zJykuY2hhbmdlQWN0aXZlUHJvdmlkZXIoJ09tbmlTZWFyY2hSZXN1bHRQcm92aWRlcicpO1xuICB9XG5cbiAgdG9nZ2xlUHJvdmlkZXIocHJvdmlkZXJOYW1lOiBzdHJpbmcpIHtcbiAgICBhbmFseXRpY3NTZXNzaW9uSWQgPSBhbmFseXRpY3NTZXNzaW9uSWQgfHwgRGF0ZS5ub3coKS50b1N0cmluZygpO1xuICAgIHRyYWNrKFxuICAgICAgQW5hbHl0aWNzRXZlbnRzLkNIQU5HRV9UQUIsXG4gICAgICB7XG4gICAgICAgICdxdWlja29wZW4tcHJvdmlkZXInOiBwcm92aWRlck5hbWUsXG4gICAgICAgICdxdWlja29wZW4tc2Vzc2lvbic6IGFuYWx5dGljc1Nlc3Npb25JZCxcbiAgICAgIH1cbiAgICApO1xuICAgIGNvbnN0IHByb3ZpZGVyID0gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpLmdldFByb3ZpZGVyQnlOYW1lKHByb3ZpZGVyTmFtZSk7XG4gICAgLy8gXCJ0b2dnbGVcIiBiZWhhdmlvclxuICAgIGlmIChcbiAgICAgIHRoaXMuX3NlYXJjaFBhbmVsICE9PSBudWxsICYmXG4gICAgICB0aGlzLl9zZWFyY2hQYW5lbC5pc1Zpc2libGUoKSAmJlxuICAgICAgcHJvdmlkZXJOYW1lID09PSB0aGlzLl9jdXJyZW50UHJvdmlkZXIubmFtZVxuICAgICkge1xuICAgICAgdGhpcy5jbG9zZVNlYXJjaFBhbmVsKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fY3VycmVudFByb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgaWYgKHRoaXMuX3NlYXJjaENvbXBvbmVudCkge1xuICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50ID0gdGhpcy5fcmVuZGVyKCk7XG4gICAgfVxuICAgIHRoaXMuc2hvd1NlYXJjaFBhbmVsKCk7XG4gIH1cblxuICBzaG93U2VhcmNoUGFuZWwoKSB7XG4gICAgdGhpcy5fcHJldmlvdXNGb2N1cyA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKHRoaXMuX3NlYXJjaENvbXBvbmVudCAmJiB0aGlzLl9zZWFyY2hQYW5lbCkge1xuICAgICAgLy8gU3RhcnQgYSBuZXcgc2VhcmNoIFwic2Vzc2lvblwiIGZvciBhbmFseXRpY3MgcHVycG9zZXMuXG4gICAgICB0cmFjayhcbiAgICAgICAgQW5hbHl0aWNzRXZlbnRzLk9QRU5fUEFORUwsXG4gICAgICAgIHtcbiAgICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQgfHwgJycsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICAvLyBzaG93U2VhcmNoUGFuZWwgZ2V0cyBjYWxsZWQgd2hlbiBjaGFuZ2luZyBwcm92aWRlcnMgZXZlbiBpZiBpdCdzIGFscmVhZHkgc2hvd24uXG4gICAgICBjb25zdCBpc0FscmVhZHlWaXNpYmxlID0gdGhpcy5fc2VhcmNoUGFuZWwuaXNWaXNpYmxlKCk7XG4gICAgICB0aGlzLl9zZWFyY2hQYW5lbC5zaG93KCk7XG4gICAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQuZm9jdXMoKTtcbiAgICAgIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1xdWljay1vcGVuLnVzZVNlbGVjdGlvbicpICYmICFpc0FscmVhZHlWaXNpYmxlKSB7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVGV4dCA9IHRoaXMuX2dldEZpcnN0U2VsZWN0aW9uVGV4dCgpO1xuICAgICAgICBpZiAoc2VsZWN0ZWRUZXh0ICYmIHNlbGVjdGVkVGV4dC5sZW5ndGggPD0gTUFYX1NFTEVDVElPTl9MRU5HVEgpIHtcbiAgICAgICAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQuc2V0SW5wdXRWYWx1ZShzZWxlY3RlZFRleHQuc3BsaXQoJ1xcbicpWzBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50LnNlbGVjdElucHV0KCk7XG4gICAgfVxuICB9XG5cbiAgY2xvc2VTZWFyY2hQYW5lbCgpIHtcbiAgICBpZiAodGhpcy5fc2VhcmNoQ29tcG9uZW50ICYmIHRoaXMuX3NlYXJjaFBhbmVsKSB7XG4gICAgICB0cmFjayhcbiAgICAgICAgQW5hbHl0aWNzRXZlbnRzLkNMT1NFX1BBTkVMLFxuICAgICAgICB7XG4gICAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkIHx8ICcnLFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgdGhpcy5fc2VhcmNoUGFuZWwuaGlkZSgpO1xuICAgICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50LmJsdXIoKTtcbiAgICAgIGFuYWx5dGljc1Nlc3Npb25JZCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3ByZXZpb3VzRm9jdXMgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcHJldmlvdXNGb2N1cy5mb2N1cygpO1xuICAgICAgdGhpcy5fcHJldmlvdXNGb2N1cyA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2dldEZpcnN0U2VsZWN0aW9uVGV4dCgpOiA/c3RyaW5nIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvcikge1xuICAgICAgcmV0dXJuIGVkaXRvci5nZXRTZWxlY3Rpb25zKClbMF0uZ2V0VGV4dCgpO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcbmZ1bmN0aW9uIGdldEFjdGl2YXRpb24oKTogQWN0aXZhdGlvbiB7XG4gIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oKTtcbiAgfVxuICByZXR1cm4gYWN0aXZhdGlvbjtcbn1cblxubGV0IGxpc3RlbmVyczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgbGlzdGVuZXJzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICBsaXN0ZW5lcnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1xdWljay1vcGVuOmZpbmQtYW55dGhpbmctdmlhLW9tbmktc2VhcmNoJzogKCkgPT4ge1xuICAgICAgICAgIGdldEFjdGl2YXRpb24oKS50b2dnbGVPbW5pU2VhcmNoUHJvdmlkZXIoKTtcbiAgICAgICAgfSxcbiAgICAgIH0pLFxuICAgICk7XG4gICAgZ2V0QWN0aXZhdGlvbigpO1xuICB9LFxuXG4gIHJlZ2lzdGVyUHJvdmlkZXIoc2VydmljZTogUHJvdmlkZXIgKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpLnJlZ2lzdGVyUHJvdmlkZXIoc2VydmljZSk7XG4gIH0sXG5cbiAgcmVnaXN0ZXJTdG9yZSgpIHtcbiAgICByZXR1cm4gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpO1xuICB9LFxuXG4gIGdldEhvbWVGcmFnbWVudHMoKTogSG9tZUZyYWdtZW50cyB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZlYXR1cmU6IHtcbiAgICAgICAgdGl0bGU6ICdRdWljayBPcGVuJyxcbiAgICAgICAgaWNvbjogJ3NlYXJjaCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnQSBwb3dlcmZ1bCBzZWFyY2ggYm94IHRvIHF1aWNrbHkgZmluZCBsb2NhbCBhbmQgcmVtb3RlIGZpbGVzIGFuZCBjb250ZW50LicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXF1aWNrLW9wZW46ZmluZC1hbnl0aGluZy12aWEtb21uaS1zZWFyY2gnLFxuICAgICAgfSxcbiAgICAgIHByaW9yaXR5OiAxMCxcbiAgICB9O1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKGFjdGl2YXRpb24pIHtcbiAgICAgIGFjdGl2YXRpb24uZGlzcG9zZSgpO1xuICAgICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmIChsaXN0ZW5lcnMpIHtcbiAgICAgIGxpc3RlbmVycy5kaXNwb3NlKCk7XG4gICAgICBsaXN0ZW5lcnMgPSBudWxsO1xuICAgIH1cbiAgICBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZGlzcG9zZSgpO1xuICB9LFxufTtcbiJdfQ==