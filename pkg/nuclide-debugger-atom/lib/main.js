'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
   nuclide_debugger$Service,
   NuclideDebuggerProvider,
   NuclideEvaluationExpressionProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {SerializedBreakpoint} from './BreakpointStore';
import type {
  DatatipProvider,
  DatatipService,
} from '../../nuclide-datatip';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {trackTiming} from '../../nuclide-analytics';
import RemoteControlService from './RemoteControlService';
import DebuggerModel from './DebuggerModel';
import {debuggerDatatip} from './DebuggerDatatip';
import {
  React,
  ReactDOM,
} from 'react-for-atom';
import {DebuggerLaunchAttachUI} from './DebuggerLaunchAttachUI';
import remoteUri from '../../nuclide-remote-uri';
import {ServerConnection} from '../../nuclide-remote-connection';
import {passesGKSafe} from '../../nuclide-commons';

import DebuggerProcessInfo from './DebuggerProcessInfo';
import DebuggerInstance from './DebuggerInstance';
import DebuggerLaunchAttachProvider from './DebuggerLaunchAttachProvider';
import {NewDebuggerView} from './NewDebuggerView';

export {
  DebuggerProcessInfo,
  DebuggerInstance,
  DebuggerLaunchAttachProvider,
};

export type SerializedState = {
  breakpoints: ?Array<SerializedBreakpoint>;
};

const DATATIP_PACKAGE_NAME = 'nuclide-debugger-datatip';
const GK_DEBUGGER_LAUNCH_ATTACH_UI = 'nuclide_debugger_launch_attach_ui';
const GK_DEBUGGER_UI_REVAMP = 'nuclide_debugger_ui_revamp';
const GK_TIMEOUT = 5000;

function createDebuggerView(model: DebuggerModel, useRevampedUi: boolean): HTMLElement {
  const DebuggerControllerView = require('./DebuggerControllerView');
  const elem = document.createElement('div');
  elem.className = 'nuclide-debugger-container';
  ReactDOM.render(
    <div className="nuclide-debugger-root">
      <div className="nuclide-debugger-container-old">
        <DebuggerControllerView
          store={model.getStore()}
          bridge = {model.getBridge()}
          actions={model.getActions()}
          breakpointStore={model.getBreakpointStore()}
        />
      </div>
      {useRevampedUi ? <NewDebuggerView /> : null}
    </div>,
    elem);
  return elem;
}

class Activation {
  _disposables: CompositeDisposable;
  _model: DebuggerModel;
  _panel: ?Object;
  _launchAttachDialog: ?atom$Panel;

  constructor(state: ?SerializedState) {
    this._model = new DebuggerModel(state);
    this._panel = null;
    this._launchAttachDialog = null;
    this._disposables = new CompositeDisposable(
      this._model,
      // Listen for removed connections and kill the debugger if it is using that connection.
      ServerConnection.onDidCloseServerConnection(connection => {
        const debuggerProcess = this._model.getStore().getDebuggerInstance();
        if (debuggerProcess == null) {
          return; // Nothing to do if we're not debugging.
        }
        const debuggeeTargetUri = debuggerProcess.getTargetUri();
        if (remoteUri.isLocal(debuggeeTargetUri)) {
          return; // Nothing to do if our debug session is local.
        }
        if (remoteUri.getHostname(debuggeeTargetUri) === connection.getRemoteHostname()
            && remoteUri.getPort(debuggeeTargetUri) === connection.getPort()) {
          this._model.getActions().stopDebugging();
        }
      }),

      // Commands.
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:toggle': this._toggle.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:show': this._show.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:hide': this._hide.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:continue-debugging': this._continue.bind(this),
      }),
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:stop-debugging': this._stop.bind(this),
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
        'nuclide-debugger:toggle-launch-attach': this._toggleLaunchAttachDialog.bind(this),
      }),

      // Context Menu Items.
      atom.contextMenu.add({
        'atom-text-editor': [
          {type: 'separator'},
          {
            label: 'Debugger',
            submenu: [
              {
                label: 'Toggle Breakpoint',
                command: 'nuclide-debugger:toggle-breakpoint',
              },
            ],
          },
          {type: 'separator'},
        ],
      }),
    );
    (this: any)._hideLaunchAttachDialog = this._hideLaunchAttachDialog.bind(this);
    this._setupView();
  }

  async _setupView(): Promise<void> {
    const useRevampedUi = await passesGKSafe(GK_DEBUGGER_UI_REVAMP, GK_TIMEOUT);
    this._disposables.add(
      atom.views.addViewProvider(
        DebuggerModel,
        (model: DebuggerModel) => createDebuggerView(model, useRevampedUi)
      )
    );
  }

  serialize(): SerializedState {
    const state = {
      breakpoints: this.getModel().getBreakpointStore().getSerializedBreakpoints(),
    };
    return state;
  }

  dispose() {
    this._disposables.dispose();
    if (this._panel) {
      this._panel.destroy();
    }
  }

  getModel(): DebuggerModel {
    return this._model;
  }

  async _toggle() {
    const passedNewUIGK = await passesGKSafe(GK_DEBUGGER_LAUNCH_ATTACH_UI, 0);
    if (passedNewUIGK) {
      this._toggleLaunchAttachDialog();
    } else {
      const panel = this._getPanel();
      if (panel.isVisible()) {
        panel.hide();
      } else {
        panel.show();
      }
    }
  }

  _show() {
    this._getPanel().show();
  }

  _hide() {
    this._getPanel().hide();
  }

  _continue() {
    // TODO(jeffreytan): when we figured out the launch lifecycle story
    // we may bind this to start-debugging too.
    this._model.getBridge().continue();
  }

  _stop() {
    this._model.getActions().stopDebugging();
  }

  _stepOver() {
    this._model.getBridge().stepOver();
  }

  _stepInto() {
    this._model.getBridge().stepInto();
  }

  _stepOut() {
    this._model.getBridge().stepOut();
  }

  @trackTiming('nuclide-debugger-atom:toggleBreakpoint')
  _toggleBreakpoint() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getPath()) {
      const filePath = editor.getPath();
      if (filePath) {
        const line = editor.getLastCursor().getBufferRow();
        this.getModel().getBreakpointStore().toggleBreakpoint(filePath, line);
      }
    }
  }


  _toggleLaunchAttachDialog(): void {
    const dialog = this._getLaunchAttachDialog();
    if (dialog.isVisible()) {
      dialog.hide();
    } else {
      dialog.show();
    }
  }

  _hideLaunchAttachDialog(): void {
    const dialog = this._getLaunchAttachDialog();
    if (dialog.isVisible()) {
      dialog.hide();
    }
  }

  _getLaunchAttachDialog(): atom$Panel {
    if (!this._launchAttachDialog) {
      const component = (
        <DebuggerLaunchAttachUI
          store={this._model.getDebuggerProviderStore()}
          debuggerActions={this._model.getActions()}
        />
      );
      const host = document.createElement('div');
      ReactDOM.render(component, host);
      this._launchAttachDialog = atom.workspace.addModalPanel({
        item: host,
        visible: false, // Hide first so that caller can toggle it visible.
      });

      this._disposables.add(
        new Disposable(() => {
          if (this._launchAttachDialog != null) {
            this._launchAttachDialog.destroy();
            this._launchAttachDialog = null;
          }
        }),
        atom.commands.add(
          'atom-workspace',
          'core:cancel',
          this._hideLaunchAttachDialog,
        ),
      );
    }
    invariant(this._launchAttachDialog);
    return this._launchAttachDialog;
  }

  /**
   * Lazy panel creation.
   */
  _getPanel(): Object {
    if (!this._panel) {
      const panel = atom.workspace.addRightPanel({
        item: this._model,
        visible: false,
        // Move this left of the toolbar, when it is on the right.
        priority: 150,
      });
      // Flow doesn't track non-null when assigning into nullable directly.
      this._panel = panel;
      return panel;
    } else {
      return this._panel;
    }
  }
}

function createDatatipProvider(): DatatipProvider {
  if (datatipProvider == null) {
    datatipProvider = {
      // Eligibility is determined online, based on registered EvaluationExpression providers.
      validForScope: (scope: string) => true,
      providerName: DATATIP_PACKAGE_NAME,
      inclusionPriority: 1,
      datatip: (editor: TextEditor, position: atom$Point) => {
        if (activation == null) {
          return Promise.resolve(null);
        }
        const model = activation.getModel();
        return debuggerDatatip(model, editor, position);
      },
    };
  }
  return datatipProvider;
}

let activation = null;
let toolBar: ?any = null;
let datatipProvider: ?DatatipProvider;

export function activate(state: ?SerializedState): void {
  if (!activation) {
    activation = new Activation(state);
  }
}

export function serialize(): SerializedState {
  if (activation) {
    return activation.serialize();
  } else {
    return {
      breakpoints: null,
    };
  }
}

export function deactivate() {
  if (activation) {
    activation.dispose();
    activation = null;
  }
  if (toolBar) {
    toolBar.removeItems();
  }
}

export function consumeNuclideDebugger(service: nuclide_debugger$Service): Disposable {
  if (activation) {
    activation.getModel().getActions().addService(service);
  }
  return new Disposable(() => {
    if (activation) {
      activation.getModel().getActions().removeService(service);
    }
  });
}

export function consumeDebuggerProvider(provider: NuclideDebuggerProvider): IDisposable {
  if (activation) {
    activation.getModel().getActions().addDebuggerProvider(provider);
  }
  return new Disposable(() => {
    if (activation) {
      activation.getModel().getActions().removeDebuggerProvider(provider);
    }
  });
}

export function consumeEvaluationExpressionProvider(
  provider: NuclideEvaluationExpressionProvider,
): IDisposable {
  if (activation) {
    activation.getModel().getActions().addEvaluationExpressionProvider(provider);
  }
  return new Disposable(() => {
    if (activation) {
      activation.getModel().getActions().removeEvaluationExpressionProvider(provider);
    }
  });
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  toolBar = getToolBar('nuclide-debugger');
  toolBar.addButton({
    icon: 'plug',
    callback: 'nuclide-debugger:toggle',
    tooltip: 'Toggle Debugger',
    priority: 100,
  });
}

export function provideRemoteControlService(): RemoteControlService {
  return new RemoteControlService(() => (activation ? activation.getModel() : null));
}

export function consumeDatatipService(service: DatatipService): IDisposable {
  const provider = createDatatipProvider();
  service.addProvider(provider);
  const disposable = new Disposable(() => service.removeProvider(provider));
  invariant(activation);
  activation._disposables.add(disposable);
  return disposable;
}
