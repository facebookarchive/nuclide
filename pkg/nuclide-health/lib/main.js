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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// Imports from non-Nuclide modules.

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

// Imports from other Nuclide packages.

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomViewableFromReactElement;

function _load_commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

// Imports from within this Nuclide package.

var _HealthPaneItem;

function _load_HealthPaneItem() {
  return _HealthPaneItem = _interopRequireDefault(require('./HealthPaneItem'));
}

var _getChildProcessesTree;

function _load_getChildProcessesTree() {
  return _getChildProcessesTree = _interopRequireDefault(require('./getChildProcessesTree'));
}

var _getStats;

function _load_getStats() {
  return _getStats = _interopRequireDefault(require('./getStats'));
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._updateAnalytics = this._updateAnalytics.bind(this);
    this._updateToolbarJewel = this._updateToolbarJewel.bind(this);

    // Observe all of the settings.
    var configs = (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.observeAsStream('nuclide-health');
    var viewTimeouts = configs.map(function (config) {
      return config.viewTimeout * 1000;
    }).distinctUntilChanged();
    var analyticsTimeouts = configs.map(function (config) {
      return config.analyticsTimeout * 60 * 1000;
    }).distinctUntilChanged();
    var toolbarJewels = configs.map(function (config) {
      return config.toolbarJewel || '';
    }).distinctUntilChanged();

    // Update the stats immediately, and then periodically based on the config.
    var statsStream = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(null).concat(viewTimeouts.switchMap((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.interval)).map((_getStats || _load_getStats()).default).share();

    var childProcessesTreeStream = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(null).concat(viewTimeouts.switchMap((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.interval)).switchMap((_getChildProcessesTree || _load_getChildProcessesTree()).default).share();

    var packageStates = statsStream.withLatestFrom(toolbarJewels).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var stats = _ref2[0];
      var toolbarJewel = _ref2[1];
      return { stats: stats, toolbarJewel: toolbarJewel };
    }).share().cache(1);

    var updateToolbarJewel = function updateToolbarJewel(value) {
      (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.set('nuclide-health.toolbarJewel', value);
    };
    this._paneItemStates = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.combineLatest(packageStates, (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(null).concat(childProcessesTreeStream), function (packageState, childProcessesTree) {
      return _extends({}, packageState, {
        childProcessesTree: childProcessesTree,
        updateToolbarJewel: updateToolbarJewel
      });
    });

    this._subscriptions = new (_atom || _load_atom()).CompositeDisposable(
    // Keep the toolbar jewel up-to-date.
    new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(packageStates.map(formatToolbarJewelLabel).subscribe(this._updateToolbarJewel)),

    // Buffer the stats and send analytics periodically.
    new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(statsStream.buffer(analyticsTimeouts.switchMap((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.interval)).subscribe(this._updateAnalytics)));
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }, {
    key: 'consumeToolBar',
    value: function consumeToolBar(getToolBar) {
      var _this = this;

      var toolBar = getToolBar('nuclide-health');
      this._healthButton = toolBar.addButton({
        icon: 'dashboard',
        callback: 'nuclide-health:toggle',
        tooltip: 'Toggle Nuclide health stats',
        priority: -400
      }).element;
      this._healthButton.classList.add('nuclide-health-jewel');
      var disposable = new (_atom || _load_atom()).Disposable(function () {
        _this._healthButton = null;
        toolBar.removeItems();
      });
      this._subscriptions.add(disposable);
      return disposable;
    }
  }, {
    key: 'consumeWorkspaceViewsService',
    value: function consumeWorkspaceViewsService(api) {
      var _this2 = this;

      (0, (_assert || _load_assert()).default)(this._paneItemStates);
      this._subscriptions.add(api.registerFactory({
        id: 'nuclide-health',
        name: 'Health',
        iconName: 'dashboard',
        toggleCommand: 'nuclide-health:toggle',
        defaultLocation: 'pane',
        create: function create() {
          (0, (_assert || _load_assert()).default)(_this2._paneItemStates != null);
          return (0, (_commonsAtomViewableFromReactElement || _load_commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom || _load_reactForAtom()).React.createElement((_HealthPaneItem || _load_HealthPaneItem()).default, { stateStream: _this2._paneItemStates }));
        },
        isInstance: function isInstance(item) {
          return item instanceof (_HealthPaneItem || _load_HealthPaneItem()).default;
        }
      }));
    }
  }, {
    key: '_updateToolbarJewel',
    value: function _updateToolbarJewel(label) {
      var healthButton = this._healthButton;
      if (healthButton != null) {
        healthButton.classList.toggle('updated', healthButton.dataset.jewelValue !== label);
        healthButton.dataset.jewelValue = label;
      }
    }
  }, {
    key: '_updateAnalytics',
    value: function _updateAnalytics(analyticsBuffer) {
      if (analyticsBuffer.length === 0) {
        return;
      }

      // Aggregates the buffered stats up by suffixing avg, min, max to their names.
      var aggregateStats = {};

      // All analyticsBuffer entries have the same keys; we use the first entry to know what they
      // are.
      Object.keys(analyticsBuffer[0]).forEach(function (statsKey) {
        // These values are not to be aggregated or sent.
        if (statsKey === 'activeHandlesByType') {
          return;
        }

        var aggregates = aggregate(analyticsBuffer.map(function (stats) {
          return typeof stats[statsKey] === 'number' ? stats[statsKey] : 0;
        }));
        Object.keys(aggregates).forEach(function (aggregatesKey) {
          var value = aggregates[aggregatesKey];
          if (value !== null && value !== undefined) {
            aggregateStats[statsKey + '_' + aggregatesKey] = value.toFixed(2);
          }
        });
      });
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-health', aggregateStats);
    }
  }]);

  return Activation;
})();

function aggregate(values) {
  var avg = values.reduce(function (prevValue, currValue, index) {
    return prevValue + (currValue - prevValue) / (index + 1);
  }, 0);
  var min = Math.min.apply(Math, values);
  var max = Math.max.apply(Math, values);
  return { avg: avg, min: min, max: max };
}

function formatToolbarJewelLabel(opts) {
  var stats = opts.stats;
  var toolbarJewel = opts.toolbarJewel;

  switch (toolbarJewel) {
    case 'CPU':
      return stats.cpuPercentage.toFixed(0) + '%';
    case 'Heap':
      return stats.heapPercentage.toFixed(0) + '%';
    case 'Memory':
      return Math.floor(stats.rss / 1024 / 1024) + 'M';
    case 'Handles':
      return '' + stats.activeHandles;
    case 'Child processes':
      return '' + stats.activeHandlesByType.childprocess.length;
    case 'Event loop':
      return '' + stats.activeRequests;
    default:
      return '';
  }
}

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;