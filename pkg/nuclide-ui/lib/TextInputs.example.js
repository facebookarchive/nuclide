Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _Block = require('./Block');

var _AtomInput = require('./AtomInput');

var _AtomTextEditor = require('./AtomTextEditor');

var AtomInputExample = function AtomInputExample() {
  return _reactForAtom.React.createElement(
    'div',
    null,
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        disabled: false,
        initialValue: 'atom input',
        placeholderText: 'placeholder text'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        disabled: true,
        initialValue: 'disabled atom input',
        placeholderText: 'placeholder text'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'xs atom input',
        placeholderText: 'placeholder text',
        size: 'xs'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'sm atom input',
        placeholderText: 'placeholder text',
        size: 'sm'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'lg atom input',
        placeholderText: 'placeholder text',
        size: 'lg'
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'unstyled atom input',
        placeholderText: 'placeholder text',
        unstyled: true
      })
    ),
    _reactForAtom.React.createElement(
      _Block.Block,
      null,
      _reactForAtom.React.createElement(_AtomInput.AtomInput, {
        initialValue: 'atom input with custom width',
        placeholderText: 'placeholder text',
        width: 200
      })
    )
  );
};

var buffer1 = new _atom.TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a TextBuffer.\nconst a = 42;'
});
var buffer2 = new _atom.TextBuffer({
  text: '/**\n * Hi!\n */\n\n// I am a read-only, gutter-less TextBuffer.\nconst a = 42;'
});
var editorWrapperStyle = {
  display: 'flex',
  flexGrow: 1,
  height: '12em',
  boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.3)'
};

var AtomTextEditorExample = function AtomTextEditorExample() {
  return _reactForAtom.React.createElement(
    _Block.Block,
    null,
    _reactForAtom.React.createElement(
      'div',
      { style: editorWrapperStyle },
      _reactForAtom.React.createElement(_AtomTextEditor.AtomTextEditor, {
        gutterHidden: false,
        readOnly: false,
        syncTextContents: false,
        autoGrow: false,
        path: 'aJavaScriptFile.js',
        textBuffer: buffer1
      })
    ),
    _reactForAtom.React.createElement(
      'div',
      { style: _extends({}, editorWrapperStyle, { marginTop: '2em' }) },
      _reactForAtom.React.createElement(_AtomTextEditor.AtomTextEditor, {
        gutterHidden: true,
        readOnly: true,
        syncTextContents: false,
        autoGrow: false,
        path: 'aJavaScriptFile.js',
        textBuffer: buffer2
      })
    )
  );
};

var TextInputExamples = {
  sectionName: 'Text Inputs',
  description: '',
  examples: [{
    title: 'AtomInput',
    component: AtomInputExample
  }, {
    title: 'AtomTextEditor',
    component: AtomTextEditorExample
  }]
};
exports.TextInputExamples = TextInputExamples;
//# sourceMappingURL=data:application/json;base64,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QUMiLCJmaWxlIjoiVGV4dElucHV0cy5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QmxvY2t9IGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4vQXRvbUlucHV0JztcbmltcG9ydCB7QXRvbVRleHRFZGl0b3J9IGZyb20gJy4vQXRvbVRleHRFZGl0b3InO1xuXG5jb25zdCBBdG9tSW5wdXRFeGFtcGxlID0gKCk6IFJlYWN0LkVsZW1lbnQgPT4gKFxuICA8ZGl2PlxuICAgIDxCbG9jaz5cbiAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgZGlzYWJsZWQ9e2ZhbHNlfVxuICAgICAgICBpbml0aWFsVmFsdWU9XCJhdG9tIGlucHV0XCJcbiAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwicGxhY2Vob2xkZXIgdGV4dFwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPEF0b21JbnB1dFxuICAgICAgICBkaXNhYmxlZD17dHJ1ZX1cbiAgICAgICAgaW5pdGlhbFZhbHVlPVwiZGlzYWJsZWQgYXRvbSBpbnB1dFwiXG4gICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cInBsYWNlaG9sZGVyIHRleHRcIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgaW5pdGlhbFZhbHVlPVwieHMgYXRvbSBpbnB1dFwiXG4gICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cInBsYWNlaG9sZGVyIHRleHRcIlxuICAgICAgICBzaXplPVwieHNcIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgaW5pdGlhbFZhbHVlPVwic20gYXRvbSBpbnB1dFwiXG4gICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cInBsYWNlaG9sZGVyIHRleHRcIlxuICAgICAgICBzaXplPVwic21cIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgaW5pdGlhbFZhbHVlPVwibGcgYXRvbSBpbnB1dFwiXG4gICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cInBsYWNlaG9sZGVyIHRleHRcIlxuICAgICAgICBzaXplPVwibGdcIlxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgaW5pdGlhbFZhbHVlPVwidW5zdHlsZWQgYXRvbSBpbnB1dFwiXG4gICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cInBsYWNlaG9sZGVyIHRleHRcIlxuICAgICAgICB1bnN0eWxlZD17dHJ1ZX1cbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8QXRvbUlucHV0XG4gICAgICAgIGluaXRpYWxWYWx1ZT1cImF0b20gaW5wdXQgd2l0aCBjdXN0b20gd2lkdGhcIlxuICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJwbGFjZWhvbGRlciB0ZXh0XCJcbiAgICAgICAgd2lkdGg9ezIwMH1cbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgPC9kaXY+XG4pO1xuXG5jb25zdCBidWZmZXIxID0gbmV3IFRleHRCdWZmZXIoe1xuICB0ZXh0OiAnLyoqXFxuICogSGkhXFxuICovXFxuXFxuLy8gSSBhbSBhIFRleHRCdWZmZXIuXFxuY29uc3QgYSA9IDQyOycsXG59KTtcbmNvbnN0IGJ1ZmZlcjIgPSBuZXcgVGV4dEJ1ZmZlcih7XG4gIHRleHQ6ICcvKipcXG4gKiBIaSFcXG4gKi9cXG5cXG4vLyBJIGFtIGEgcmVhZC1vbmx5LCBndXR0ZXItbGVzcyBUZXh0QnVmZmVyLlxcbmNvbnN0IGEgPSA0MjsnLFxufSk7XG5jb25zdCBlZGl0b3JXcmFwcGVyU3R5bGUgPSB7XG4gIGRpc3BsYXk6ICdmbGV4JyxcbiAgZmxleEdyb3c6IDEsXG4gIGhlaWdodDogJzEyZW0nLFxuICBib3hTaGFkb3c6ICcwIDAgMjBweCAwIHJnYmEoMCwgMCwgMCwgMC4zKScsXG59O1xuXG5jb25zdCBBdG9tVGV4dEVkaXRvckV4YW1wbGUgPSAoKTogUmVhY3QuRWxlbWVudCA9PiAoXG4gIDxCbG9jaz5cbiAgICA8ZGl2IHN0eWxlPXtlZGl0b3JXcmFwcGVyU3R5bGV9PlxuICAgICAgPEF0b21UZXh0RWRpdG9yXG4gICAgICAgIGd1dHRlckhpZGRlbj17ZmFsc2V9XG4gICAgICAgIHJlYWRPbmx5PXtmYWxzZX1cbiAgICAgICAgc3luY1RleHRDb250ZW50cz17ZmFsc2V9XG4gICAgICAgIGF1dG9Hcm93PXtmYWxzZX1cbiAgICAgICAgcGF0aD1cImFKYXZhU2NyaXB0RmlsZS5qc1wiXG4gICAgICAgIHRleHRCdWZmZXI9e2J1ZmZlcjF9XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgc3R5bGU9e3suLi5lZGl0b3JXcmFwcGVyU3R5bGUsIG1hcmdpblRvcDogJzJlbSd9fT5cbiAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICBndXR0ZXJIaWRkZW49e3RydWV9XG4gICAgICAgIHJlYWRPbmx5PXt0cnVlfVxuICAgICAgICBzeW5jVGV4dENvbnRlbnRzPXtmYWxzZX1cbiAgICAgICAgYXV0b0dyb3c9e2ZhbHNlfVxuICAgICAgICBwYXRoPVwiYUphdmFTY3JpcHRGaWxlLmpzXCJcbiAgICAgICAgdGV4dEJ1ZmZlcj17YnVmZmVyMn1cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gIDwvQmxvY2s+XG4pO1xuXG5leHBvcnQgY29uc3QgVGV4dElucHV0RXhhbXBsZXMgPSB7XG4gIHNlY3Rpb25OYW1lOiAnVGV4dCBJbnB1dHMnLFxuICBkZXNjcmlwdGlvbjogJycsXG4gIGV4YW1wbGVzOiBbXG4gICAge1xuICAgICAgdGl0bGU6ICdBdG9tSW5wdXQnLFxuICAgICAgY29tcG9uZW50OiBBdG9tSW5wdXRFeGFtcGxlLFxuICAgIH0sXG4gICAge1xuICAgICAgdGl0bGU6ICdBdG9tVGV4dEVkaXRvcicsXG4gICAgICBjb21wb25lbnQ6IEF0b21UZXh0RWRpdG9yRXhhbXBsZSxcbiAgICB9LFxuICBdLFxufTtcbiJdfQ==