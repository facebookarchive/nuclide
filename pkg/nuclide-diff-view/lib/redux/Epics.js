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

exports.addRepositoryEpic = addRepositoryEpic;
exports.activateRepositoryEpic = activateRepositoryEpic;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionTypes2;

function _ActionTypes() {
  return _ActionTypes2 = _interopRequireWildcard(require('./ActionTypes'));
}

var _Actions2;

function _Actions() {
  return _Actions2 = _interopRequireWildcard(require('./Actions'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeEvent2;

function _commonsNodeEvent() {
  return _commonsNodeEvent2 = require('../../../commons-node/event');
}

var _RepositoryStack2;

function _RepositoryStack() {
  return _RepositoryStack2 = require('../RepositoryStack');
}

var UPDATE_STATUS_DEBOUNCE_MS = 50;

function observeStatusChanges(repository) {
  return (0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)).debounceTime(UPDATE_STATUS_DEBOUNCE_MS).map(function () {
    return null;
  }).startWith(null);
}

// An added, but not-activated repository would continue to provide dirty file change updates,
// because they are cheap to compute, while needed in the UI.

function addRepositoryEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).ADD_REPOSITORY);
    var repository = action.payload.repository;

    return observeStatusChanges(repository).map(function () {
      return (_Actions2 || _Actions()).updateDirtyFiles(repository, (0, (_RepositoryStack2 || _RepositoryStack()).getDirtyFileChanges)(repository));
    }).takeUntil((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository))).concat((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of((_Actions2 || _Actions()).removeRepository(repository)));
  });
}

// A repository is considered activated only when the Diff View is open.
// This allows to not bother with loading revision info and changes when not needed.

function activateRepositoryEpic(actions, store) {
  return actions.ofType((_ActionTypes2 || _ActionTypes()).ACTIVATE_REPOSITORY).flatMap(function (action) {
    (0, (_assert2 || _assert()).default)(action.type === (_ActionTypes2 || _ActionTypes()).ACTIVATE_REPOSITORY);
    var repository = action.payload.repository;

    var statusChanges = observeStatusChanges(repository);
    var revisionChanges = repository.observeRevisionChanges();
    var revisionStatusChanges = repository.observeRevisionStatusesChanges();

    var _store$getState = store.getState();

    var repositoriesStates = _store$getState.repositoriesStates;

    var initialRepositoryState = repositoriesStates.get(repository);
    (0, (_assert2 || _assert()).default)(initialRepositoryState != null, 'Cannot activate repository before adding it!');

    var diffOptionChanges = actions.filter(function (a) {
      return a.type === (_ActionTypes2 || _ActionTypes()).SET_DIFF_OPTION && a.payload.repository === repository;
    }).map(function (a) {
      (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).SET_DIFF_OPTION);
      return a.payload.diffOption;
    }).startWith(initialRepositoryState.diffOption);

    var compareIdChanges = actions.filter(function (a) {
      return a.type === (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID && a.payload.repository === repository;
    }).map(function (a) {
      (0, (_assert2 || _assert()).default)(a.type === (_ActionTypes2 || _ActionTypes()).SET_COMPARE_ID);
      return a.payload.compareId;
    }).startWith(initialRepositoryState.selectedCompareId);

    var selectedFileUpdates = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, diffOptionChanges, compareIdChanges, statusChanges, function (revisions, diffOption, compareId) {
      return { revisions: revisions, diffOption: diffOption, compareId: compareId };
    }).filter(function (_ref) {
      var revisions = _ref.revisions;
      return (0, (_RepositoryStack2 || _RepositoryStack()).getHeadRevision)(revisions) != null;
    }).switchMap(function (_ref2) {
      var revisions = _ref2.revisions;
      var compareId = _ref2.compareId;
      var diffOption = _ref2.diffOption;
      return(
        // TODO(most): Add loading states.
        (0, (_RepositoryStack2 || _RepositoryStack()).getSelectedFileChanges)(repository, diffOption, revisions, compareId)
      );
    }).map(function (revisionFileChanges) {
      return (_Actions2 || _Actions()).updateSelectedFiles(repository, revisionFileChanges);
    });

    var revisionStateUpdates = (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.combineLatest(revisionChanges, revisionStatusChanges).filter(function (_ref3) {
      var _ref32 = _slicedToArray(_ref3, 1);

      var revisions = _ref32[0];
      return (0, (_RepositoryStack2 || _RepositoryStack()).getHeadRevision)(revisions) != null;
    }).map(function (_ref4) {
      var _ref42 = _slicedToArray(_ref4, 2);

      var revisions = _ref42[0];
      var revisionStatuses = _ref42[1];
      return (_Actions2 || _Actions()).updateHeadToForkBaseRevisionsState(repository, (0, (_RepositoryStack2 || _RepositoryStack()).getHeadToForkBaseRevisions)(revisions), revisionStatuses);
    });

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge(selectedFileUpdates, revisionStateUpdates).takeUntil((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((0, (_commonsNodeEvent2 || _commonsNodeEvent()).observableFromSubscribeFunction)(repository.onDidDestroy.bind(repository)), actions.filter(function (a) {
      return a.type === (_ActionTypes2 || _ActionTypes()).DEACTIVATE_REPOSITORY && a.payload.repository === repository;
    })));
  });
}