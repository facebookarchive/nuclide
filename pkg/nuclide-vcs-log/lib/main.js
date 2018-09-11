"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;
exports.shortNameForAuthor = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _VcsLogComponent() {
  const data = _interopRequireDefault(require("./VcsLogComponent"));

  _VcsLogComponent = function () {
    return data;
  };

  return data;
}

function _VcsLogGadget() {
  const data = _interopRequireDefault(require("./VcsLogGadget"));

  _VcsLogGadget = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _projects() {
  const data = require("../../../modules/nuclide-commons-atom/projects");

  _projects = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

var _querystring = _interopRequireDefault(require("querystring"));

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _util() {
  const data = require("./util");

  _util = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _url = _interopRequireDefault(require("url"));

var React = _interopRequireWildcard(require("react"));

function _viewableFromReactElement() {
  const data = require("../../commons-atom/viewableFromReactElement");

  _viewableFromReactElement = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
// TODO: Make it possible to move or split a pane with a VcsLogPaneItem.
const SHOW_LOG_FILE_TREE_CONTEXT_MENU_PRIORITY = 500;
const NUM_LOG_RESULTS = 100;
const CONTEXT_MENU_LABEL = 'Show history';
const VCS_LOG_URI_PREFIX = 'atom://nucide-vcs-log/view';
const VCS_LOG_URI_PATHS_QUERY_PARAM = 'path';

class Activation {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();

    this._registerOpener();
  }

  _registerOpener() {
    this._subscriptions.add(atom.workspace.addOpener(uriToOpen => {
      if (!uriToOpen.startsWith(VCS_LOG_URI_PREFIX)) {
        return;
      }

      const {
        query
      } = _url.default.parse(uriToOpen,
      /* parseQueryString */
      true);

      if (!query) {
        throw new Error("Invariant violation: \"query\"");
      } // Make sure a non-zero number of paths have been specified.


      const path = query[VCS_LOG_URI_PATHS_QUERY_PARAM];
      const component = createLogPaneForPath(path);
      return component ? (0, _viewableFromReactElement().viewableFromReactElement)(component) : null;
    })); // TODO(mbolin): Once the nuclide-file-tree.context-menu is generalized to automatically add
    // menu items to the editor context menu, as appropriate, it should be possible to eliminate
    // (or at least reduce) the logic here.


    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-vcs-log:show-log-for-active-editor', () => {
      const uri = getActiveTextEditorURI();

      if (uri != null) {
        openLogPaneForURI(uri);
        (0, _nuclideAnalytics().track)('nuclide-vcs-log:open-from-text-editor');
      }
    }), atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Source Control',
        submenu: [{
          label: CONTEXT_MENU_LABEL,
          command: 'nuclide-vcs-log:show-log-for-active-editor',

          shouldDisplay() {
            const uri = getActiveTextEditorURI();
            return getRepositoryWithLogMethodForPath(uri) != null;
          }

        }]
      }]
    }));
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const contextDisposable = contextMenu.addItemToSourceControlMenu({
      label: CONTEXT_MENU_LABEL,

      callback() {
        const node = contextMenu.getSingleSelectedNode();

        if (node == null) {
          return;
        }

        const {
          uri
        } = node;
        const repository = getRepositoryWithLogMethodForPath(uri);

        if (repository == null) {
          return;
        }

        openLogPaneForURI(uri);
        (0, _nuclideAnalytics().track)('nuclide-vcs-log:open-from-file-tree');
      },

      shouldDisplay() {
        const node = contextMenu.getSingleSelectedNode();

        if (node == null) {
          return false;
        }

        return getRepositoryWithLogMethodForPath(node.uri) != null;
      }

    }, SHOW_LOG_FILE_TREE_CONTEXT_MENU_PRIORITY);

    this._subscriptions.add(contextDisposable); // We don't need to dispose of the contextDisposable when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.


    return new (_UniversalDisposable().default)(() => this._subscriptions.remove(contextDisposable));
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

function getRepositoryWithLogMethodForPath(path) {
  if (path == null) {
    return null;
  }

  const repository = (0, _nuclideVcsBase().repositoryForPath)(path); // For now, we only expect HgRepository to work. We should also find a way to
  // make this work for Git.

  if (repository != null && repository.getType() === 'hg') {
    return repository;
  } else {
    return null;
  }
}

function getActiveTextEditorURI() {
  const editor = atom.workspace.getActiveTextEditor();

  if (editor == null) {
    return null;
  }

  const filePath = editor.getPath();

  if (filePath == null) {
    return null;
  }

  return filePath;
}

function openLogPaneForURI(uri) {
  (0, _nuclideAnalytics().track)('nuclide-vcs-log:open');

  const openerURI = VCS_LOG_URI_PREFIX + '?' + _querystring.default.stringify({
    [VCS_LOG_URI_PATHS_QUERY_PARAM]: uri
  }); // Not a file URI
  // eslint-disable-next-line nuclide-internal/atom-apis


  atom.workspace.open(openerURI);
}

function createLogPaneForPath(path) {
  if (path == null) {
    return null;
  }

  const repository = getRepositoryWithLogMethodForPath(path);

  if (repository == null) {
    return null;
  }

  const {
    showDifferentialRevision
  } = _featureConfig().default.get('nuclide-vcs-log');

  if (!(typeof showDifferentialRevision === 'boolean')) {
    throw new Error("Invariant violation: \"typeof showDifferentialRevision === 'boolean'\"");
  }

  const title = `${repository.getType()} log ${(0, _string().maybeToString)((0, _projects().getAtomProjectRelativePath)(path))}`;
  const currentDiff = new _RxMin.BehaviorSubject({
    oldId: null,
    newId: null
  });

  const onDiffClick = (oldId, newId) => {
    currentDiff.next({
      oldId: null,
      newId: null
    });
    currentDiff.next({
      oldId,
      newId
    });
  };

  const contentLoader = currentDiff.switchMap(ids => {
    const {
      oldId,
      newId
    } = ids;

    if (oldId == null || newId == null) {
      return _RxMin.Observable.of({
        oldContent: null,
        newContent: null,
        error: null
      });
    }

    return _RxMin.Observable.forkJoin(oldId !== '' ? repository.fetchFileContentAtRevision(path, oldId) : _RxMin.Observable.of(''), newId !== '' ? repository.fetchFileContentAtRevision(path, newId) : _RxMin.Observable.of('')).startWith([null, null]).map(([oldContent, newContent]) => ({
      oldContent,
      newContent,
      error: null
    })).catch(error => {
      return _RxMin.Observable.of({
        oldContent: null,
        newContent: null,
        error: error.toString()
      });
    });
  });

  const props = _RxMin.Observable.combineLatest(_RxMin.Observable.fromPromise(repository.log([path], NUM_LOG_RESULTS)).map(log => log.entries).startWith(null), contentLoader).map(([logEntries, content]) => {
    return {
      files: [path],
      showDifferentialRevision,
      repository,
      onDiffClick,
      logEntries,
      fileLoadingError: content.error,
      oldContent: content.oldContent,
      newContent: content.newContent
    };
  });

  const component = (0, _bindObservableAsProps().bindObservableAsProps)(props, _VcsLogComponent().default);
  return React.createElement(_VcsLogGadget().default, {
    iconName: "repo",
    title: title,
    component: component
  });
}

let activation;

function activate(state) {
  if (activation == null) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function addItemsToFileTreeContextMenu(contextMenu) {
  if (!activation) {
    throw new Error("Invariant violation: \"activation\"");
  }

  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

const shortNameForAuthor = _util().shortNameForAuthor;

exports.shortNameForAuthor = shortNameForAuthor;