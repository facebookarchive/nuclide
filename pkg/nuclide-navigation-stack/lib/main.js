'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import {onDidRemoveProjectPath} from '../../commons-atom/projects';
import {getViewOfEditor} from '../../commons-atom/text-editor';
import {NavigationStackController} from './NavigationStackController';
import {trackOperationTiming} from '../../nuclide-analytics';
import {DisposableSubscription} from '../../nuclide-commons';
import {observeNavigatingEditors} from '../../commons-atom/go-to-location';

const controller = new NavigationStackController();

class Activation {
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
  }

  activate() {

    const subscribeEditor = (editor: atom$TextEditor) => {
      const cursorSubscription = editor.onDidChangeCursorPosition(
        (event: ChangeCursorPositionEvent) => {
          controller.updatePosition(editor, event.newBufferPosition);
        });
      const scrollSubscription = getViewOfEditor(editor).onDidChangeScrollTop(
        scrollTop => {
          controller.updateScroll(editor, scrollTop);
        });
      this._disposables.add(cursorSubscription);
      this._disposables.add(scrollSubscription);
      const destroySubscription = editor.onDidDestroy(() => {
        controller.onDestroy(editor);
        this._disposables.remove(cursorSubscription);
        this._disposables.remove(scrollSubscription);
        this._disposables.remove(destroySubscription);
      });
      this._disposables.add(destroySubscription);
    };

    const addEditor = (addEvent: AddTextEditorEvent) => {
      const editor = addEvent.textEditor;
      subscribeEditor(editor);
      controller.onCreate(editor);
    };

    atom.workspace.getTextEditors().forEach(subscribeEditor);
    this._disposables.add(atom.workspace.onDidAddTextEditor(addEditor));
    this._disposables.add(atom.workspace.onDidOpen((event: OnDidOpenEvent) => {
      if (atom.workspace.isTextEditor(event.item)) {
        controller.onOpen((event.item: any));
      }
    }));
    this._disposables.add(atom.workspace.observeActivePaneItem(item => {
      if (atom.workspace.isTextEditor(item)) {
        controller.onActivate((item: any));
      }
    }));
    this._disposables.add(atom.workspace.onDidStopChangingActivePaneItem(item => {
      if (atom.workspace.isTextEditor(item)) {
        controller.onActiveStopChanging((item: any));
      }
    }));
    this._disposables.add(onDidRemoveProjectPath(path => {
      controller.removePath(
        path, atom.project.getDirectories().map(directory => directory.getPath()));
    }));
    this._disposables.add(
      new DisposableSubscription(
        observeNavigatingEditors().subscribe(editor => {
          controller.onOptInNavigation(editor);
        })
      )
    );

    this._disposables.add(
      atom.commands.add('atom-workspace',
      'nuclide-navigation-stack:navigate-forwards', () => {
        trackOperationTiming(
          'nuclide-navigation-stack:forwards', () => controller.navigateForwards());
      }));
    this._disposables.add(
      atom.commands.add('atom-workspace',
      'nuclide-navigation-stack:navigate-backwards', () => {
        trackOperationTiming(
          'nuclide-navigation-stack:backwards', () => controller.navigateBackwards());
      }));
  }

  dispose() {
    this._disposables.dispose();
  }
}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (activation == null) {
    activation = new Activation(state);
    activation.activate();
  }
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
