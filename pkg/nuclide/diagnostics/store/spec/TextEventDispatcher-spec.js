'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable} = require('atom');

var {TextEventDispatcher, __TEST__: {TextCallbackContainer}} = require('../lib/TextEventDispatcher');

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
  }

  it('should return callback', () => {
    textCallbackContainer.addCallback([grammar], ['did-reload'], callback);
    var callbacks = textCallbackContainer.getCallbacks(grammar, 'did-reload');
    expect(callbacks).toEqual(new Set().add(callback));
    checkInvariant();
  });
});

describe('TextEventDispatcher', () => {
  var textEventDispatcher: any;
  var fakeTextEditor: any;
  var callbacks: any;

  function fakeObserveEditors(callback) {
    callback(fakeTextEditor);
    return new Disposable(() => {});
  }

  function triggerAtomEvent(editor) {
    for (var callback of callbacks) {
      callback(editor);
    }
  }

  beforeEach(() => {
    callbacks = new Set();
    // we could be more precise and keep track of which callback registered for
    // which event, but this is good enough for a first pass
    var registerCallback = callback => {
      callbacks.add(callback);
      return new Disposable(() => {});
    };
    fakeTextEditor = {
      getBuffer() {
        return {
          onDidStopChanging: registerCallback,
          onDidSave: registerCallback,
          onDidReload: registerCallback,
        };
      },
      getGrammar() {
        return {
          scopeName: grammar,
        };
      },
    };
    // weird Flow error here
    (spyOn(atom.workspace, 'observeTextEditors'): any).andCallFake(fakeObserveEditors);
    spyOn(atom.workspace, 'getActiveTextEditor').andReturn(fakeTextEditor);
    textEventDispatcher = new TextEventDispatcher();
  });

  afterEach(() => {
    jasmine.unspy(atom.workspace, 'observeTextEditors');
    jasmine.unspy(atom.workspace, 'getActiveTextEditor');
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
});
