"use strict";

function _accumulateState() {
  const data = require("./accumulateState");

  _accumulateState = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _applyActionMiddleware() {
  const data = require("./applyActionMiddleware");

  _applyActionMiddleware = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _Commands() {
  const data = require("./Commands");

  _Commands = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function createStateStream(actions, initialState) {
  const states = new _RxMin.BehaviorSubject(initialState);
  actions.scan(_accumulateState().accumulateState, initialState).catch(error => {
    (0, _log4js().getLogger)('nuclide-bookshelf').fatal('bookshelf middleware got broken', error);
    atom.notifications.addError('Nuclide bookshelf broke, please report a bug to help us fix it!');
    return _RxMin.Observable.empty();
  }).subscribe(states);
  return states;
}

class Activation {
  constructor(state) {
    let initialState;

    try {
      initialState = (0, _utils().deserializeBookShelfState)(state);
    } catch (error) {
      (0, _log4js().getLogger)('nuclide-bookshelf').error('failed to deserialize nuclide-bookshelf state', state, error);
      initialState = (0, _utils().getEmptBookShelfState)();
    }

    const actions = new _RxMin.Subject();
    const states = this._states = createStateStream((0, _applyActionMiddleware().applyActionMiddleware)(actions, () => this._states.getValue()), initialState);

    const dispatch = action => {
      actions.next(action);
    };

    const commands = new (_Commands().Commands)(dispatch, () => states.getValue());
    const addedRepoSubscription = (0, _nuclideVcsBase().getHgRepositoryStream)().subscribe(repository => {
      // $FlowFixMe wrong repository type
      commands.addProjectRepository(repository);
    });

    const paneStateChangeSubscription = _RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(atom.workspace.onDidAddPaneItem.bind(atom.workspace)), (0, _event().observableFromSubscribeFunction)(atom.workspace.onDidDestroyPaneItem.bind(atom.workspace))).subscribe(() => {
      commands.updatePaneItemState();
    });

    const shortHeadChangeSubscription = (0, _utils().getShortHeadChangesFromStateStream)(states).switchMap(({
      repositoryPath,
      activeShortHead
    }) => {
      const repository = atom.project.getRepositories().filter(repo => {
        return repo != null && repo.getWorkingDirectory() === repositoryPath;
      })[0];

      if (!(repository != null)) {
        throw new Error('shortHead changed on a non-existing repository!');
      }

      switch (_featureConfig().default.get(_constants().ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG)) {
        case _constants().ActiveShortHeadChangeBehavior.ALWAYS_IGNORE:
          (0, _nuclideAnalytics().track)('bookshelf-always-ignore');
          return _RxMin.Observable.empty();

        case _constants().ActiveShortHeadChangeBehavior.ALWAYS_RESTORE:
          (0, _nuclideAnalytics().track)('bookshelf-always-restore'); // The restore needs to wait for the change shorthead state update to complete
          // before triggering a cascaded state update when handling the restore action.
          // TODO(most): move away from `nextTick`.

          process.nextTick(() => {
            commands.restorePaneItemState(repository, activeShortHead);
          });
          return _RxMin.Observable.empty();

        default:
          // Including ActiveShortHeadChangeBehavior.PROMPT_TO_RESTORE
          (0, _nuclideAnalytics().track)('bookshelf-prompt-restore');
          return (0, _utils().shortHeadChangedNotification)(repository, activeShortHead, commands.restorePaneItemState);
      }
    }).subscribe();
    this._disposables = new (_UniversalDisposable().default)(actions.complete.bind(actions), addedRepoSubscription, paneStateChangeSubscription, shortHeadChangeSubscription);
  }

  dispose() {
    this._disposables.dispose();
  }

  serialize() {
    try {
      return (0, _utils().serializeBookShelfState)(this._states.getValue());
    } catch (error) {
      (0, _log4js().getLogger)('nuclide-bookshelf').error('failed to serialize nuclide-bookshelf state', error);
      return null;
    }
  }

}

(0, _createPackage().default)(module.exports, Activation);