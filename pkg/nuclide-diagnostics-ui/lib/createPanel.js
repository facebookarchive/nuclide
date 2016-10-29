'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiagnosticMessage} from '../../nuclide-diagnostics-common';

import {compareMessagesByFile} from './paneUtils';
import {React, ReactDOM} from 'react-for-atom';
import DiagnosticsPanel from './DiagnosticsPanel';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {toggle} from '../../commons-node/observable';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import {BehaviorSubject, Observable} from 'rxjs';

type PanelProps = {
  diagnostics: Array<DiagnosticMessage>,
  onDismiss: () => void,
  pathToActiveTextEditor: ?string,
  filterByActiveTextEditor: boolean,
  onFilterByActiveTextEditorChange: (isChecked: boolean) => void,
  warnAboutLinter: boolean,
  showTraces: boolean,
  disableLinter: () => void,
};

export default function createDiagnosticsPanel(
  diagnostics: Observable<Array<DiagnosticMessage>>,
  initialHeight: number,
  initialfilterByActiveTextEditor: boolean,
  showTraces: Observable<boolean>,
  disableLinter: () => void,
  onFilterByActiveTextEditorChange: (filterByActiveTextEditor: boolean) => void,
  warnAboutLinterStream: Observable<boolean>,
): atom$Panel {
  const rootElement = document.createElement('div');
  rootElement.className = 'nuclide-diagnostics-ui';
  const item = document.createElement('div');
  rootElement.appendChild(item);
  const bottomPanel = atom.workspace.addBottomPanel({item: rootElement});

  const panelVisibilityStream = Observable.concat(
    Observable.of(true),
    observableFromSubscribeFunction(bottomPanel.onDidChangeVisible.bind(bottomPanel)),
  )
    .distinctUntilChanged();

  // When the panel becomes visible for the first time, render the component.
  const subscription = panelVisibilityStream.filter(Boolean).take(1).subscribe(() => {
    const propsStream = getPropsStream(
      diagnostics,
      warnAboutLinterStream,
      showTraces,
      initialHeight,
      initialfilterByActiveTextEditor,
      disableLinter,
      onFilterByActiveTextEditorChange,
      () => { bottomPanel.hide(); },
    )
      .publishReplay(1)
      .refCount();

    const Component = bindObservableAsProps(
      // A stream that contains the props, but is "muted" when the panel's not visible.
      toggle(propsStream, panelVisibilityStream),
      DiagnosticsPanel,
    );
    ReactDOM.render(<Component />, item);
  });

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(() => {
    subscription.unsubscribe();
    ReactDOM.unmountComponentAtNode(item);
  });

  return bottomPanel;
}

function getPropsStream(
  diagnosticsStream: Observable<Array<DiagnosticMessage>>,
  warnAboutLinterStream: Observable<boolean>,
  showTraces: Observable<boolean>,
  initialHeight: number,
  initialfilterByActiveTextEditor: boolean,
  disableLinter: () => void,
  onFilterByActiveTextEditorChange: (filterByActiveTextEditor: boolean) => void,
  onDismiss: () => void,
): Observable<PanelProps> {
  const activeTextEditorPaths = observableFromSubscribeFunction(
    atom.workspace.observeActivePaneItem.bind(atom.workspace),
  )
    .map(paneItem => {
      if (atom.workspace.isTextEditor(paneItem)) {
        const textEditor: atom$TextEditor = (paneItem: any);
        return textEditor ? textEditor.getPath() : null;
      }
    })
    .distinctUntilChanged();

  const sortedDiagnostics = Observable.concat(
    Observable.of([]),
    diagnosticsStream.map(diagnostics => diagnostics.slice().sort(compareMessagesByFile)),
  );

  const filterByActiveTextEditorStream = new BehaviorSubject(initialfilterByActiveTextEditor);
  const handleFilterByActiveTextEditorChange = (filterByActiveTextEditor: boolean) => {
    filterByActiveTextEditorStream.next(filterByActiveTextEditor);
    onFilterByActiveTextEditorChange(filterByActiveTextEditor);
  };

  // $FlowFixMe: We haven't typed this function with this many args.
  return Observable.combineLatest(
    activeTextEditorPaths,
    sortedDiagnostics,
    warnAboutLinterStream,
    filterByActiveTextEditorStream,
    showTraces,
  )
    .map(([pathToActiveTextEditor, diagnostics, warnAboutLinter, filter, traces]) => ({
      pathToActiveTextEditor,
      diagnostics,
      warnAboutLinter,
      showTraces: traces,
      disableLinter,
      filterByActiveTextEditor: filter,
      onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange,
      initialHeight,
      onDismiss,
    }));
}
