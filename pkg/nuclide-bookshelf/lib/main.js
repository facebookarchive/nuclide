'use strict';

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

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Commands;

function _load_Commands() {
  return _Commands = require('./Commands');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _event;

function _load_event() {
  return _event = require('nuclide-commons/event');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createStateStream(actions, initialState) {
  const states = new _rxjsBundlesRxMinJs.BehaviorSubject(initialState);
  actions.scan((_accumulateState || _load_accumulateState()).accumulateState, initialState).catch(error => {
    (0, (_log4js || _load_log4js()).getLogger)('nuclide-bookshelf').fatal('bookshelf middleware got broken', error);
    atom.notifications.addError('Nuclide bookshelf broke, please report a bug to help us fix it!');
    return _rxjsBundlesRxMinJs.Observable.empty();
  }).subscribe(states);
  return states;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

class Activation {

  constructor(state) {
    let initialState;
    try {
      initialState = (0, (_utils || _load_utils()).deserializeBookShelfState)(state);
    } catch (error) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-bookshelf').error('failed to deserialize nuclide-bookshelf state', state, error);
      initialState = (0, (_utils || _load_utils()).getEmptBookShelfState)();
    }

    const actions = new _rxjsBundlesRxMinJs.Subject();
    const states = this._states = createStateStream((0, (_applyActionMiddleware || _load_applyActionMiddleware()).applyActionMiddleware)(actions, () => this._states.getValue()), initialState);

    const dispatch = action => {
      actions.next(action);
    };
    const commands = new (_Commands || _load_Commands()).Commands(dispatch, () => states.getValue());

    const addedRepoSubscription = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).getHgRepositoryStream)().subscribe(repository => {
      // $FlowFixMe wrong repository type
      commands.addProjectRepository(repository);
    });

    const paneStateChangeSubscription = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).subscribe(() => {
      commands.updatePaneItemState();
    });

    const shortHeadChangeSubscription = (0, (_utils || _load_utils()).getShortHeadChangesFromStateStream)(states).switchMap(({ repositoryPath, activeShortHead }) => {
      const repository = atom.project.getRepositories().filter(repo => {
        return repo != null && repo.getWorkingDirectory() === repositoryPath;
      })[0];

      if (!(repository != null)) {
        throw new Error('shortHead changed on a non-existing repository!');
      }

      switch ((_featureConfig || _load_featureConfig()).default.get((_constants || _load_constants()).ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG)) {
        case (_constants || _load_constants()).ActiveShortHeadChangeBehavior.ALWAYS_IGNORE:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-always-ignore');
          return _rxjsBundlesRxMinJs.Observable.empty();
        case (_constants || _load_constants()).ActiveShortHeadChangeBehavior.ALWAYS_RESTORE:
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-always-restore');
          // The restore needs to wait for the change shorthead state update to complete
          // before triggering a cascaded state update when handling the restore action.
          // TODO(most): move away from `nextTick`.
          process.nextTick(() => {
            commands.restorePaneItemState(repository, activeShortHead);
          });
          return _rxjsBundlesRxMinJs.Observable.empty();
        default:
          // Including ActiveShortHeadChangeBehavior.PROMPT_TO_RESTORE
          (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-prompt-restore');
          return (0, (_utils || _load_utils()).shortHeadChangedNotification)(repository, activeShortHead, commands.restorePaneItemState);
      }
    }).subscribe();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(actions.complete.bind(actions), addedRepoSubscription, paneStateChangeSubscription, shortHeadChangeSubscription);
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    try {
      return (0, (_utils || _load_utils()).serializeBookShelfState)(this._states.getValue());
    } catch (error) {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-bookshelf').error('failed to serialize nuclide-bookshelf state', error);
      return null;
    }
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);