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
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import Model from 'nuclide-commons/Model';
import * as React from 'react';
import Immutable from 'immutable';
import ReactDOM from 'react-dom';
import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import nullthrows from 'nullthrows';
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
        const editorView = atom.views.getView(editor);
        const scrollBarView = editorView.getElementsByClassName(
          'vertical-scrollbar',
        )[0];

        const wrapper = document.createElement('div');
        wrapper.classList.add('scroll-marker-view');
        nullthrows(scrollBarView.parentNode).insertBefore(
          wrapper,
          scrollBarView.nextSibling,
        );

        const props = this._model
          .toObservable()
          .map(state => {
            return {
              markTypes: state.editorLines.get(editor),
              colors: state.colors,
            };
          })
          .distinctUntilChanged()
          .map(({markTypes, markers, colors}) => ({
            colors,
            markTypes,
            editor,
          }));

        const Component = bindObservableAsProps(props, ScrollBar);

        ReactDOM.render(<Component />, wrapper);

        this._disposables.addUntilDestroyed(editor, () => {
          ReactDOM.unmountComponentAtNode(wrapper);
          const {parentNode} = scrollBarView;
          if (parentNode != null) {
            parentNode.removeChild(wrapper);
          }
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
          Object.values(scrollbarMarkTypes).forEach(_type => {
            // Object.values returns mixed, so we have to tell Flow that we
            // trust the types of these `type`s.
            const type: ScrollbarIndicatorMarkType = (_type: any);
            const typeMarks = update.markTypes.get(type) || new Set();
            const editorLines = this._model.state.editorLines.updateIn(
              [update.editor, type, provider],
              marks => typeMarks,
            );
            // TODO: We could potentially avoid making a state update for each
            // type.
            this._model.setState({editorLines});
          });
        },
      ),
    );
    this._disposables.add(disposable);
    return disposable;
  }
}

createPackage(module.exports, Activation);
