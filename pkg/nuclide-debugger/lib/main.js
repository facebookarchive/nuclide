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

import type {
  DebuggerConfigAction,
  DebuggerLaunchAttachProvider,
  NuclideDebuggerProvider,
  NuclideEvaluationExpressionProvider,
} from 'nuclide-debugger-common';
import type {DatatipProvider, DatatipService} from 'atom-ide-ui';
import type {RegisterExecutorFunction, OutputService} from 'atom-ide-ui';
import type {
  Expression,
  EvaluationResult,
  FileLineBreakpoint,
  SerializedBreakpoint,
} from './types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {AtomAutocompleteProvider} from '../../nuclide-autocomplete/lib/types';

import {arrayFlatten} from 'nuclide-commons/collection';
import {AnalyticsEvents, DebuggerMode} from './constants';
import {BreakpointConfigComponent} from './BreakpointConfigComponent';
import createPackage from 'nuclide-commons-atom/createPackage';
import {getBreakpointEventLocation, getLineForEvent} from './utils';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Subject, Observable} from 'rxjs';
import invariant from 'assert';
import {track} from '../../nuclide-analytics';
import RemoteControlService from './RemoteControlService';
import DebuggerModel from './DebuggerModel';
import {debuggerDatatip} from './DebuggerDatatip';
import * as React from 'react';
import ReactDOM from 'react-dom';
import {DebuggerLaunchAttachUI} from './DebuggerLaunchAttachUI';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {ServerConnection} from '../../nuclide-remote-connection';
import {setNotificationService, setOutputService} from './AtomServiceContainer';
import {wordAtPosition, trimRange} from 'nuclide-commons-atom/range';
import {DebuggerLayoutManager} from './DebuggerLayoutManager';
import {DebuggerPaneViewModel} from './DebuggerPaneViewModel';
import {DebuggerPaneContainerViewModel} from './DebuggerPaneContainerViewModel';
import os from 'os';
import nullthrows from 'nullthrows';
import ReactMountRootElement from 'nuclide-commons-ui/ReactMountRootElement';
import {makeToolbarButtonSpec} from 'nuclide-commons-ui/ToolbarUtils';

export type SerializedState = {
  breakpoints: ?Array<SerializedBreakpoint>,
  watchExpressions: ?Array<Expression>,
  showDebugger: boolean,
  workspaceDocksVisibility: Array<boolean>,
  pauseOnException: boolean,
  pauseOnCaughtException: boolean,
};

const DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip';

class Activation {
  _disposables: UniversalDisposable;
  _model: DebuggerModel;
  _layoutManager: DebuggerLayoutManager;
  _selectedDebugConnection: ?string;
  _visibleLaunchAttachDialogMode: ?DebuggerConfigAction;
  _lauchAttachDialogCloser: ?() => void;
  _connectionProviders: Map<string, Array<DebuggerLaunchAttachProvider>>;

  constructor(state: ?SerializedState) {
    atom.views.addViewProvider(DebuggerPaneViewModel, createDebuggerView);
    atom.views.addViewProvider(
      DebuggerPaneContainerViewModel,
      createDebuggerView,
    );
    this._model = new DebuggerModel(state);
    this._selectedDebugConnection = null;
    this._visibleLaunchAttachDialogMode = null;
    this._lauchAttachDialogCloser = null;
    this._connectionProviders = new Map();
    this._layoutManager = new DebuggerLayoutManager(this._model, state);
    this._disposables = new UniversalDisposable(
      this._model,
      this._layoutManager,
      // Listen for removed connections and kill the debugger if it is using that connection.
      ServerConnection.onDidCloseServerConnection(connection => {
        const debuggerProcess = this._model.getStore().getDebuggerInstance();
        if (debuggerProcess == null) {
          return; // Nothing to do if we're not debugging.
        }
        const debuggeeTargetUri = debuggerProcess.getTargetUri();
        if (nuclideUri.isLocal(debuggeeTargetUri)) {
          return; // Nothing to do if our debug session is local.
        }
        if (
          nuclideUri.getHostname(debuggeeTargetUri) ===
          connection.getRemoteHostname()
        ) {
          this._model.getActions().stopDebugging();
        }
      }),
      this._model.onConnectionsUpdated(() => {
        const newConnections = this._model.getConnections();
        const keys = Array.from(this._connectionProviders.keys());

        const removedConnections = keys.filter(
          connection =>
            newConnections.find(item => item === connection) == null,
        );
        const addedConnections = newConnections.filter(
          connection => keys.find(item => item === connection) == null,
        );

        for (const key of removedConnections) {
          for (const provider of this._connectionProviders.get(key) || []) {
            provider.dispose();
          }

          this._connectionProviders.delete(key);
        }

        for (const connection of addedConnections) {
          this._setProvidersForConnection(connection);
        }
      }),
      this._model.onProvidersUpdated(() => {
        const connections = this._model.getConnections();
        for (const connection of connections) {
          this._setProvidersForConnection(connection);
        }
      }),
      // Commands.
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:show-attach-dialog': () => {
          const boundFn = this._showLaunchAttachDialog.bind(this);
          boundFn('attach');
        },
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:show-launch-dialog': () => {
          const boundFn = this._showLaunchAttachDialog.bind(this);
          boundFn('launch');
        },
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:continue-debugging': this._continue.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:stop-debugging': this._stop.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:restart-debugging': this._restart.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:step-over': this._stepOver.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:step-into': this._stepInto.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:step-out': this._stepOut.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:toggle-breakpoint': this._toggleBreakpoint.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:toggle-breakpoint-enabled': this._toggleBreakpointEnabled.bind(
          this,
        ),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:edit-breakpoint': this._configureBreakpoint.bind(
          this,
        ),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:remove-all-breakpoints': this._deleteAllBreakpoints.bind(
          this,
        ),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:enable-all-breakpoints': this._enableAllBreakpoints.bind(
          this,
        ),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:disable-all-breakpoints': this._disableAllBreakpoints.bind(
          this,
        ),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:remove-breakpoint': this._deleteBreakpoint.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:add-to-watch': this._addToWatch.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:run-to-location': this._runToLocation.bind(this),
      }),
      atom.commands.add('.nuclide-debugger-expression-value-list', {
        'nuclide-debugger:copy-debugger-expression-value': this._copyDebuggerExpressionValue.bind(
          this,
        ),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:copy-debugger-callstack': this._copyDebuggerCallstack.bind(
          this,
        ),
      }),
      atom.commands.add('.nuclide-debugger-disassembly-view', {
        'nuclide-debugger:copy-debugger-disassembly': this._copyDebuggerDisassembly.bind(
          this,
        ),
      }),
      atom.commands.add('.nuclide-debugger-disassembly-table', {
        'nuclide-debugger:add-disassembly-breakpoint': this._addDisassemblyBreakpoint.bind(
          this,
        ),
      }),
      atom.commands.add('.nuclide-debugger-registers-view', {
        'nuclide-debugger:copy-debugger-registers': this._copyDebuggerRegisters.bind(
          this,
        ),
      }),
      // Context Menu Items.
      atom.contextMenu.add({
        '.nuclide-debugger-disassembly-view': [
          {
            label: 'Copy disassembly',
            command: 'nuclide-debugger:copy-debugger-disassembly',
          },
        ],
        '.nuclide-debugger-disassembly-table': [
          {
            label: 'Add breakpoint at address',
            command: 'nuclide-debugger:add-disassembly-breakpoint',
          },
        ],
        '.nuclide-debugger-registers-view': [
          {
            label: 'Copy registers',
            command: 'nuclide-debugger:copy-debugger-registers',
          },
        ],
        '.nuclide-debugger-breakpoint-list': [
          {
            label: 'Enable All Breakpoints',
            command: 'nuclide-debugger:enable-all-breakpoints',
          },
          {
            label: 'Disable All Breakpoints',
            command: 'nuclide-debugger:disable-all-breakpoints',
          },
          {
            label: 'Remove All Breakpoints',
            command: 'nuclide-debugger:remove-all-breakpoints',
          },
          {type: 'separator'},
        ],
        '.nuclide-debugger-breakpoint': [
          {
            label: 'Edit breakpoint...',
            command: 'nuclide-debugger:edit-breakpoint',
            shouldDisplay: event => {
              const location = getBreakpointEventLocation(
                (event.target: HTMLElement),
              );
              if (location != null) {
                const bp = this._getBreakpointForLine(
                  location.path,
                  location.line,
                );
                return (
                  bp != null &&
                  this._model
                    .getBreakpointStore()
                    .breakpointSupportsConditions(bp)
                );
              }
              return false;
            },
          },
          {
            label: 'Remove Breakpoint',
            command: 'nuclide-debugger:remove-breakpoint',
          },
          {type: 'separator'},
        ],
        '.nuclide-debugger-callstack-table': [
          {
            label: 'Copy Callstack',
            command: 'nuclide-debugger:copy-debugger-callstack',
          },
        ],
        '.nuclide-debugger-expression-value-list': [
          {
            label: 'Copy',
            command: 'nuclide-debugger:copy-debugger-expression-value',
          },
        ],
        'atom-text-editor': [
          {type: 'separator'},
          {
            label: 'Debugger',
            submenu: [
              {
                label: 'Run to Location',
                command: 'nuclide-debugger:run-to-location',
                shouldDisplay: event => {
                  // Should also check for is paused.
                  const store = this._model.getStore();
                  const debuggerInstance = store.getDebuggerInstance();
                  if (
                    store.getDebuggerMode() === DebuggerMode.PAUSED &&
                    debuggerInstance != null &&
                    debuggerInstance
                      .getDebuggerProcessInfo()
                      .getDebuggerCapabilities().continueToLocation
                  ) {
                    return true;
                  }
                  return false;
                },
              },
              {
                label: 'Toggle Breakpoint',
                command: 'nuclide-debugger:toggle-breakpoint',
              },
              {
                label: 'Toggle Breakpoint enabled/disabled',
                command: 'nuclide-debugger:toggle-breakpoint-enabled',
                shouldDisplay: event =>
                  this._executeWithEditorPath(
                    event,
                    (filePath, line) =>
                      this._model
                        .getBreakpointStore()
                        .getBreakpointAtLine(filePath, line) != null,
                  ) || false,
              },
              {
                label: 'Edit Breakpoint...',
                command: 'nuclide-debugger:edit-breakpoint',
                shouldDisplay: event =>
                  this._executeWithEditorPath(event, (filePath, line) => {
                    const bp = this._getBreakpointForLine(filePath, line);
                    return (
                      bp != null &&
                      this._model
                        .getBreakpointStore()
                        .breakpointSupportsConditions(bp)
                    );
                  }) || false,
              },
              {
                label: 'Add to Watch',
                command: 'nuclide-debugger:add-to-watch',
                shouldDisplay: event => {
                  const textEditor = atom.workspace.getActiveTextEditor();
                  if (
                    !this._model.getStore().isDebugging() ||
                    textEditor == null
                  ) {
                    return false;
                  }
                  return (
                    textEditor.getSelections().length === 1 &&
                    !textEditor.getSelectedBufferRange().isEmpty()
                  );
                },
              },
            ],
          },
          {type: 'separator'},
        ],
      }),
      this._registerCommandsContextMenuAndOpener(),
    );
  }

  _getBreakpointForLine(path: string, line: number): ?FileLineBreakpoint {
    const store = this._model.getBreakpointStore();
    return store.getBreakpointAtLine(path, line);
  }

  _setProvidersForConnection(connection: NuclideUri): void {
    const key = nuclideUri.isRemote(connection)
      ? nuclideUri.getHostname(connection)
      : 'local';
    const availableProviders = this._model.getLaunchAttachProvidersForConnection(
      connection,
    );
    this._connectionProviders.set(key, availableProviders);
  }

  getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    let text = request.editor.getText();
    const lines = text.split('\n');
    const {row, column} = request.bufferPosition;
    // Only keep the lines up to and including the buffer position row.
    text = lines.slice(0, row + 1).join('\n');
    const debuggerInstance = this._model.getStore().getDebuggerInstance();
    if (
      debuggerInstance == null ||
      !debuggerInstance.getDebuggerProcessInfo().getDebuggerCapabilities()
        .completionsRequest
    ) {
      // As a fallback look at the variable names of currently visible scopes.
      const scopes = this._model.getScopesNow();
      return Promise.resolve(
        arrayFlatten(
          Array.from(scopes.values()).map(({scopeVariables}) =>
            scopeVariables.map(({name}) => ({text: name, type: 'variable'})),
          ),
        ),
      );
    }
    return new Promise((resolve, reject) => {
      this._model
        .getBridge()
        .sendCompletionsCommand(text, column + 1, (err, response) => {
          if (err != null) {
            reject(err);
          } else {
            const result = response.targets.map(obj => {
              const {label, type} = obj;
              let replaceText;
              if (obj.text != null) {
                replaceText = obj.text;
              } else {
                replaceText = label;
              }
              return {text: replaceText, displayText: label, type};
            });
            resolve(result);
          }
        });
    });
  }

  serialize(): SerializedState {
    const model = this._model;
    const state = {
      breakpoints: model.getBreakpointStore().getSerializedBreakpoints(),
      watchExpressions: model.getSerializedWatchExpressions(),
      showDebugger: this._layoutManager.isDebuggerVisible(),
      workspaceDocksVisibility: this._layoutManager.getWorkspaceDocksVisibility(),
      pauseOnException: this._model.getStore().getTogglePauseOnException(),
      pauseOnCaughtException: this._model
        .getStore()
        .getTogglePauseOnCaughtException(),
    };
    return state;
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandsContextMenuAndOpener(): UniversalDisposable {
    const disposable = new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        return this._layoutManager.getModelForDebuggerUri(uri);
      }),
      () => {
        this._layoutManager.hideDebuggerViews(false);
      },
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:show': event => {
          const detail = event.detail;
          const show =
            detail == null ||
            Boolean(detail.showOnlyIfHidden) === false ||
            !this._layoutManager.isDebuggerVisible();
          if (show) {
            this._layoutManager.showDebuggerViews();
          }
        },
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:hide': () => {
          this._layoutManager.hideDebuggerViews(false);
          this._model.getActions().stopDebugging();
        },
      }),
      atom.commands.add('atom-workspace', 'nuclide-debugger:toggle', () => {
        if (this._layoutManager.isDebuggerVisible() === true) {
          atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'nuclide-debugger:hide',
          );
        } else {
          atom.commands.dispatch(
            atom.views.getView(atom.workspace),
            'nuclide-debugger:show',
          );
        }
      }),
      this._model
        .getStore()
        .onDebuggerModeChange(() => this._layoutManager.debuggerModeChanged()),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:reset-layout': () => {
          this._layoutManager.resetLayout();
        },
      }),
      atom.contextMenu.add({
        '.nuclide-debugger-container': [
          {
            label: 'Debugger Views',
            submenu: [
              {
                label: 'Reset Layout',
                command: 'nuclide-debugger:reset-layout',
              },
            ],
          },
        ],
      }),
    );
    this._layoutManager.registerContextMenus();
    return disposable;
  }

  _isReadonlyTarget() {
    return this._model.getStore().getIsReadonlyTarget();
  }

  _continue() {
    // TODO(jeffreytan): when we figured out the launch lifecycle story
    // we may bind this to start-debugging too.
    if (!this._isReadonlyTarget()) {
      track(AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
      this._model.getBridge().continue();
    }
  }

  _stop() {
    this._model.getActions().stopDebugging();
  }

  _restart() {
    this._model.getActions().restartDebugger();
  }

  _stepOver() {
    if (!this._isReadonlyTarget()) {
      track(AnalyticsEvents.DEBUGGER_STEP_OVER);
      this._model.getBridge().stepOver();
    }
  }

  _stepInto() {
    if (!this._isReadonlyTarget()) {
      track(AnalyticsEvents.DEBUGGER_STEP_INTO);
      this._model.getBridge().stepInto();
    }
  }

  _stepOut() {
    if (!this._isReadonlyTarget()) {
      track(AnalyticsEvents.DEBUGGER_STEP_OUT);
      this._model.getBridge().stepOut();
    }
  }

  _toggleBreakpoint(event: any) {
    return this._executeWithEditorPath(event, (filePath, line) => {
      this._model.getActions().toggleBreakpoint(filePath, line);
    });
  }

  _toggleBreakpointEnabled(event: any) {
    this._executeWithEditorPath(event, (filePath, line) => {
      const bp = this._model
        .getBreakpointStore()
        .getBreakpointAtLine(filePath, line);

      if (bp) {
        const {id, enabled} = bp;
        this._model.getActions().updateBreakpointEnabled(id, !enabled);
      }
    });
  }

  _configureBreakpoint(event: any) {
    const location =
      getBreakpointEventLocation((event.target: HTMLElement)) ||
      this._executeWithEditorPath(event, (path, line) => ({path, line}));
    if (location != null) {
      const store = this._model.getBreakpointStore();
      const bp = this._getBreakpointForLine(location.path, location.line);
      if (bp != null && store.breakpointSupportsConditions(bp)) {
        // Open the configuration dialog.
        const container = new ReactMountRootElement();
        ReactDOM.render(
          <BreakpointConfigComponent
            breakpoint={bp}
            actions={this._model.getActions()}
            onDismiss={() => {
              ReactDOM.unmountComponentAtNode(container);
            }}
            breakpointStore={store}
          />,
          container,
        );
      }
    }
  }

  _runToLocation(event: any) {
    this._executeWithEditorPath(event, (path, line) => {
      track(AnalyticsEvents.DEBUGGER_STEP_RUN_TO_LOCATION);
      this._model.getBridge().runToLocation(path, line);
    });
  }

  _executeWithEditorPath<T>(
    event: any,
    fn: (filePath: string, line: number) => T,
  ): ?T {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor || !editor.getPath()) {
      return null;
    }

    const line = getLineForEvent(editor, event);
    return fn(nullthrows(editor.getPath()), line);
  }

  _deleteBreakpoint(event: any): void {
    const actions = this._model.getActions();
    const target = (event.target: HTMLElement);
    const path = target.dataset.path;
    const line = parseInt(target.dataset.line, 10);
    if (path == null) {
      return;
    }
    actions.deleteBreakpoint(path, line);
  }

  _deleteAllBreakpoints(): void {
    const actions = this._model.getActions();
    actions.deleteAllBreakpoints();
  }

  _enableAllBreakpoints(): void {
    const actions = this._model.getActions();
    actions.enableAllBreakpoints();
  }

  _disableAllBreakpoints(): void {
    const actions = this._model.getActions();
    actions.disableAllBreakpoints();
  }

  _renderConfigDialog(
    panel: atom$Panel,
    dialogMode: DebuggerConfigAction,
    dialogCloser: () => void,
  ): void {
    if (this._selectedDebugConnection == null) {
      // If no connection is selected yet, default to the local connection.
      this._selectedDebugConnection = 'local';
    }

    invariant(this._selectedDebugConnection != null);

    const options = this._model
      .getConnections()
      .map(connection => {
        const displayName = nuclideUri.isRemote(connection)
          ? nuclideUri.getHostname(connection)
          : 'localhost';
        return {
          value: connection,
          label: displayName,
        };
      })
      .filter(item => item.value != null && item.value !== '')
      .sort((a, b) => a.label.localeCompare(b.label));

    // flowlint-next-line sketchy-null-string:off
    const connection = this._selectedDebugConnection || 'local';

    ReactDOM.render(
      <DebuggerLaunchAttachUI
        dialogMode={dialogMode}
        model={this._model}
        connectionChanged={(newValue: ?string) => {
          this._selectedDebugConnection = newValue;
          this._renderConfigDialog(panel, dialogMode, dialogCloser);
        }}
        connection={connection}
        connectionOptions={options}
        dialogCloser={dialogCloser}
        providers={this._connectionProviders}
      />,
      panel.getItem(),
    );
  }

  _showLaunchAttachDialog(dialogMode: DebuggerConfigAction): void {
    if (
      this._visibleLaunchAttachDialogMode != null &&
      this._visibleLaunchAttachDialogMode !== dialogMode
    ) {
      // If the dialog is already visible, but isn't the correct mode, close it before
      // re-opening the correct mode.
      invariant(this._lauchAttachDialogCloser != null);
      this._lauchAttachDialogCloser();
    }

    const disposables = new UniversalDisposable();
    const hostEl = document.createElement('div');
    const pane = atom.workspace.addModalPanel({
      item: hostEl,
    });

    const parentEl: HTMLElement = (hostEl.parentElement: any);
    parentEl.style.maxWidth = '100em';

    // Function callback that closes the dialog and frees all of its resources.
    this._renderConfigDialog(pane, dialogMode, () => disposables.dispose());
    this._lauchAttachDialogCloser = () => disposables.dispose();
    disposables.add(
      pane.onDidChangeVisible(visible => {
        if (!visible) {
          disposables.dispose();
        }
      }),
    );
    disposables.add(() => {
      this._disposables.remove(disposables);
      this._visibleLaunchAttachDialogMode = null;
      this._lauchAttachDialogCloser = null;
      track(AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
        visible: false,
        dialogMode,
      });
      ReactDOM.unmountComponentAtNode(hostEl);
      pane.destroy();
    });

    track(AnalyticsEvents.DEBUGGER_TOGGLE_ATTACH_DIALOG, {
      visible: true,
      dialogMode,
    });
    this._visibleLaunchAttachDialogMode = dialogMode;
    this._disposables.add(disposables);
  }

  _addToWatch() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) {
      return;
    }
    const selectedText = editor.getTextInBufferRange(
      trimRange(editor, editor.getSelectedBufferRange()),
    );
    const expr = wordAtPosition(editor, editor.getCursorBufferPosition());

    const watchExpression = selectedText || (expr && expr.wordMatch[0]);
    // flowlint-next-line sketchy-null-string:off
    if (watchExpression) {
      this._model.getActions().addWatchExpression(watchExpression);
    }
  }

  _copyDebuggerExpressionValue(event: Event) {
    const clickedElement: HTMLElement = (event.target: any);
    const copyElement = clickedElement.closest('.nuclide-ui-lazy-nested-value');
    if (copyElement != null) {
      atom.clipboard.write(copyElement.textContent);
    }
  }

  _copyDebuggerDisassembly() {
    const callstack = this._model.getCallstack();
    if (callstack != null) {
      const selectedFrame = this._model.getSelectedCallFrameIndex();
      if (selectedFrame >= 0 && selectedFrame < callstack.length) {
        const frameInfo = callstack[selectedFrame].disassembly;
        if (frameInfo != null) {
          const metadata = frameInfo.metadata
            .map(m => {
              return `${m.name}:\t${m.value}`;
            })
            .join(os.EOL);

          const entries = frameInfo.instructions
            .map(instruction => {
              return (
                `${instruction.address}\t` +
                `${instruction.offset || ''}\t` +
                `${instruction.instruction}` +
                `${instruction.comment || ''}\t`
              );
            })
            .join(os.EOL);

          atom.clipboard.write(
            `${frameInfo.frameTitle}${os.EOL}` + metadata + os.EOL + entries,
          );
        }
      }
    }
  }

  _copyDebuggerRegisters() {
    const callstack = this._model.getCallstack();
    if (callstack != null) {
      const selectedFrame = this._model.getSelectedCallFrameIndex();
      if (selectedFrame >= 0 && selectedFrame < callstack.length) {
        const registerInfo = callstack[selectedFrame].registers;
        if (registerInfo != null) {
          const rows = [];
          for (const group of registerInfo) {
            rows.push(group.groupName + os.EOL);
            for (const register of group.registers) {
              const value = register.value != null ? register.value : '';
              let decimalValue = parseInt(value, 16);
              if (Number.isNaN(decimalValue)) {
                decimalValue = '';
              }
              rows.push(`${register.name}:\t${value}\t${decimalValue}`);
            }
            rows.push(os.EOL);
          }
          atom.clipboard.write(rows.join(os.EOL));
        }
      }
    }
  }

  _addDisassemblyBreakpoint(event: Event) {
    const clickedElement: HTMLElement = (event.target: any);
    const clickedRow: ?HTMLElement = (clickedElement.closest(
      '.nuclide-ui-table-row',
    ): any);
    if (clickedRow != null) {
      const rowIndex = clickedRow.dataset.rowindex;
      const callstack = this._model.getCallstack();
      const selectedFrameIndex = this._model.getSelectedCallFrameIndex();
      if (
        callstack != null &&
        selectedFrameIndex >= 0 &&
        selectedFrameIndex < callstack.length
      ) {
        const disassembly = callstack[selectedFrameIndex].disassembly;

        if (disassembly != null) {
          const instruction = parseInt(rowIndex, 10);
          const address = disassembly.instructions[instruction].address;
          this._model.getActions().addBreakpoint(address, -1);
        }
      }
    }
  }

  _copyDebuggerCallstack(event: Event) {
    const callstack = this._model.getCallstack();
    if (callstack) {
      let callstackText = '';
      callstack.forEach((item, i) => {
        const path = nuclideUri.basename(
          item.location.path.replace(/^[a-zA-Z]+:\/\//, ''),
        );
        callstackText += `${i}\t${item.name}\t${path}:${item.location.line}${
          os.EOL
        }`;
      });

      atom.clipboard.write(callstackText.trim());
    }
  }

  consumeCurrentWorkingDirectory(cwdApi: CwdApi): IDisposable {
    const updateSelectedConnection = directory => {
      this._selectedDebugConnection =
        directory != null ? directory.getPath() : null;
      if (this._selectedDebugConnection != null) {
        const conn = this._selectedDebugConnection;
        if (nuclideUri.isRemote(conn)) {
          // Use root instead of current directory as launch point for debugger.
          this._selectedDebugConnection = nuclideUri.createRemoteUri(
            nuclideUri.getHostname(conn),
            '/',
          );
        } else {
          // Use null instead of local path to use local debugger downstream.
          this._selectedDebugConnection = null;
        }
      }
    };
    const boundUpdateSelectedColumn = updateSelectedConnection.bind(this);
    const disposable = cwdApi.observeCwd(directory =>
      boundUpdateSelectedColumn(directory),
    );
    this._disposables.add(disposable);
    return new UniversalDisposable(() => {
      disposable.dispose();
      this._disposables.remove(disposable);
    });
  }

  createAutocompleteProvider(): AtomAutocompleteProvider {
    return {
      analytics: {
        eventName: 'nuclide-debugger',
        shouldLogInsertedSuggestion: false,
      },
      labels: ['nuclide-console'],
      selector: '*',
      filterSuggestions: true,
      async getSuggestions(request) {
        return this.getSuggestions(request);
      },
    };
  }

  consumeOutputService(api: OutputService): IDisposable {
    return setOutputService(api);
  }

  consumeRegisterExecutor(
    registerExecutor: RegisterExecutorFunction,
  ): IDisposable {
    const model = this._model;
    const register = () => registerConsoleExecutor(model, registerExecutor);
    model.getActions().addConsoleRegisterFunction(register);
    return new UniversalDisposable(() =>
      model.getActions().removeConsoleRegisterFunction(register),
    );
  }

  consumeDebuggerProvider(provider: NuclideDebuggerProvider): IDisposable {
    this._model.getActions().addDebuggerProvider(provider);
    return new UniversalDisposable(() => {
      this._model.getActions().removeDebuggerProvider(provider);
    });
  }

  consumeEvaluationExpressionProvider(
    provider: NuclideEvaluationExpressionProvider,
  ): IDisposable {
    this._model.getActions().addEvaluationExpressionProvider(provider);
    return new UniversalDisposable(() => {
      this._model.getActions().removeEvaluationExpressionProvider(provider);
    });
  }

  consumeToolBar(getToolBar: toolbar$GetToolbar): IDisposable {
    const toolBar = getToolBar('nuclide-debugger');
    toolBar.addButton(
      makeToolbarButtonSpec({
        iconset: 'icon-nuclicon',
        icon: 'debugger',
        callback: 'nuclide-debugger:show-attach-dialog',
        tooltip: 'Attach Debugger',
        priority: 500,
      }),
    ).element;
    const disposable = new UniversalDisposable(() => {
      toolBar.removeItems();
    });
    this._disposables.add(disposable);
    return disposable;
  }

  consumeNotifications(
    raiseNativeNotification: (
      title: string,
      body: string,
      timeout: number,
      raiseIfAtomHasFocus: boolean,
    ) => ?IDisposable,
  ): void {
    setNotificationService(raiseNativeNotification);
  }

  provideRemoteControlService(): RemoteControlService {
    return new RemoteControlService(() => this._model);
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    const provider = this._createDatatipProvider();
    const disposable = service.addProvider(provider);
    this._model.setDatatipService(service);
    this._disposables.add(disposable);
    return disposable;
  }

  _createDatatipProvider(): DatatipProvider {
    return {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      providerName: DATATIP_PACKAGE_NAME,
      priority: 1,
      datatip: (editor: TextEditor, position: atom$Point) => {
        return debuggerDatatip(this._model, editor, position);
      },
    };
  }
}

function registerConsoleExecutor(
  model: DebuggerModel,
  registerExecutor: RegisterExecutorFunction,
): IDisposable {
  const disposables = new UniversalDisposable();
  const rawOutput: Subject<?EvaluationResult> = new Subject();
  const send = expression => {
    disposables.add(
      // We filter here because the first value in the BehaviorSubject is null no matter what, and
      // we want the console to unsubscribe the stream after the first non-null value.
      model
        .evaluateConsoleExpression(expression)
        .filter(result => result != null)
        .first()
        .subscribe(result => rawOutput.next(result)),
    );
    model.triggerReevaluation();
  };
  const output: Observable<{
    result?: EvaluationResult,
  }> = rawOutput.map(result => {
    invariant(result != null);
    return {data: result};
  });
  disposables.add(
    registerExecutor({
      id: 'debugger',
      name: 'Debugger',
      scopeName: 'text.plain',
      send,
      output,
      getProperties: model.getProperties.bind(model),
    }),
  );
  return disposables;
}

function createDebuggerView(model: mixed): ?HTMLElement {
  let view = null;
  if (
    model instanceof DebuggerPaneViewModel ||
    model instanceof DebuggerPaneContainerViewModel
  ) {
    view = model.createView();
  }

  if (view != null) {
    const elem = renderReactRoot(view);
    elem.className = 'nuclide-debugger-container';
    return elem;
  }

  return null;
}

createPackage(module.exports, Activation);
