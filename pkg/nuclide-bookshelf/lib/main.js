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

var _accumulateState2;

function _accumulateState() {
  return _accumulateState2 = require('./accumulateState');
}

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _applyActionMiddleware2;

function _applyActionMiddleware() {
  return _applyActionMiddleware2 = require('./applyActionMiddleware');
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _Commands2;

function _Commands() {
  return _Commands2 = require('./Commands');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _commonsAtomCreatePackage2;

function _commonsAtomCreatePackage() {
  return _commonsAtomCreatePackage2 = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../commons-node/event');
}

var _utils4;

function _utils3() {
  return _utils4 = require('./utils');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

function createStateStream(actions, initialState) {
  var states = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).BehaviorSubject(initialState);
  actions.scan((_accumulateState2 || _accumulateState()).accumulateState, initialState).subscribe(states);
  return states;
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var initialState = undefined;
    try {
      initialState = (0, (_utils2 || _utils()).deserializeBookShelfState)(state);
    } catch (error) {
      (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('failed to deserialize nuclide-bookshelf state', state, error);
      initialState = (0, (_utils2 || _utils()).getEmptBookShelfState)();
    }

    var actions = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
    var states = this._states = createStateStream((0, (_applyActionMiddleware2 || _applyActionMiddleware()).applyActionMiddleware)(actions, function () {
      return _this._states.getValue();
    }), initialState);

    var dispatch = function dispatch(action) {
      actions.next(action);
    };
    var commands = new (_Commands2 || _Commands()).Commands(dispatch, function () {
      return states.getValue();
    });

    var addedRepoSubscription = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).getHgRepositoryStream)().subscribe(function (repository) {
      // $FlowFixMe: why isn't HgRepositoryClient considered atom$Repository?
      commands.addProjectRepository(repository);
    });

    var paneStateChangeSubscription = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).subscribe(function () {
      commands.updatePaneItemState();
    });

    var shortHeadChangeSubscription = (0, (_utils4 || _utils3()).getShortHeadChangesFromStateStream)(states).switchMap(function (_ref) {
      var repositoryPath = _ref.repositoryPath;
      var activeShortHead = _ref.activeShortHead;

      var repository = atom.project.getRepositories().filter(function (repo) {
        return repo != null && repo.getWorkingDirectory() === repositoryPath;
      })[0];
      (0, (_assert2 || _assert()).default)(repository != null, 'shortHead changed on a non-existing repository!');

      switch ((_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get((_constants2 || _constants()).ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG)) {
        case (_constants2 || _constants()).ActiveShortHeadChangeBehavior.ALWAYS_IGNORE:
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('bookshelf-always-ignore');
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
        case (_constants2 || _constants()).ActiveShortHeadChangeBehavior.ALWAYS_RESTORE:
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('bookshelf-always-restore');
          // The restore needs to wait for the change shorthead state update to complete
          // before triggering a cascaded state update when handling the restore action.
          // TODO(most): move away from `nextTick`.
          process.nextTick(function () {
            commands.restorePaneItemState(repository, activeShortHead);
          });
          return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.empty();
        default:
          // Including ActiveShortHeadChangeBehavior.PROMPT_TO_RESTORE
          (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('bookshelf-prompt-restore');
          return (0, (_utils4 || _utils3()).shortHeadChangedNotification)(repository, activeShortHead, commands.restorePaneItemState);
      }
    }).subscribe();

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(actions.complete.bind(actions)), new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(addedRepoSubscription), new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(paneStateChangeSubscription), new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(shortHeadChangeSubscription));
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
        return (0, (_utils2 || _utils()).serializeBookShelfState)(this._states.getValue());
      } catch (error) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('failed to serialize nuclide-bookshelf state', error);
        return null;
      }
    }
  }]);

  return Activation;
})();

exports.default = (0, (_commonsAtomCreatePackage2 || _commonsAtomCreatePackage()).default)(Activation);
module.exports = exports.default;