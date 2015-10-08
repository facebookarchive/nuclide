'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable, Disposable} = require('atom');
import {trackTiming} from 'nuclide-analytics';

import type RemoteControlService from './RemoteControlService';
import type DebuggerModel from './DebuggerModel';
import type {SerializedBreakpoint} from './BreakpointStore';

export type SerializedState = {
  breakpoints: ?Array<SerializedBreakpoint>,
};

function createDebuggerView(model: DebuggerModel): HTMLElement {
  var DebuggerControllerView = require('./DebuggerControllerView');
  var React = require('react-for-atom');
  var elem = document.createElement('div');
  elem.className = 'nuclide-debugger-root';
  React.render(
    <DebuggerControllerView
      store={model.getStore()}
      bridge = {model.getBridge()}
      actions={model.getActions()}
      breakpointStore={model.getBreakpointStore()} />,
    elem);
  return elem;
}

class Activation {
  _disposables: CompositeDisposable;

  _model: DebuggerModel;
  _panel: ?Object;

  constructor(state: ?SerializedState) {
    var DebuggerModel = require('./DebuggerModel');
    this._disposables = new CompositeDisposable();

    this._disposables.add(
      atom.views.addViewProvider(DebuggerModel, createDebuggerView));

    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:toggle': this._toggle.bind(this),
      }));
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:show': this._show.bind(this),
      }));
    this._disposables.add(
        atom.commands.add('atom-workspace', {
          'nuclide-debugger:continue-debugging': this._continue.bind(this),
        }));
    this._disposables.add(
      atom.commands.add('atom-workspace', {
        'nuclide-debugger:stop-debugging': this._stop.bind(this),
      }));
    this._disposables.add(
        atom.commands.add('atom-workspace', {
          'nuclide-debugger:step-over': this._stepOver.bind(this),
        }));
    this._disposables.add(
        atom.commands.add('atom-workspace', {
          'nuclide-debugger:step-into': this._stepInto.bind(this),
        }));
    this._disposables.add(
        atom.commands.add('atom-workspace', {
          'nuclide-debugger:step-out': this._stepOut.bind(this),
        }));
    this._disposables.add(
        atom.commands.add('atom-workspace', {
          'nuclide-debugger:toggle-breakpoint': this._toggleBreakpoint.bind(this),
        }));

    this._model = new DebuggerModel(state);
    this._disposables.add(this._model);
  }

  serialize(): SerializedState {
    var state = {
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

  _toggle() {
    var panel = this._getPanel();
    if (panel.isVisible()) {
      panel.hide();
    } else {
      panel.show();
    }
  }

  _show() {
    this._getPanel().show();
  }

  _continue() {
    // TODO(jeffreytan): when we figured out the launch lifecycle story
    // we may bind this to start-debugging too.
    this._model.getBridge().continue();
  }

  _stop() {
    this._model.getActions().killDebugger();
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
    var editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getPath()) {
      var filePath = editor.getPath();
      if (filePath) {
        var line = editor.getLastCursor().getBufferRow();
        this.getModel().getBreakpointStore().toggleBreakpoint(filePath, line);
      }
    }
  }

  /**
   * Lazy panel creation.
   */
  _getPanel(): Object {
    if (!this._panel) {
      var panel = atom.workspace.addRightPanel({
        item: this._model,
        visible: false,
      });
      // Flow doesn't track non-null when assigning into nullable directly.
      this._panel = panel;
      return panel;
    } else {
      return this._panel;
    }
  }
}

var activation = null;

module.exports = {
  activate(state: ?SerializedState) {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  serialize(): SerializedState {
    if (activation) {
      return activation.serialize();
    } else {
      return {};
    }
  },

  deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  consumeNuclideDebugger(service: nuclide_debugger$Service): Disposable {
    if (activation) {
      activation.getModel().getActions().addService(service);
    }
    return new Disposable(() => {
      if (activation) {
        activation.getModel().getActions().removeService(service);
      }
    });
  },
  DebuggerProcessInfo: require('./DebuggerProcessInfo'),

  provideRemoteControlService(): RemoteControlService {
    var RemoteControlService = require('./RemoteControlService');
    return new RemoteControlService(() => activation ? activation.getModel() : null);
  },
};
