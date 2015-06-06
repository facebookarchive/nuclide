'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileDialogComponent = require('../lib/FileDialogComponent');
var {File, Directory} = require('atom');
var React = require('react-for-atom');

describe('FileDialogComponent', () => {
  // We use `renderComponent` in `beforeEach` to return the component so the test
  // methods have a chance to modify the default props.
  var renderComponent: (props: any) => ReactComponent;
  var props;
  var hostEl;

  beforeEach(() => {
    hostEl = document.createElement('div');
    renderComponent = () => {
      return React.render(
          <FileDialogComponent {...props} />,
          hostEl);
    };

    props = {
      rootDirectory: new Directory('/root/'),
      message: <div>message</div>,
      onConfirm: () => {},
      onClose: () => {},
    };
  });

  afterEach(() => {
    React.unmountComponentAtNode(hostEl);
    hostEl = null;
  });

  describe('in the root', () => {
    it('relativizes a file path', () => {
      props.initialEntry = new File('/root/file.txt');
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getText()).toBe('file.txt');
    });

    it('relativizes a folder path', () => {
      props.initialEntry = new Directory('/root/dir');
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getText()).toBe('dir/');
    });

    it('selects a file basename with an extension', () => {
      props.initialEntry = new File('/root/file.txt');
      props.shouldSelectBasename = true;
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getSelectedText()).toBe('file');
    });

    it('selects a file basename without an extension', () => {
      props.initialEntry = new File('/root/file');
      props.shouldSelectBasename = true;
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getSelectedText()).toBe('file');
    });

    it('selects a folder basename', () => {
      props.initialEntry = new Directory('/root/dir');
      props.shouldSelectBasename = true;
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getSelectedText()).toBe('dir');
    });
  });

  describe('in a subdirectory', () => {
    it('relativizes a file path', () => {
      props.initialEntry = new File('/root/subdir/file.txt');
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getText()).toBe('subdir/file.txt');
    });

    it('relativizes a folder path', () => {
      props.initialEntry = new Directory('/root/subdir/dir');
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getText()).toBe('subdir/dir/');
    });

    it('selects a file basename with an extension', () => {
      props.initialEntry = new File('/root/subdir/file.txt');
      props.shouldSelectBasename = true;
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getSelectedText()).toBe('file');
    });

    it('selects a file basename without an extension', () => {
      props.initialEntry = new File('/root/subdir/file');
      props.shouldSelectBasename = true;
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getSelectedText()).toBe('file');
    });

    it('selects a folder basename', () => {
      props.initialEntry = new Directory('/root/subdir/dir');
      props.shouldSelectBasename = true;
      var component = renderComponent();
      var textEditor = component.refs['entryPath'].getTextEditor();

      expect(textEditor.getSelectedText()).toBe('dir');
    });
  });
});
