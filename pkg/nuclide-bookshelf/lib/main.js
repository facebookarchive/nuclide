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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _accumulateState;

function _load_accumulateState() {
  return _accumulateState = require('./accumulateState');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _applyActionMiddleware;

function _load_applyActionMiddleware() {
  return _applyActionMiddleware = require('./applyActionMiddleware');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _Commands;

function _load_Commands() {
  return _Commands = require('./Commands');
}

var _commonsAtomCreatePackage;

function _load_commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent;

function _load_commonsNodeEvent() {
  return _commonsNodeEvent = require('../../commons-node/event');
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function createStateStream(actions, initialState) {
  var states = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).BehaviorSubject(initialState);
  actions.scan((_accumulateState || _load_accumulateState()).accumulateState, initialState).subscribe(states);
  return states;
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var initialState = undefined;
    try {
      initialState = (0, (_utils || _load_utils()).deserializeBookShelfState)(state);
    } catch (error) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('failed to deserialize nuclide-bookshelf state', state, error);
      initialState = (0, (_utils || _load_utils()).getEmptBookShelfState)();
    }

    var actions = new (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Subject();
    var states = this._states = createStateStream((0, (_applyActionMiddleware || _load_applyActionMiddleware()).applyActionMiddleware)(actions, function () {
      return _this._states.getValue();
    }), initialState);

    var dispatch = function dispatch(action) {
      actions.next(action);
    };
    var commands = new (_Commands || _load_Commands()).Commands(dispatch, function () {
      return states.getValue();
    });

    var addedRepoSubscription = (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).getHgRepositoryStream)().subscribe(function (repository) {
      commands.addProjectRepository(repository);
    });

    var paneStateChangeSubscription = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_commonsNodeEvent || _load_commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).subscribe(function () {
      commands.updatePaneItemState();
    });

    var shortHeadChangeSubscription = (0, (_utils2 || _load_utils2()).getShortHeadChangesFromStateStream)(states).switchMap(function (_ref) {
      var repositoryPath = _ref.repositoryPath;
      var activeShortHead = _ref.activeShortHead;

      var repository = atom.project.getRepositories().filter(function (repo) {
        return repo != null && repo.getWorkingDirectory() === repositoryPath;
      })[0];
      (0, (_assert || _load_assert()).default)(repository != null, 'shortHead changed on a non-existing repository!');

      switch ((_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get((_constants || _load_constants()).ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG)) {
        case (_constants || _load_constants()).ActiveShortHeadChangeBehavior.ALWAYS_IGNORE:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-always-ignore');
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        case (_constants || _load_constants()).ActiveShortHeadChangeBehavior.ALWAYS_RESTORE:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-always-restore');
          // The restore needs to wait for the change shorthead state update to complete
          // before triggering a cascaded state update when handling the restore action.
          // TODO(most): move away from `nextTick`.
          process.nextTick(function () {
            commands.restorePaneItemState(repository, activeShortHead);
          });
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        default:
          // Including ActiveShortHeadChangeBehavior.PROMPT_TO_RESTORE
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-prompt-restore');
          return (0, (_utils2 || _load_utils2()).shortHeadChangedNotification)(repository, activeShortHead, commands.restorePaneItemState);
      }
    }).subscribe();

    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(actions.complete.bind(actions), addedRepoSubscription, paneStateChangeSubscription, shortHeadChangeSubscription);
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      try {
        return (0, (_utils || _load_utils()).serializeBookShelfState)(this._states.getValue());
      } catch (error) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('failed to serialize nuclide-bookshelf state', error);
        return null;
      }
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage || _load_commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;