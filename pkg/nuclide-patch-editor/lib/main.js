'use strict';

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./redux/Actions'));
}

var _redux;

function _load_redux() {
  return _redux = require('redux');
}

var _createEmptyAppState;

function _load_createEmptyAppState() {
  return _createEmptyAppState = require('./redux/createEmptyAppState');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _atom = require('atom');

var _InteractiveFileChanges;

function _load_InteractiveFileChanges() {
  return _InteractiveFileChanges = _interopRequireDefault(require('./ui/InteractiveFileChanges'));
}

var _textEditor;

function _load_textEditor() {
  return _textEditor = require('../../commons-atom/text-editor');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../../commons-node/event');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _vcs;

function _load_vcs() {
  return _vcs = require('../../commons-atom/vcs');
}

var _Reducers;

function _load_Reducers() {
  return _Reducers = require('./redux/Reducers');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Activation {

  constructor(rawState) {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    const initialState = (0, (_createEmptyAppState || _load_createEmptyAppState()).createEmptyAppState)();
    this._states = new _rxjsBundlesRxMinJs.BehaviorSubject(initialState);

    this._store = (0, (_redux || _load_redux()).createStore)((_Reducers || _load_Reducers()).rootReducer, initialState);

    this._actionCreators = (0, (_redux || _load_redux()).bindActionCreators)(_Actions || _load_Actions(), this._store.dispatch);
  }

  consumeCwdApi(cwdApi) {
    const subscription = (0, (_event || _load_event()).observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi)).switchMap(directory => {
      const repository = directory ? (0, (_vcs || _load_vcs()).repositoryForPath)(directory.getPath()) : null;
      if (repository == null || repository.getType() !== 'hg') {
        return _rxjsBundlesRxMinJs.Observable.of(false);
      }

      const hgRepository = repository;

      return (0, (_event || _load_event()).observableFromSubscribeFunction)(hgRepository.onDidChangeInteractiveMode.bind(hgRepository));
    }).switchMap(isInteractiveMode => {
      if (!isInteractiveMode) {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      return (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.workspace.observePanes.bind(atom.workspace)).flatMap(pane => {
        return (0, (_event || _load_event()).observableFromSubscribeFunction)(pane.observeActiveItem.bind(pane)).switchMap(paneItem => {
          if (!(0, (_textEditor || _load_textEditor()).isValidTextEditor)(paneItem)) {
            return _rxjsBundlesRxMinJs.Observable.empty();
          }

          const editor = paneItem;

          return (0, (_event || _load_event()).observableFromSubscribeFunction)(editor.onDidChangePath.bind(editor)).startWith(editor.getPath()).switchMap(editorPath => {
            if (editorPath == null || !editorPath.endsWith('.diff')) {
              return _rxjsBundlesRxMinJs.Observable.empty();
            }

            return _rxjsBundlesRxMinJs.Observable.of(editor);
          });
        }).takeUntil((0, (_event || _load_event()).observableFromSubscribeFunction)(pane.onDidDestroy.bind(pane)));
      });
    }).subscribe(this._renderOverEditor.bind(this));

    this._subscriptions.add(subscription);
    return new _atom.Disposable(() => {
      this._subscriptions.remove(subscription);
    });
  }

  _renderOverEditor(editor) {
    const diffContent = editor.getText();
    const patch = (0, (_utils || _load_utils()).parseWithAnnotations)(diffContent);
    if (patch.length > 0) {
      // Clear the editor so that closing the tab without hitting 'Confirm' won't
      // cause the commit to go through by default
      editor.setText('');
      editor.save();
      editor.getGutters().forEach(gutter => gutter.hide());
      const editorView = atom.views.getView(editor);
      editorView.style.visibility = 'hidden';
      const item = document.createElement('div');

      const editorPath = editor.getPath();

      if (!(editorPath != null)) {
        throw new Error('Invariant violation: "editorPath != null"');
      }

      this._actionCreators.registerPatchEditor(editorPath, patch);

      const element = _react.default.createElement((_InteractiveFileChanges || _load_InteractiveFileChanges()).default, {
        onConfirm: content => onConfirm(editor, content),
        onManualEdit: () => onManualEdit(editor, diffContent, marker, editorView),
        onQuit: () => atom.workspace.getActivePane().destroyItem(editor),
        patch: patch
      });
      _reactDom.default.render(element, item);
      item.style.visibility = 'visible';

      const marker = editor.markScreenPosition([0, 0]);
      editor.decorateMarker(marker, {
        type: 'block',
        item
      });

      marker.onDidDestroy(() => {
        _reactDom.default.unmountComponentAtNode(item);
        this._actionCreators.deregisterPatchEditor(editorPath);
      });
    }
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function onConfirm(editor, content) {
  editor.setText(content);
  editor.save();
  atom.workspace.getActivePane().destroyItem(editor);
}

function onManualEdit(editor, content, marker, editorView) {
  editor.setText(content);
  editor.save();
  editor.setGrammar(atom.grammars.grammarForScopeName('source.mercurial.diff'));
  marker.destroy();
  editorView.style.visibility = 'visible';
  editor.getGutters().forEach(gutter => gutter.show());
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);