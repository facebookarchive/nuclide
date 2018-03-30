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
import type {
  ConsoleService,
  DatatipProvider,
  DatatipService,
  RegisterExecutorFunction,
} from 'atom-ide-ui';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {AtomAutocompleteProvider} from '../../nuclide-autocomplete/lib/types';
import type {SerializedState, IBreakpoint} from './types';

import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {diffSets} from 'nuclide-commons/observable';
import {Observable} from 'rxjs';
import BreakpointManager from './BreakpointManager';
import {AnalyticsEvents, DebuggerMode} from './constants';
import BreakpointConfigComponent from './ui/BreakpointConfigComponent';
import createPackage from 'nuclide-commons-atom/createPackage';
import {getLineForEvent} from './utils';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import invariant from 'assert';
import {track} from '../../nuclide-analytics';
import RemoteControlService from './RemoteControlService';
import DebuggerUiModel from './DebuggerUiModel';
import DebugService from './vsp/DebugService';
import {debuggerDatatip} from './DebuggerDatatip';
import * as React from 'react';
import ReactDOM from 'react-dom';
import DebuggerLaunchAttachUI from './ui/DebuggerLaunchAttachUI';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {
  setNotificationService,
  setConsoleService,
  setConsoleRegisterExecutor,
  setDatatipService,
} from './AtomServiceContainer';
import {wordAtPosition, trimRange} from 'nuclide-commons-atom/range';
import DebuggerLayoutManager from './ui/DebuggerLayoutManager';
import DebuggerPaneViewModel from './ui/DebuggerPaneViewModel';
import DebuggerPaneContainerViewModel from './ui/DebuggerPaneContainerViewModel';
import os from 'os';
import nullthrows from 'nullthrows';
import ReactMountRootElement from 'nuclide-commons-ui/ReactMountRootElement';
import {makeToolbarButtonSpec} from 'nuclide-commons-ui/ToolbarUtils';

const DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip';

class Activation {
  _disposables: UniversalDisposable;
  _uiModel: DebuggerUiModel;
  _breakpointManager: BreakpointManager;
  _service: DebugService;
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
    this._service = new DebugService(state);
    this._uiModel = new DebuggerUiModel(this._service);
    this._breakpointManager = new BreakpointManager(this._service);
    this._selectedDebugConnection = null;
    this._visibleLaunchAttachDialogMode = null;
    this._lauchAttachDialogCloser = null;
    this._connectionProviders = new Map();
    this._layoutManager = new DebuggerLayoutManager(this._service, state);

    const removedHostnames = observableFromSubscribeFunction(
      atom.project.onDidChangePaths.bind(atom.project),
    )
      .map(
        paths =>
          new Set(
            paths.filter(nuclideUri.isRemote).map(nuclideUri.getHostname),
          ),
      )
      .let(diffSets())
      .flatMap(diff => Observable.from(diff.removed));

    this._disposables = new UniversalDisposable(
      this._layoutManager,
      this._service,
      this._uiModel,
      this._breakpointManager,
      removedHostnames.subscribe(hostname => {
        const debuggerProcess = this._service.viewModel.focusedProcess;
        if (debuggerProcess == null) {
          return; // Nothing to do if we're not debugging.
        }
        const debuggeeTargetUri = debuggerProcess.configuration.targetUri;
        if (nuclideUri.isLocal(debuggeeTargetUri)) {
          return; // Nothing to do if our debug session is local.
        }
        if (nuclideUri.getHostname(debuggeeTargetUri) === hostname) {
          this._service.stopProcess();
        }
      }),
      this._uiModel.onConnectionsUpdated(() => {
        const newConnections = this._uiModel.getConnections();
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
      this._uiModel.onProvidersUpdated(() => {
        const connections = this._uiModel.getConnections();
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
      atom.commands.add('.nuclide-debugger-thread-list-item', {
        'nuclide-debugger:terminate-thread': this._terminateThread.bind(this),
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
      // Context Menu Items.
      atom.contextMenu.add({
        '.nuclide-debugger-disassembly-view': [
          {
            label: 'Copy disassembly',
            command: 'nuclide-debugger:copy-debugger-disassembly',
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
              const bp = this._getBreakpointFromEvent(event);
              return bp != null && this._supportsConditionalBreakpoints();
            },
          },
          {
            label: 'Remove Breakpoint',
            command: 'nuclide-debugger:remove-breakpoint',
          },
          {type: 'separator'},
        ],
        '.nuclide-debugger-thread-list-item': [
          {
            label: 'Terminate thread',
            command: 'nuclide-debugger:terminate-thread',
            shouldDisplay: event => {
              const target: HTMLElement = event.target;
              if (target.dataset.threadid) {
                const threadId = parseInt(target.dataset.threadid, 10);
                if (!Number.isNaN(threadId)) {
                  return this._supportsTerminateThreadsRequest();
                }
              }
              return false;
            },
          },
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
                      this._service
                        .getModel()
                        .getBreakpointAtLine(filePath, line) != null,
                  ) || false,
              },
              {
                label: 'Edit Breakpoint...',
                command: 'nuclide-debugger:edit-breakpoint',
                shouldDisplay: event =>
                  this._executeWithEditorPath(event, (filePath, line) => {
                    const bp = this._service
                      .getModel()
                      .getBreakpointAtLine(filePath, line);
                    return bp != null && this._supportsConditionalBreakpoints();
                  }) || false,
              },
              {
                label: 'Add to Watch',
                command: 'nuclide-debugger:add-to-watch',
                shouldDisplay: event => {
                  const textEditor = atom.workspace.getActiveTextEditor();
                  if (
                    this._service.getDebuggerMode() === DebuggerMode.STOPPED ||
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
              {
                label: 'Run to Location',
                command: 'nuclide-debugger:run-to-location',
                shouldDisplay: event =>
                  this._service.getDebuggerMode() === DebuggerMode.PAUSED,
              },
            ],
          },
          {type: 'separator'},
        ],
      }),
      this._registerCommandsContextMenuAndOpener(),
    );
  }

  _supportsConditionalBreakpoints(): boolean {
    // If currently debugging, return whether or not the current debugger supports this.
    const {focusedProcess} = this._service.viewModel;
    if (focusedProcess == null) {
      // If not currently debugging, return if any of the debuggers that support
      // the file extension this bp is in support conditions.
      // TODO(ericblue): have providers register their file extensions and filter correctly here.
      return true;
    } else {
      return Boolean(
        focusedProcess.session.capabilities.supportsConditionalBreakpoints,
      );
    }
  }

  _supportsTerminateThreadsRequest(): boolean {
    // If currently debugging, return whether or not the current debugger supports this.
    const {focusedProcess} = this._service.viewModel;
    if (focusedProcess == null) {
      return false;
    } else {
      return Boolean(
        focusedProcess.session.capabilities.supportsTerminateThreadsRequest,
      );
    }
  }

  _setProvidersForConnection(connection: NuclideUri): void {
    const key = nuclideUri.isRemote(connection)
      ? nuclideUri.getHostname(connection)
      : 'local';
    const availableProviders = this._uiModel.getLaunchAttachProvidersForConnection(
      connection,
    );
    this._connectionProviders.set(key, availableProviders);
  }

  async _getSuggestions(
    request: atom$AutocompleteRequest,
  ): Promise<?Array<atom$AutocompleteSuggestion>> {
    let text = request.editor.getText();
    const lines = text.split('\n');
    const {row} = request.bufferPosition;
    // Only keep the lines up to and including the buffer position row.
    text = lines.slice(0, row + 1).join('\n');
    const {focusedStackFrame, focusedProcess} = this._service.viewModel;
    if (focusedProcess == null || focusedStackFrame == null) {
      return [];
    } else if (
      !Boolean(focusedProcess.session.capabilities.supportsCompletionsRequest)
    ) {
      const scopes = await focusedStackFrame.getScopes();
      return scopes.map(scope => ({text: scope.name, type: 'variable'}));
    } else {
      const completions = await focusedProcess.completions(
        focusedStackFrame.frameId,
        text,
        request.bufferPosition,
        0,
      );
      return completions.map(item => ({
        displayText: item.label,
        text: item.text == null ? item.label : item.text,
        type: item.type,
      }));
    }
  }

  serialize(): SerializedState {
    const model = this._service.getModel();
    const state = {
      sourceBreakpoints: model.getBreakpoints(),
      functionBreakpoints: model.getFunctionBreakpoints(),
      exceptionBreakpoints: model.getExceptionBreakpoints(),
      watchExpressions: model.getWatchExpressions().map(e => e.name),
      showDebugger: this._layoutManager.isDebuggerVisible(),
      workspaceDocksVisibility: this._layoutManager.getWorkspaceDocksVisibility(),
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
          this._service.stopProcess();
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
      this._service.onDidChangeMode(() =>
        this._layoutManager.debuggerModeChanged(),
      ),
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

  _isReadonlyTarget(): boolean {
    const {focusedProcess} = this._service.viewModel;
    return focusedProcess == null
      ? false
      : focusedProcess.configuration.capabilities.readOnlyTarget;
  }

  _continue() {
    const {focusedThread} = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      track(AnalyticsEvents.DEBUGGER_STEP_CONTINUE);
      focusedThread.continue();
    }
  }

  _stop() {
    this._service.stopProcess();
  }

  _restart() {
    this._service.restartProcess();
  }

  _stepOver() {
    const {focusedThread} = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      track(AnalyticsEvents.DEBUGGER_STEP_OVER);
      focusedThread.next();
    }
  }

  _stepInto() {
    const {focusedThread} = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      track(AnalyticsEvents.DEBUGGER_STEP_INTO);
      focusedThread.stepIn();
    }
  }

  _stepOut() {
    const {focusedThread} = this._service.viewModel;
    if (!this._isReadonlyTarget() && focusedThread != null) {
      track(AnalyticsEvents.DEBUGGER_STEP_OUT);
      focusedThread.stepOut();
    }
  }

  _toggleBreakpoint(event: any) {
    return this._executeWithEditorPath(event, (filePath, lineNumber) => {
      this._service.toggleSourceBreakpoint(filePath, lineNumber);
    });
  }

  _toggleBreakpointEnabled(event: any) {
    this._executeWithEditorPath(event, (filePath, line) => {
      const bp = this._service.getModel().getBreakpointAtLine(filePath, line);

      if (bp != null) {
        this._service.enableOrDisableBreakpoints(!bp.enabled, bp);
      }
    });
  }

  _getBreakpointFromEvent(event: any): ?IBreakpoint {
    const target: HTMLElement = event.target;
    let bp = null;
    if (target != null && target.dataset != null) {
      if (target.dataset.bpid != null) {
        const bpId = target.dataset.bpid;
        bp = this._service.getModel().getBreakpointById(bpId);
      }

      if (bp == null) {
        const path = target.dataset.path;
        const line = parseInt(target.dataset.line, 10);
        if (path != null && line != null) {
          bp = this._service.getModel().getBreakpointAtLine(path, line);
        }
      }
    }

    return bp;
  }

  _configureBreakpoint(event: any) {
    const bp = this._getBreakpointFromEvent(event);
    if (bp != null && this._supportsConditionalBreakpoints()) {
      // Open the configuration dialog.
      const container = new ReactMountRootElement();
      ReactDOM.render(
        <BreakpointConfigComponent
          breakpoint={bp}
          service={this._service}
          onDismiss={() => {
            ReactDOM.unmountComponentAtNode(container);
          }}
        />,
        container,
      );
    }
  }

  _terminateThread(event: any) {
    const target: HTMLElement = event.target;
    if (target.dataset.threadid) {
      const threadId = parseInt(target.dataset.threadid, 10);
      if (!Number.isNaN(threadId) && this._supportsTerminateThreadsRequest()) {
        this._service.terminateThreads([threadId]);
      }
    }
  }

  _executeWithEditorPath<T>(
    event: any,
    fn: (filePath: string, line: number) => T,
  ): ?T {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor || !editor.getPath()) {
      return null;
    }

    const line = getLineForEvent(editor, event) + 1;
    return fn(nullthrows(editor.getPath()), line);
  }

  _deleteBreakpoint(event: any): void {
    const breakpoint = this._getBreakpointFromEvent(event);
    if (breakpoint != null) {
      this._service.removeBreakpoints(breakpoint.getId());
    }
  }

  _deleteAllBreakpoints(): void {
    this._service.removeBreakpoints();
  }

  _enableAllBreakpoints(): void {
    this._service.enableOrDisableBreakpoints(true);
  }

  _disableAllBreakpoints(): void {
    this._service.enableOrDisableBreakpoints(false);
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

    const options = this._uiModel
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
    if (watchExpression != null && watchExpression.length > 0) {
      this._service.addWatchExpression(watchExpression);
    }
  }

  _runToLocation(event) {
    this._executeWithEditorPath(event, (path, line) => {
      this._service.runToLocation(path, line);
    });
  }

  _copyDebuggerExpressionValue(event: Event) {
    const clickedElement: HTMLElement = (event.target: any);
    const copyElement = clickedElement.closest('.nuclide-ui-lazy-nested-value');
    if (copyElement != null) {
      atom.clipboard.write(copyElement.textContent);
    }
  }

  _copyDebuggerCallstack(event: Event) {
    const {focusedThread} = this._service.viewModel;
    if (focusedThread != null) {
      let callstackText = '';
      focusedThread.getCallStack().forEach((item, i) => {
        const path = nuclideUri.basename(item.source.uri);
        callstackText += `${i}\t${item.name}\t${path}:${item.range.start.row}${
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
      getSuggestions: this._getSuggestions.bind(this),
    };
  }

  consumeConsole(createConsole: ConsoleService): IDisposable {
    return setConsoleService(createConsole);
  }

  consumeRegisterExecutor(
    registerExecutor: RegisterExecutorFunction,
  ): IDisposable {
    return setConsoleRegisterExecutor(registerExecutor);
  }

  consumeDebuggerProvider(provider: NuclideDebuggerProvider): IDisposable {
    this._uiModel.addDebuggerProvider(provider);
    return new UniversalDisposable(() => {
      this._uiModel.removeDebuggerProvider(provider);
    });
  }

  consumeEvaluationExpressionProvider(
    provider: NuclideEvaluationExpressionProvider,
  ): IDisposable {
    this._uiModel.addEvaluationExpressionProvider(provider);
    return new UniversalDisposable(() => {
      this._uiModel.removeEvaluationExpressionProvider(provider);
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
    return new RemoteControlService(this._service);
  }

  consumeDatatipService(service: DatatipService): IDisposable {
    const disposable = new UniversalDisposable(
      service.addProvider(this._createDatatipProvider()),
      setDatatipService(service),
    );
    this._disposables.add(disposable);
    return disposable;
  }

  _createDatatipProvider(): DatatipProvider {
    return {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      providerName: DATATIP_PACKAGE_NAME,
      priority: 1,
      datatip: (editor: TextEditor, position: atom$Point) => {
        return debuggerDatatip(
          this._uiModel.getEvaluationExpressionProviders(),
          this._service,
          editor,
          position,
        );
      },
    };
  }
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
