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
import type {FilterType, GlobalViewState} from './types';
import type {DiagnosticMessage} from '../../atom-ide-diagnostics/lib/types';
import type {RegExpFilterChange} from 'nuclide-commons-ui/RegExpFilter';

import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import React from 'react';
import DiagnosticsUi from './ui/DiagnosticsUi';
import analytics from 'nuclide-commons-atom/analytics';
import Model from 'nuclide-commons/Model';
import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {toggle} from 'nuclide-commons/observable';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {Observable} from 'rxjs';
import {getFilterPattern} from 'nuclide-commons-ui/RegExpFilter';

type SerializedDiagnosticsViewModel = {
  deserializer: 'atom-ide-ui.DiagnosticsViewModel',
  state: {
    hiddenTypes: Array<FilterType>,
  },
};

type State = {|
  hiddenTypes: Set<FilterType>,
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
    const {pattern, invalid} = getFilterPattern('', false);
    this._model = new Model({
      // TODO: Get this from constructor/serialization.
      hiddenTypes: new Set(),
      textFilter: {text: '', isRegExp: false, pattern, invalid},
      selectedMessage: null,
    });
    const visibility = observePaneItemVisibility(this).distinctUntilChanged();
    this._disposables = new UniversalDisposable(
      visibility
        .debounceTime(1000)
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
      (globalState, instanceState) => ({
        ...globalState,
        ...instanceState,
        diagnostics: this._filterDiagnostics(
          globalState.diagnostics,
          instanceState.textFilter.pattern,
          instanceState.hiddenTypes,
        ),
        onTypeFilterChange: this._handleTypeFilterChange,
        onTextFilterChange: this._handleTextFilterChange,
        selectMessage: this._selectMessage,
        gotoMessageLocation: goToDiagnosticLocation,
        supportedMessageKinds: globalState.supportedMessageKinds,
      }),
    );

    // "Mute" the props stream when the view is hidden so we don't do unnecessary updates.
    this._props = toggle(props, visibility);
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
    const {hiddenTypes} = this._model.state;
    return {
      deserializer: 'atom-ide-ui.DiagnosticsViewModel',
      state: {
        hiddenTypes: [...hiddenTypes],
      },
    };
  }

  getElement(): HTMLElement {
    if (this._element == null) {
      const Component = bindObservableAsProps(this._props, DiagnosticsUi);
      const element = renderReactRoot(<Component />);
      element.classList.add('diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }

  /**
   * Toggle the filter.
   */
  _handleTypeFilterChange = (type: FilterType): void => {
    const {hiddenTypes} = this._model.state;
    const hidden = hiddenTypes.has(type);
    const nextHiddenTypes = new Set(hiddenTypes);
    if (hidden) {
      nextHiddenTypes.delete(type);
    } else {
      nextHiddenTypes.add(type);
    }
    this._model.setState({hiddenTypes: nextHiddenTypes});
  };

  _handleTextFilterChange = (value: RegExpFilterChange): void => {
    const {text, isRegExp} = value;
    // TODO: Fuzzy if !isRegExp?
    const {invalid, pattern} = getFilterPattern(text, isRegExp);
    this._model.setState({
      textFilter: {text, isRegExp, invalid, pattern},
    });
  };

  // TODO: Memoize this.
  _filterDiagnostics(
    diagnostics: Array<DiagnosticMessage>,
    pattern: ?RegExp,
    hiddenTypes: Set<FilterType>,
  ): Array<DiagnosticMessage> {
    return diagnostics.filter(message => {
      if (hiddenTypes.has(getMessageFilterType(message))) {
        return false;
      }
      if (pattern == null) {
        return true;
      }
      return (
        (message.text != null && pattern.test(message.text)) ||
        (message.html != null && pattern.test(message.html)) ||
        pattern.test(message.providerName) ||
        (message.scope === 'file' && pattern.test(message.filePath))
      );
    });
  }

  _selectMessage = (message: DiagnosticMessage): void => {
    this._model.setState({selectedMessage: message});
  };
}

function getMessageFilterType(message: DiagnosticMessage): FilterType {
  const {kind} = message;
  switch (kind) {
    case 'lint':
    case null:
    case undefined:
      // We have a separate button for each severity.
      switch (message.type) {
        case 'Error':
          return 'errors';
        case 'Warning':
          return 'warnings';
        case 'Info':
          return 'warnings';
        default:
          (message.type: empty);
          throw new Error(`Invalid message severity: ${message.type}`);
      }
    case 'review':
      return 'review';
    default:
      (kind: empty);
      throw new Error(`Invalid message kind: ${kind}`);
  }
}

function goToDiagnosticLocation(
  message: DiagnosticMessage,
  options: {|focusEditor: boolean|},
): void {
  if (message.scope !== 'file' || message.filePath == null) {
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
