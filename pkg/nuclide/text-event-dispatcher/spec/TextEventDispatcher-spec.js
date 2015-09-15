'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Disposable} from 'atom';

import {
  TextEventDispatcher,
  __TEST__,
} from '../lib/TextEventDispatcher';

var {TextCallbackContainer} = __TEST__;

var grammar = 'testgrammar';

describe('TextCallbackContainer', () => {
  var textCallbackContainer: any;
  var callback: any;

  beforeEach(() => {
    textCallbackContainer = new TextCallbackContainer();
    callback = jasmine.createSpy();
  });

  function checkInvariant() {
    // enforce the invariant that there be no empty maps or sets
    textCallbackContainer._callbacks.forEach(eventMap => {
      expect(eventMap.size).not.toBe(0);
      eventMap.forEach(callbackSet => {
        expect(callbackSet.size).not.toBe(0);
      });
    });
    textCallbackContainer._allGrammarCallbacks.forEach(callbackSet => {
      expect(callbackSet.size).not.toBe(0);
    });
  }

  it('should return callback', () => {
    textCallbackContainer.addCallback([grammar], ['did-reload'], callback);
    var callbacks = textCallbackContainer.getCallbacks(grammar, 'did-reload');
    expect(callbacks).toEqual(new Set().add(callback));
    checkInvariant();
  });

  it('should always return callbacks for all', () => {
    textCallbackContainer.addCallback('all', ['did-save'], callback);
    var callbacks = textCallbackContainer.getCallbacks('asdf', 'did-save');
    expect(callbacks).toEqual(new Set().add(callback));
    checkInvariant();
  });
});

describe('TextEventDispatcher', () => {
  var textEventDispatcher: any;
  var fakeTextEditor: any;
  var fakeTextEditor2: any;
  var activeEditor: any;
  // Stores callbacks that have subscribed to Atom text events. Can be called to simulate
  var textEventCallbacks: any;
  var paneSwitchCallbacks: any;

  function fakeObserveEditors(callback) {
    callback(fakeTextEditor);
    callback(fakeTextEditor2);
    return new Disposable(() => {});
  }


  function makeFakeEditor(path?: string = '') {
    var editor;
    // Register a callback for this fake editor.
    var registerCallback = callback => {
      var set = textEventCallbacks.get(editor);
      if (!set) {
        set = new Set();
        textEventCallbacks.set(editor, set);
      }
      set.add(callback);
      return new Disposable(() => {});
    };
    var buffer = {
      onDidStopChanging: registerCallback,
      onDidSave: registerCallback,
      onDidReload: registerCallback,
    };
    editor = {
      getBuffer() {
        return buffer;
      },
      getGrammar() {
        return {
          scopeName: grammar,
        };
      },
      // getPath is nice for debugging tests
      getPath() {
        return path;
      },
    };
    return editor;
  }

  function triggerAtomEvent(editor) {
    for (var callback of textEventCallbacks.get(editor)) {
      callback();
    }
  }

  beforeEach(() => {
    textEventCallbacks = new Map();
    paneSwitchCallbacks = new Set();

    fakeTextEditor = makeFakeEditor('foo');
    fakeTextEditor2 = makeFakeEditor('bar');
    activeEditor = fakeTextEditor;
    // weird Flow error here
    (spyOn(atom.workspace, 'observeTextEditors'): any).andCallFake(fakeObserveEditors);
    spyOn(atom.workspace, 'getActiveTextEditor').andCallFake(() => activeEditor);
    spyOn(atom.workspace, 'getTextEditors').andReturn([fakeTextEditor, fakeTextEditor2]);
    spyOn(atom.workspace, 'onDidChangeActivePaneItem').andCallFake(callback => {
      paneSwitchCallbacks.add(callback);
      return new Disposable(() => {});
    });
    textEventDispatcher = new TextEventDispatcher();
  });

  afterEach(() => {
    jasmine.unspy(atom.workspace, 'observeTextEditors');
    jasmine.unspy(atom.workspace, 'getActiveTextEditor');
    jasmine.unspy(atom.workspace, 'getTextEditors');
    jasmine.unspy(atom.workspace, 'onDidChangeActivePaneItem');
  });

  it('should fire events', () => {
    var callback = jasmine.createSpy();
    textEventDispatcher.onFileChange([grammar], callback);
    triggerAtomEvent(fakeTextEditor);
    expect(callback).toHaveBeenCalled();
  });

  it('should debounce events', () => {
    var callback = jasmine.createSpy();
    textEventDispatcher.onFileChange([grammar], callback);
    // This test hinges on these two calls happening within 50 ms of each other.
    // An initial attempt to mock the clock was unsuccessful, probably because
    // of problems clearing the require cache thoroughly enough that the
    // debounce function picks up the mocked clock. If this causes problems,
    // figure out how to mock the clock properly.
    triggerAtomEvent(fakeTextEditor);
    triggerAtomEvent(fakeTextEditor);
    expect(callback.callCount).toBe(1);
  });

  it('should dispatch pending events on a tab switch', () => {
    var callback = jasmine.createSpy();
    textEventDispatcher.onFileChange([grammar], callback);
    triggerAtomEvent(fakeTextEditor2);
    expect(callback).not.toHaveBeenCalled();
    activeEditor = fakeTextEditor2;
    paneSwitchCallbacks.forEach(f => f());
    expect(callback).toHaveBeenCalledWith(fakeTextEditor2);
  });

  it('should always dispatch to clients that request all changes', () => {
    var callback = jasmine.createSpy();
    textEventDispatcher.onAnyFileChange(callback);
    triggerAtomEvent(fakeTextEditor);
    expect(callback).toHaveBeenCalled();
  });
});
