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
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {BehaviorSubject, Observable} from 'rxjs';

const DEFAULT_TABLE_WIDTH = 600;

type PanelProps = {
  diagnostics: Array<DiagnosticMessage>,
  width: number,
  onDismiss: () => void,
  pathToActiveTextEditor: ?string,
  filterByActiveTextEditor: boolean,
  onFilterByActiveTextEditorChange: (isChecked: boolean) => void,
  warnAboutLinter: boolean,
  disableLinter: () => void,
};

export default function createDiagnosticsPanel(
  diagnostics: Observable<Array<DiagnosticMessage>>,
  initialHeight: number,
  initialfilterByActiveTextEditor: boolean,
  disableLinter: () => void,
  onFilterByActiveTextEditorChange: (filterByActiveTextEditor: boolean) => void,
): {
  atomPanel: atom$Panel,
  setWarnAboutLinter: (warn: boolean) => void,
 } {
  const item = document.createElement('div');

  // A FixedDataTable must specify its own width. We always want it to match that of the bottom
  // panel. Unfortunately, there is no way to register for resize events on a DOM element: it is
  // only possible to listen for resize events on a window. (MutationObserver does not help here.)
  //
  // As such, we employ a hack inspired by http://stackoverflow.com/a/20888342/396304.
  // We create an invisible iframe with 100% width, so it will match the width of the panel. We
  // subscribe to its resize events and use that as a proxy for the panel being resized and update
  // the width of the FixedDataTable accordingly.
  const iframe = window.document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '1px';
  iframe.style.position = 'absolute';
  iframe.style.visibility = 'hidden';
  iframe.style.border = 'none';

  // Both the iframe and the host element for the React component are children of the root element
  // that serves as the item for the panel.
  const rootElement = document.createElement('div');
  rootElement.className = 'nuclide-diagnostics-ui';
  rootElement.appendChild(iframe);
  rootElement.appendChild(item);

  const bottomPanel = atom.workspace.addBottomPanel({item: rootElement});

  const warnAboutLinterStream = new BehaviorSubject(false);
  const setWarnAboutLinter = warn => { warnAboutLinterStream.next(warn); };

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
      initialHeight,
      initialfilterByActiveTextEditor,
      disableLinter,
      iframe.contentWindow,
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
    // $FlowFixMe: `bindObservableAsProps` needs to be typed better.
    ReactDOM.render(<Component />, item);
  });

  // Currently, destroy() does not appear to be idempotent:
  // https://github.com/atom/atom/commit/734a79b7ec9f449669e1871871fd0289397f9b60#commitcomment-12631908
  bottomPanel.onDidDestroy(() => {
    subscription.unsubscribe();
    ReactDOM.unmountComponentAtNode(item);
  });

  return {
    atomPanel: bottomPanel,
    setWarnAboutLinter,
  };
}

function getPropsStream(
  diagnosticsStream: Observable<Array<DiagnosticMessage>>,
  warnAboutLinterStream: Observable<boolean>,
  initialHeight: number,
  initialfilterByActiveTextEditor: boolean,
  disableLinter: () => void,
  win: HTMLElement,
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

  const widthStream = Observable.of(DEFAULT_TABLE_WIDTH)
    .concat(Observable.fromEvent(win, 'resize').map(() => (win: any).innerWidth));

  // $FlowFixMe: We haven't typed this function with this many args.
  return Observable.combineLatest(
    activeTextEditorPaths,
    sortedDiagnostics,
    warnAboutLinterStream,
    filterByActiveTextEditorStream,
    widthStream.first().concat(widthStream.skip(1).debounceTime(50)),
  )
    .map(([pathToActiveTextEditor, diagnostics, warnAboutLinter, filter, width]) => ({
      pathToActiveTextEditor,
      diagnostics,
      warnAboutLinter,
      disableLinter,
      filterByActiveTextEditor: filter,
      onFilterByActiveTextEditorChange: handleFilterByActiveTextEditorChange,
      width,
      initialHeight,
      onDismiss,
    }));
}
