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

exports.getEmptBookShelfState = getEmptBookShelfState;
exports.serializeBookShelfState = serializeBookShelfState;
exports.deserializeBookShelfState = deserializeBookShelfState;
exports.getRepoPathToEditors = getRepoPathToEditors;
exports.shortHeadChangedNotification = shortHeadChangedNotification;
exports.getShortHeadChangesFromStateStream = getShortHeadChangesFromStateStream;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _constants2;

function _constants() {
  return _constants2 = require('./constants');
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _nuclideAnalytics2;

function _nuclideAnalytics() {
  return _nuclideAnalytics2 = require('../../nuclide-analytics');
}

function getEmptBookShelfState() {
  return {
    repositoryPathToState: (_immutable2 || _immutable()).default.Map()
  };
}

// Maps are serialized as key/value pairs array to match Map `enries` format.

function serializeBookShelfState(bookShelfState) {
  var repositoryPathToState = bookShelfState.repositoryPathToState;

  var serializedRepositoryPathToState = Array.from(repositoryPathToState.entries()).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var repositoryPath = _ref2[0];
    var repositoryState = _ref2[1];

    var serializedShortHeadToFileList = {
      activeShortHead: repositoryState.activeShortHead,
      shortHeadsToFileList: Array.from(repositoryState.shortHeadsToFileList.entries())
    };
    return [repositoryPath, serializedShortHeadToFileList];
  });
  return {
    repositoryPathToState: serializedRepositoryPathToState
  };
}

function deserializeBookShelfState(serializedBookShelfState) {
  if (serializedBookShelfState == null || serializedBookShelfState.repositoryPathToState == null) {
    return getEmptBookShelfState();
  }
  var repositoryPathToState = (_immutable2 || _immutable()).default.Map(serializedBookShelfState.repositoryPathToState.map(function (_ref3) {
    var _ref32 = _slicedToArray(_ref3, 2);

    var repositoryPath = _ref32[0];
    var repositoryState = _ref32[1];

    return [repositoryPath, {
      activeShortHead: repositoryState.activeShortHead,
      isRestoring: false,
      shortHeadsToFileList: (_immutable2 || _immutable()).default.Map(repositoryState.shortHeadsToFileList)
    }];
  }));
  return {
    repositoryPathToState: repositoryPathToState
  };
}

function getRepoPathToEditors() {
  var reposToEditors = new Map();
  atom.workspace.getTextEditors().filter(function (textEditor) {
    return textEditor.getPath() != null && textEditor.getPath() !== '';
  }).map(function (textEditor) {
    return {
      textEditor: textEditor,
      repository: (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(textEditor.getPath() || '')
    };
  }).filter(function (_ref4) {
    var repository = _ref4.repository;
    return repository != null;
  }).forEach(function (_ref5) {
    var repository = _ref5.repository;
    var textEditor = _ref5.textEditor;

    (0, (_assert2 || _assert()).default)(repository);
    var repositoryPath = repository.getWorkingDirectory();
    reposToEditors.set(repositoryPath, (reposToEditors.get(repositoryPath) || []).concat([textEditor]));
  });
  return reposToEditors;
}

function shortHeadChangedNotification(repository, newShortHead, restorePaneItemState) {
  return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var workingDirectoryName = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(repository.getWorkingDirectory());

    // TODO(most): Should we handle empty bookmark switches differently?
    var newShortHeadDisplayText = newShortHead.length > 0 ? 'to `' + newShortHead + '`' : '';

    var shortHeadChangeNotification = atom.notifications.addInfo('`' + workingDirectoryName + '`\'s active bookmark has changed ' + newShortHeadDisplayText, {
      detail: 'Would you like to open the files you had active then?\n \n' + 'ProTip: Change the default behavior from \'Nuclide Settings>IDE Settings>Book Shelf\'',
      dismissable: true,
      buttons: [{
        onDidClick: function onDidClick() {
          restorePaneItemState(repository, newShortHead);
          observer.complete();
        },
        text: 'Open files'
      }, {
        onDidClick: function onDidClick() {
          (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.set((_constants2 || _constants()).ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG, (_constants2 || _constants()).ActiveShortHeadChangeBehavior.ALWAYS_IGNORE);
          observer.complete();
        },
        text: 'Always ignore'
      }]
    });

    var dismissSubscription = shortHeadChangeNotification.onDidDismiss(function () {
      (0, (_nuclideAnalytics2 || _nuclideAnalytics()).track)('bookshelf-dismiss-restore-prompt');
      observer.complete();
    });

    return function unsubscribe() {
      dismissSubscription.dispose();
      shortHeadChangeNotification.dismiss();
    };
  });
}

function getShortHeadChangesFromStateStream(states) {
  return states
  // $FlowFixMe(matthewwithanm): Type this.
  .pairwise().flatMap(function (_ref6) {
    var _ref62 = _slicedToArray(_ref6, 2);

    var oldBookShelfState = _ref62[0];
    var newBookShelfState = _ref62[1];
    var oldRepositoryPathToState = oldBookShelfState.repositoryPathToState;

    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.from(Array.from(newBookShelfState.repositoryPathToState.entries()).filter(function (_ref7) {
      var _ref72 = _slicedToArray(_ref7, 2);

      var repositoryPath = _ref72[0];
      var newRepositoryState = _ref72[1];

      var oldRepositoryState = oldRepositoryPathToState.get(repositoryPath);
      return oldRepositoryState != null && oldRepositoryState.activeShortHead !== newRepositoryState.activeShortHead;
    }).map(function (_ref8) {
      var _ref82 = _slicedToArray(_ref8, 2);

      var repositoryPath = _ref82[0];
      var newRepositoryState = _ref82[1];
      var activeShortHead = newRepositoryState.activeShortHead;

      return {
        repositoryPath: repositoryPath,
        activeShortHead: activeShortHead
      };
    }));
  });
}