/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

export type {ScrollbarIndicatorMarkType} from './constants';
export {scrollbarMarkTypes} from './constants';

import type {ThemeColors} from './themeColors';

import type {ScrollbarIndicatorMarkType} from './constants';
import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import Model from 'nuclide-commons/Model';
import * as React from 'react';
import Immutable from 'immutable';
import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nullthrows from 'nullthrows';
import {Observable} from 'rxjs';
import {scrollbarMarkTypes} from './constants';
import ScrollBar from './ScrollBar';

import {getThemeChangeEvents, getThemeColors} from './themeColors';

export type ScrollbarIndicatorMark = {|
  +start: number,
  +end: number,
|};

export type ScrollbarIndicatorUpdate = {
  editor: atom$TextEditor,
  markTypes: Map<ScrollbarIndicatorMarkType, Set<ScrollbarIndicatorMark>>,
};
export type ScrollbarIndicatorProvider = {
  onUpdate: ((ScrollbarIndicatorUpdate) => void) => IDisposable,
};

type EditorMarks = Immutable.Map<
  atom$TextEditor,
  Immutable.Map<
    ScrollbarIndicatorMarkType,
    Immutable.Map<ScrollbarIndicatorProvider, Set<ScrollbarIndicatorMark>>,
  >,
>;

class Activation {
  _disposables: UniversalDisposable;
  _model: Model<{editorLines: EditorMarks, colors: ?ThemeColors}>;
  _contextForEditor: Map<atom$TextEditor, CanvasRenderingContext2D>;

  constructor() {
    this._disposables = new UniversalDisposable();
    this._model = new Model({editorLines: Immutable.Map(), colors: null});

    this._disposables.add(
      getThemeChangeEvents().subscribe(colors => {
        this._model.setState({colors: getThemeColors()});
      }),
      atom.workspace.observeTextEditors(editor => {
        const props = Observable.combineLatest(
          this._model.toObservable().map(state => ({
            markTypes: state.editorLines.get(editor),
            colors: state.colors,
          })),
          observePaneItemVisibility(editor),
        ).map(([{markTypes, markers, colors}, editorIsVisible]) => ({
          editorIsVisible,
          colors,
          markTypes,
          editor,
        }));

        const Component = bindObservableAsProps(props, ScrollBar);
        const node = renderReactRoot(<Component />);

        const editorView = atom.views.getView(editor);

        const scrollBarView = editorView.getElementsByClassName(
          'vertical-scrollbar',
        )[0];

        nullthrows(scrollBarView.parentNode).insertBefore(
          node,
          scrollBarView.nextSibling,
        );

        this._disposables.addUntilDestroyed(editor, () => {
          node.remove();
        });
      }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeScrollbarIndicators(
    provider: ScrollbarIndicatorProvider,
  ): IDisposable {
    const disposable = new UniversalDisposable(
      observableFromSubscribeFunction(cb => provider.onUpdate(cb)).subscribe(
        update => {
          const newEditorLines = Object.values(scrollbarMarkTypes).reduce(
            (editorLines, _type) => {
              // Object.values returns mixed, so we have to tell Flow that we
              // trust the types of these `type`s.
              const type: ScrollbarIndicatorMarkType = (_type: any);
              const typeMarks = update.markTypes.get(type) || new Set();
              return editorLines.updateIn(
                [update.editor, type, provider],
                marks => typeMarks,
              );
            },
            this._model.state.editorLines,
          );
          this._model.setState({editorLines: newEditorLines});
        },
      ),
    );
    this._disposables.add(disposable);
    return disposable;
  }
}

createPackage(module.exports, Activation);
