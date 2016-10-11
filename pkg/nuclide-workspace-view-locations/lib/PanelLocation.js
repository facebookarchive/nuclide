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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomCreatePaneContainer;

function _load_commonsAtomCreatePaneContainer() {
  return _commonsAtomCreatePaneContainer = _interopRequireDefault(require('../../commons-atom/create-pane-container'));
}

var _commonsAtomPanelRenderer;

function _load_commonsAtomPanelRenderer() {
  return _commonsAtomPanelRenderer = _interopRequireDefault(require('../../commons-atom/PanelRenderer'));
}

var _commonsAtomRenderReactRoot;

function _load_commonsAtomRenderReactRoot() {
  return _commonsAtomRenderReactRoot = require('../../commons-atom/renderReactRoot');
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeSimpleModel;

function _load_commonsNodeSimpleModel() {
  return _commonsNodeSimpleModel = require('../../commons-node/SimpleModel');
}

var _nuclideUiBindObservableAsProps;

function _load_nuclideUiBindObservableAsProps() {
  return _nuclideUiBindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _observePanes;

function _load_observePanes() {
  return _observePanes = require('./observePanes');
}

var _syncPaneItemVisibility;

function _load_syncPaneItemVisibility() {
  return _syncPaneItemVisibility = require('./syncPaneItemVisibility');
}

var _PanelLocationIds;

function _load_PanelLocationIds() {
  return _PanelLocationIds = _interopRequireWildcard(require('./PanelLocationIds'));
}

var _uiPanel;

function _load_uiPanel() {
  return _uiPanel = require('./ui/Panel');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

/**
 * Manages views for an Atom panel.
 */

var PanelLocation = (function (_SimpleModel) {
  _inherits(PanelLocation, _SimpleModel);

  function PanelLocation(locationId) {
    var serializedState = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, PanelLocation);

    _get(Object.getPrototypeOf(PanelLocation.prototype), 'constructor', this).call(this);
    this._handlePanelResize = this._handlePanelResize.bind(this);
    var serializedData = serializedState.data || {};
    this._paneContainer = deserializePaneContainer(serializedData.paneContainer);
    this._position = (0, (_nullthrows || _load_nullthrows()).default)(locationsToPosition.get(locationId));
    this._panelRenderer = new (_commonsAtomPanelRenderer || _load_commonsAtomPanelRenderer()).default({
      priority: 101, // Use a value higher than the default (100).
      location: this._position,
      createItem: this._createItem.bind(this)
    });
    this._panes = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject(new Set());
    this._size = serializedData.size || null;
    this.state = {
      showDropAreas: false,
      visible: serializedData.visible === true
    };
  }

  /**
   * Set up the subscriptions and make this thing "live."
   */

  _createClass(PanelLocation, [{
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      var paneContainer = this._paneContainer;

      // Create a stream that represents a change in the items of any pane. We need to do custom logic
      // for this instead of using `PaneContainer::observePaneItems()`, or the other PaneContainer
      // item events, because those [assume that moved items are not switching pane containers][1].
      // Since we have multiple pane containers, they can.
      //
      // [1]: https://github.com/atom/atom/blob/v1.10.0/src/pane-container.coffee#L232-L236
      var paneItemChanges = this._panes.map(function (x) {
        return Array.from(x);
      }).switchMap(function (panes) {
        var _Observable;

        var itemChanges = panes.map(function (pane) {
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(pane.onDidAddItem.bind(pane)), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(pane.onDidRemoveItem.bind(pane)));
        });
        return (_Observable = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable).merge.apply(_Observable, _toConsumableArray(itemChanges));
      }).share();

      this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(this._panelRenderer, (0, (_observePanes || _load_observePanes()).observePanes)(paneContainer).subscribe(this._panes), (0, (_syncPaneItemVisibility || _load_syncPaneItemVisibility()).syncPaneItemVisibility)(this._panes,
      // $FlowFixMe: Teach Flow about Symbol.observable
      (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(this).map(function (state) {
        return state.visible;
      }).distinctUntilChanged()),

      // Add a tab bar to any panes created in the container.
      paneContainer.observePanes(function (pane) {
        var tabBarView = document.createElement('ul', 'atom-tabs');

        // This should always be true. Unless they don't have atom-tabs installed or something. Do
        // we need to wait for activation of atom-tabs?
        if (typeof tabBarView.initialize !== 'function') {
          return;
        }

        tabBarView.initialize(pane);
        var paneElement = atom.views.getView(pane);
        paneElement.insertBefore(tabBarView, paneElement.firstChild);
      }),

      // If you add an item to a panel (e.g. by drag & drop), make the panel visible.
      paneItemChanges.startWith(null).map(function () {
        return _this._paneContainer.getPaneItems().length;
      }).pairwise().subscribe(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var prev = _ref2[0];
        var next = _ref2[1];

        // If there are more items now than there were before, show the panel.
        if (next > prev) {
          _this.setState({ visible: true });
        }
      }),

      // Show the drop areas while dragging.
      (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(document, 'dragstart').filter(function (event) {
        return isTab(event.target);
      }).switchMap(function () {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.concat((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(true), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(
        // Use the capturing phase in case the event propagation is stopped.
        (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(document, 'dragend', { capture: true }), (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(document, 'drop', { capture: true })).take(1).mapTo(false));
      })
      // Manipulating the DOM in the dragstart handler will fire the dragend event so we defer it.
      // See https://groups.google.com/a/chromium.org/forum/?fromgroups=#!msg/chromium-bugs/YHs3orFC8Dc/ryT25b7J-NwJ
      .observeOn((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Scheduler.async).subscribe(function (showDropAreas) {
        _this.setState({ showDropAreas: showDropAreas });
      }),

      // Render whenever the state changes. Note that state is shared between this instance and
      // the pane container, so we have to watch it as well.
      // $FlowIssue: We need to teach flow about Symbol.observable.
      (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge(paneItemChanges, (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(this)).subscribe(function () {
        _this._render();
      }));
    }
  }, {
    key: '_render',
    value: function _render() {
      // Only show the panel if it's supposed to be visible *and* there are items to show in it
      // (even if `core.destroyEmptyPanes` is `false`).
      var shouldBeVisible = this.state.showDropAreas || this.state.visible && this._paneContainer.getPaneItems().length > 0;
      this._panelRenderer.render({ visible: shouldBeVisible });
    }
  }, {
    key: '_createItem',
    value: function _createItem() {
      var _this2 = this;

      // Create an item to display in the panel. Atom will associate this item with a view via the
      // view registry (and its `getElement` method). That view will be used to display views for this
      // panel.
      // $FlowIssue: We need to teach flow about Symbol.observable.
      var props = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.from(this).map(function (state) {
        return {
          initialSize: _this2._size,
          paneContainer: _this2._paneContainer,
          position: _this2._position,
          onResize: _this2._handlePanelResize
        };
      });
      var Component = (0, (_nuclideUiBindObservableAsProps || _load_nuclideUiBindObservableAsProps()).bindObservableAsProps)(props, (_uiPanel || _load_uiPanel()).Panel);
      return { getElement: function getElement() {
          return (0, (_commonsAtomRenderReactRoot || _load_commonsAtomRenderReactRoot()).renderReactRoot)((_reactForAtom || _load_reactForAtom()).React.createElement(Component, null));
        } };
    }
  }, {
    key: '_handlePanelResize',
    value: function _handlePanelResize(size) {
      // If the user resizes the pane, store it so that we can serialize it for the next session.
      this._size = size;
    }
  }, {
    key: 'itemIsVisible',
    value: function itemIsVisible(item) {
      if (!this.state.visible) {
        return false;
      }
      for (var pane of this._panes.getValue()) {
        if (item === pane.getActiveItem()) {
          return true;
        }
      }
      return false;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._disposables.dispose();
      this._paneContainer.destroy();
    }
  }, {
    key: 'destroyItem',
    value: function destroyItem(item) {
      for (var pane of this._panes.getValue()) {
        for (var it of pane.getItems()) {
          if (it === item) {
            pane.destroyItem(it);
          }
        }
      }
    }
  }, {
    key: 'getItems',
    value: function getItems() {
      var items = [];
      for (var pane of this._panes.getValue()) {
        items.push.apply(items, _toConsumableArray(pane.getItems()));
      }
      return items;
    }
  }, {
    key: 'showItem',
    value: function showItem(item) {
      var pane = this._paneContainer.paneForItem(item);
      if (pane == null) {
        pane = this._paneContainer.getActivePane();
        pane.addItem(item);
      }
      pane.activate();
      pane.activateItem(item);
      this.setState({ visible: true });
    }

    /**
     * Hide the specified item. If the user toggles a visible item, we hide the entire pane.
     */
  }, {
    key: 'hideItem',
    value: function hideItem(item) {
      var itemIsVisible = this._paneContainer.getPanes().some(function (pane) {
        return pane.getActiveItem() === item;
      });

      // If the item's already hidden, we're done.
      if (!itemIsVisible) {
        return;
      }

      // Otherwise, hide the panel altogether.
      this.setState({ visible: false });
    }
  }, {
    key: 'isVisible',
    value: function isVisible() {
      return this.state.visible;
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      this.setState({ visible: !this.state.visible });
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        deserializer: 'PanelLocation',
        data: {
          paneContainer: this._paneContainer == null ? null : this._paneContainer.serialize(),
          size: this._size,
          visible: this.state.visible
        }
      };
    }
  }]);

  return PanelLocation;
})((_commonsNodeSimpleModel || _load_commonsNodeSimpleModel()).SimpleModel);

exports.PanelLocation = PanelLocation;

function deserializePaneContainer(serialized) {
  var paneContainer = (0, (_commonsAtomCreatePaneContainer || _load_commonsAtomCreatePaneContainer()).default)();
  if (serialized != null) {
    paneContainer.deserialize(serialized, atom.deserializers);
  }
  return paneContainer;
}

var locationsToPosition = new Map([[(_PanelLocationIds || _load_PanelLocationIds()).TOP_PANEL, 'top'], [(_PanelLocationIds || _load_PanelLocationIds()).RIGHT_PANEL, 'right'], [(_PanelLocationIds || _load_PanelLocationIds()).BOTTOM_PANEL, 'bottom'], [(_PanelLocationIds || _load_PanelLocationIds()).LEFT_PANEL, 'left']]);

function isTab(element) {
  var el = element;
  while (el != null) {
    if (el.getAttribute('is') === 'tabs-tab') {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}