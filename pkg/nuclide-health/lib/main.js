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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

// Imports from other Nuclide packages.

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _commonsAtomViewableFromReactElement2;

function _commonsAtomViewableFromReactElement() {
  return _commonsAtomViewableFromReactElement2 = require('../../commons-atom/viewableFromReactElement');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

// Imports from within this Nuclide package.

var _HealthPaneItem2;

function _HealthPaneItem() {
  return _HealthPaneItem2 = _interopRequireDefault(require('./HealthPaneItem'));
}

var _getChildProcessesTree2;

function _getChildProcessesTree() {
  return _getChildProcessesTree2 = _interopRequireDefault(require('./getChildProcessesTree'));
}

var _getStats2;

function _getStats() {
  return _getStats2 = _interopRequireDefault(require('./getStats'));
}

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._updateAnalytics = this._updateAnalytics.bind(this);
    this._updateToolbarJewel = this._updateToolbarJewel.bind(this);

    // Observe all of the settings.
    var configs = (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.observeAsStream('nuclide-health');
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
    var statsStream = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(null).concat(viewTimeouts.switchMap((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.interval)).map((_getStats2 || _getStats()).default).share();

    var childProcessesTreeStream = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(null).concat(viewTimeouts.switchMap((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.interval)).switchMap((_getChildProcessesTree2 || _getChildProcessesTree()).default).share();

    var packageStates = statsStream.withLatestFrom(toolbarJewels).map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var stats = _ref2[0];
      var toolbarJewel = _ref2[1];
      return { stats: stats, toolbarJewel: toolbarJewel };
    }).share().cache(1);

    var updateToolbarJewel = function updateToolbarJewel(value) {
      (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.set('nuclide-health.toolbarJewel', value);
    };
    this._paneItemStates = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(packageStates, (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of(null).concat(childProcessesTreeStream), function (packageState, childProcessesTree) {
      return _extends({}, packageState, {
        childProcessesTree: childProcessesTree,
        updateToolbarJewel: updateToolbarJewel
      });
    });

    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable(
    // Keep the toolbar jewel up-to-date.
    new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(packageStates.map(formatToolbarJewelLabel).subscribe(this._updateToolbarJewel)),

    // Buffer the stats and send analytics periodically.
    new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(statsStream.buffer(analyticsTimeouts.switchMap((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.interval)).subscribe(this._updateAnalytics)));
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
      var disposable = new (_atom2 || _atom()).Disposable(function () {
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

      (0, (_assert2 || _assert()).default)(this._paneItemStates);
      this._subscriptions.add(api.registerFactory({
        id: 'nuclide-health',
        name: 'Health',
        iconName: 'dashboard',
        toggleCommand: 'nuclide-health:toggle',
        defaultLocation: 'pane',
        create: function create() {
          (0, (_assert2 || _assert()).default)(_this2._paneItemStates != null);
          return (0, (_commonsAtomViewableFromReactElement2 || _commonsAtomViewableFromReactElement()).viewableFromReactElement)((_reactForAtom2 || _reactForAtom()).React.createElement((_HealthPaneItem2 || _HealthPaneItem()).default, { stateStream: _this2._paneItemStates }));
        },
        isInstance: function isInstance(item) {
          return item instanceof (_HealthPaneItem2 || _HealthPaneItem()).default;
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
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('nuclide-health', aggregateStats);
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

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;