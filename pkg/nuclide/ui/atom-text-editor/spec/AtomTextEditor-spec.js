'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var AtomTextEditor = require('../lib/AtomTextEditor');
var React = require('react-for-atom');

var {TestUtils} = React.addons;

describe('nuclide-ui-atom-text-editor', () => {

  describe('when its `path` is set', () => {

    var grammar;

    beforeEach(() => {
      // Path is relative to the root of this package (where "package.json" lives).
      grammar = atom.grammars.loadGrammarSync('grammars/ansi.cson');
    });

    afterEach(() => {
      atom.grammars.removeGrammar(grammar);
    });

    it('loads the desired `Grammar`', () => {
      var element = TestUtils.renderIntoDocument(<AtomTextEditor path=".ansi" />);
      expect(element.getModel().getGrammar().scopeName).toEqual('text.ansi');
    });

  });

  describe('when `readOnly`', () => {

    var element;
    var originalClipboardContents;

    beforeEach(() => {
      originalClipboardContents = atom.clipboard.readWithMetadata();
    });

    afterEach(() => {
      atom.clipboard.write(originalClipboardContents.text, originalClipboardContents.metadata);
    });

    describe('is true', () => {

      beforeEach(() => {
        element = TestUtils.renderIntoDocument(<AtomTextEditor readOnly={true} />);
      });

      it('allows copying', () => {
        var model = element.getModel();
        model.setText('fraggle');
        model.selectAll();
        model.copySelectedText();
        expect(atom.clipboard.read()).toEqual('fraggle');
      });

      it('disallows pasting', () => {
        var model = element.getModel();
        atom.clipboard.write('foo bar baz');
        model.pasteText();
        expect(model.getText()).toEqual('');
      });

      it('disallows deleting text', () => {
        var model = element.getModel();
        model.setText('balloon');
        model.selectAll();
        model.delete();
        expect(model.getText()).toEqual('balloon');
      });

    });

    describe('is undefined', () => {

      beforeEach(() => {
        element = TestUtils.renderIntoDocument(<AtomTextEditor />);
      });

      it('allows copying', () => {
        var model = element.getModel();
        model.setText('fraggle');
        model.selectAll();
        model.copySelectedText();
        expect(atom.clipboard.read()).toEqual('fraggle');
      });

      it('allows pasting', () => {
        var model = element.getModel();
        atom.clipboard.write('foo bar baz');
        model.pasteText();
        expect(model.getText()).toEqual('foo bar baz');
      });

      it('allows deleting text', () => {
        var model = element.getModel();
        model.setText('balloon');
        model.selectAll();
        model.delete();
        expect(model.getText()).toEqual('');
      });

    });

  });

});
