/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IconName} from 'nuclide-commons-ui/Icon';
import type {Props} from './ui/DiagnosticsView';
import type {DiagnosticGroup, GlobalViewState} from './types';
import type {DiagnosticMessage} from '../../atom-ide-diagnostics/lib/types';
import type {RegExpFilterChange} from 'nuclide-commons-ui/RegExpFilter';

import dockForLocation from 'nuclide-commons-atom/dock-for-location';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import memoizeUntilChanged from 'nuclide-commons/memoizeUntilChanged';
import nuclideUri from 'nuclide-commons/nuclideUri';
import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import {arrayEqual, areSetsEqual} from 'nuclide-commons/collection';
import {fastDebounce} from 'nuclide-commons/observable';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import React from 'react';
import analytics from 'nuclide-commons/analytics';
import Model from 'nuclide-commons/Model';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {Observable} from 'rxjs';
import {getFilterPattern} from 'nuclide-commons-ui/RegExpFilter';
import * as GroupUtils from './GroupUtils';
import DiagnosticsView from './ui/DiagnosticsView';

type SerializedDiagnosticsViewModel = {
  deserializer: 'atom-ide-ui.DiagnosticsViewModel',
  state: {
    hiddenGroups: Array<DiagnosticGroup>,
  },
};

type State = {|
  hiddenGroups: Set<DiagnosticGroup>,
  selectedMessage: ?DiagnosticMessage,
  textFilter: {|
    text: string,
    isRegExp: boolean,
    invalid: boolean,
    pattern: ?RegExp,
  |},
|};

export const WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics';

export class DiagnosticsViewModel {
  _element: ?HTMLElement;
  _model: Model<State>;
  _props: Observable<Props>;
  _disposables: IDisposable;

  constructor(globalStates: Observable<GlobalViewState>) {
    // Memoize `_filterDiagnostics()`
    (this: any)._filterDiagnostics = memoizeUntilChanged(
      this._filterDiagnostics,
      (diagnostics, pattern, hiddenGroups, filterPath) => ({
        diagnostics,
        pattern,
        hiddenGroups,
        filterPath,
      }),
      (a, b) =>
        patternsAreEqual(a.pattern, b.pattern) &&
        areSetsEqual(a.hiddenGroups, b.hiddenGroups) &&
        arrayEqual(a.diagnostics, b.diagnostics) &&
        a.filterPath === b.filterPath,
    );

    const {pattern, invalid} = getFilterPattern('', false);
    this._model = new Model({
      // TODO: Get this from constructor/serialization.
      hiddenGroups: new Set(),
      textFilter: {text: '', isRegExp: false, pattern, invalid},
      selectedMessage: null,
    });
    const visibility = observePaneItemVisibility(this).distinctUntilChanged();
    this._disposables = new UniversalDisposable(
      visibility
        .let(fastDebounce(1000))
        .distinctUntilChanged()
        .filter(Boolean)
        .subscribe(() => {
          analytics.track('diagnostics-show-table');
        }),
    );

    // Combine the state that's shared between instances, the state that's unique to this instance,
    // and unchanging callbacks, to get the props for our component.
    const props = Observable.combineLatest(
      globalStates,
      this._model.toObservable(),
      visibility,
      (globalState, instanceState, isVisible) => ({
        ...globalState,
        ...instanceState,
        isVisible,
        diagnostics: this._filterDiagnostics(
          globalState.diagnostics,
          instanceState.textFilter.pattern,
          instanceState.hiddenGroups,
          globalState.filterByActiveTextEditor
            ? globalState.pathToActiveTextEditor
            : null,
        ),
        onTypeFilterChange: this._handleTypeFilterChange,
        onTextFilterChange: this._handleTextFilterChange,
        selectMessage: this._selectMessage,
        gotoMessageLocation: goToDiagnosticLocation,
        supportedMessageKinds: globalState.supportedMessageKinds,
      }),
    );

    this._props = this._trackVisibility(props);
  }

  // If autoVisibility setting is on, then automatically show/hide on changes.
  _trackVisibility(props: Observable<Props>): Observable<Props> {
    let lastDiagnostics = [];
    return props.do(newProps => {
      if (
        newProps.autoVisibility &&
        !arrayEqual(
          newProps.diagnostics,
          lastDiagnostics,
          (a, b) => a.text === b.text,
        )
      ) {
        const pane = atom.workspace.paneForItem(this);
        if (newProps.diagnostics.length > 0 && !newProps.isVisible) {
          // We want to call workspace.open but it has no option to
          // show the new pane without activating it.
          // So instead we find the dock for the pane and show() it directly.
          // https://github.com/atom/atom/issues/16007
          if (pane != null) {
            pane.activateItem(this);
            const dock = dockForLocation(pane.getContainer().getLocation());
            if (dock != null) {
              dock.show();
            }
          }
        } else if (newProps.diagnostics.length === 0 && newProps.isVisible) {
          // Only hide the diagnostics if it's the only item in its pane.
          if (pane != null) {
            const items = pane.getItems();
            if (
              items.length === 1 &&
              items[0] instanceof DiagnosticsViewModel
            ) {
              atom.workspace.hide(this);
            }
          }
        }
        lastDiagnostics = newProps.diagnostics;
      }
    });
  }

  destroy(): void {
    this._disposables.dispose();
  }

  getTitle(): string {
    return 'Diagnostics';
  }

  getIconName(): IconName {
    return 'law';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'bottom';
  }

  serialize(): SerializedDiagnosticsViewModel {
    const {hiddenGroups} = this._model.state;
    return {
      deserializer: 'atom-ide-ui.DiagnosticsViewModel',
      state: {
        hiddenGroups: [...hiddenGroups],
      },
    };
  }

  getElement(): HTMLElement {
    if (this._element == null) {
      const Component = bindObservableAsProps(this._props, DiagnosticsView);
      const element = renderReactRoot(<Component />);
      element.classList.add('diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }

  /**
   * Toggle the filter.
   */
  _handleTypeFilterChange = (type: DiagnosticGroup): void => {
    const {hiddenGroups} = this._model.state;
    const hidden = hiddenGroups.has(type);
    const nextHiddenTypes = new Set(hiddenGroups);
    if (hidden) {
      nextHiddenTypes.delete(type);
    } else {
      nextHiddenTypes.add(type);
    }
    this._model.setState({hiddenGroups: nextHiddenTypes});
    analytics.track('diagnostics-panel-change-filter');
  };

  _handleTextFilterChange = (value: RegExpFilterChange): void => {
    const {text, isRegExp} = value;
    // TODO: Fuzzy if !isRegExp?
    const {invalid, pattern} = getFilterPattern(text, isRegExp);
    this._model.setState({
      textFilter: {text, isRegExp, invalid, pattern},
    });
    analytics.track('diagnostics-panel-change-filter');
  };

  _filterDiagnostics(
    diagnostics: Array<DiagnosticMessage>,
    pattern: ?RegExp,
    hiddenGroups: Set<DiagnosticGroup>,
    filterByPath: ?string,
  ): Array<DiagnosticMessage> {
    return diagnostics.filter(message => {
      if (hiddenGroups.has(GroupUtils.getGroup(message))) {
        return false;
      }
      if (filterByPath != null && message.filePath !== filterByPath) {
        return false;
      }
      if (pattern == null) {
        return true;
      }
      return (
        (message.text != null && pattern.test(message.text)) ||
        (message.html != null && pattern.test(message.html)) ||
        pattern.test(message.providerName) ||
        pattern.test(message.filePath)
      );
    });
  }

  _selectMessage = (message: DiagnosticMessage): void => {
    this._model.setState({selectedMessage: message});
  };
}

function goToDiagnosticLocation(
  message: DiagnosticMessage,
  options: {|focusEditor: boolean|},
): void {
  // TODO: what should we do for project-path diagnostics?
  if (nuclideUri.endsWithSeparator(message.filePath)) {
    return;
  }

  analytics.track('diagnostics-panel-goto-location');

  const uri = message.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  const line = Math.max(message.range ? message.range.start.row : 0, 0);
  const column = 0;
  goToLocation(uri, {
    line,
    column,
    activatePane: options.focusEditor,
    pending: true,
  });
}

function patternsAreEqual(a: ?RegExp, b: ?RegExp) {
  if (a === b) {
    return true;
  }
  if (a == null && b == null) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  return (
    a.source === b.source &&
    a.global === b.global &&
    a.multiline === b.multiline &&
    a.ignoreCase === b.ignoreCase
  );
}
