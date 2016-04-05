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
//# sourceMappingURL=data:application/json;base64,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QUMiLCJmaWxlIjoiVGV4dElucHV0cy5leGFtcGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtUZXh0QnVmZmVyfSBmcm9tICdhdG9tJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QmxvY2t9IGZyb20gJy4vQmxvY2snO1xuaW1wb3J0IHtBdG9tSW5wdXR9IGZyb20gJy4vQXRvbUlucHV0JztcbmltcG9ydCB7QXRvbVRleHRFZGl0b3J9IGZyb20gJy4vQXRvbVRleHRFZGl0b3InO1xuXG5jb25zdCBBdG9tSW5wdXRFeGFtcGxlID0gKCk6IFJlYWN0RWxlbWVudCA9PiAoXG4gIDxkaXY+XG4gICAgPEJsb2NrPlxuICAgICAgPEF0b21JbnB1dFxuICAgICAgICBkaXNhYmxlZD17ZmFsc2V9XG4gICAgICAgIGluaXRpYWxWYWx1ZT1cImF0b20gaW5wdXRcIlxuICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJwbGFjZWhvbGRlciB0ZXh0XCJcbiAgICAgIC8+XG4gICAgPC9CbG9jaz5cbiAgICA8QmxvY2s+XG4gICAgICA8QXRvbUlucHV0XG4gICAgICAgIGRpc2FibGVkPXt0cnVlfVxuICAgICAgICBpbml0aWFsVmFsdWU9XCJkaXNhYmxlZCBhdG9tIGlucHV0XCJcbiAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwicGxhY2Vob2xkZXIgdGV4dFwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPEF0b21JbnB1dFxuICAgICAgICBpbml0aWFsVmFsdWU9XCJ4cyBhdG9tIGlucHV0XCJcbiAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwicGxhY2Vob2xkZXIgdGV4dFwiXG4gICAgICAgIHNpemU9XCJ4c1wiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPEF0b21JbnB1dFxuICAgICAgICBpbml0aWFsVmFsdWU9XCJzbSBhdG9tIGlucHV0XCJcbiAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwicGxhY2Vob2xkZXIgdGV4dFwiXG4gICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPEF0b21JbnB1dFxuICAgICAgICBpbml0aWFsVmFsdWU9XCJsZyBhdG9tIGlucHV0XCJcbiAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwicGxhY2Vob2xkZXIgdGV4dFwiXG4gICAgICAgIHNpemU9XCJsZ1wiXG4gICAgICAvPlxuICAgIDwvQmxvY2s+XG4gICAgPEJsb2NrPlxuICAgICAgPEF0b21JbnB1dFxuICAgICAgICBpbml0aWFsVmFsdWU9XCJ1bnN0eWxlZCBhdG9tIGlucHV0XCJcbiAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwicGxhY2Vob2xkZXIgdGV4dFwiXG4gICAgICAgIHVuc3R5bGVkPXt0cnVlfVxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICAgIDxCbG9jaz5cbiAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgaW5pdGlhbFZhbHVlPVwiYXRvbSBpbnB1dCB3aXRoIGN1c3RvbSB3aWR0aFwiXG4gICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cInBsYWNlaG9sZGVyIHRleHRcIlxuICAgICAgICB3aWR0aD17MjAwfVxuICAgICAgLz5cbiAgICA8L0Jsb2NrPlxuICA8L2Rpdj5cbik7XG5cbmNvbnN0IGJ1ZmZlcjEgPSBuZXcgVGV4dEJ1ZmZlcih7XG4gIHRleHQ6ICcvKipcXG4gKiBIaSFcXG4gKi9cXG5cXG4vLyBJIGFtIGEgVGV4dEJ1ZmZlci5cXG5jb25zdCBhID0gNDI7Jyxcbn0pO1xuY29uc3QgYnVmZmVyMiA9IG5ldyBUZXh0QnVmZmVyKHtcbiAgdGV4dDogJy8qKlxcbiAqIEhpIVxcbiAqL1xcblxcbi8vIEkgYW0gYSByZWFkLW9ubHksIGd1dHRlci1sZXNzIFRleHRCdWZmZXIuXFxuY29uc3QgYSA9IDQyOycsXG59KTtcbmNvbnN0IGVkaXRvcldyYXBwZXJTdHlsZSA9IHtcbiAgZGlzcGxheTogJ2ZsZXgnLFxuICBmbGV4R3JvdzogMSxcbiAgaGVpZ2h0OiAnMTJlbScsXG4gIGJveFNoYWRvdzogJzAgMCAyMHB4IDAgcmdiYSgwLCAwLCAwLCAwLjMpJyxcbn07XG5cbmNvbnN0IEF0b21UZXh0RWRpdG9yRXhhbXBsZSA9ICgpOiBSZWFjdEVsZW1lbnQgPT4gKFxuICA8QmxvY2s+XG4gICAgPGRpdiBzdHlsZT17ZWRpdG9yV3JhcHBlclN0eWxlfT5cbiAgICAgIDxBdG9tVGV4dEVkaXRvclxuICAgICAgICBndXR0ZXJIaWRkZW49e2ZhbHNlfVxuICAgICAgICByZWFkT25seT17ZmFsc2V9XG4gICAgICAgIHN5bmNUZXh0Q29udGVudHM9e2ZhbHNlfVxuICAgICAgICBhdXRvR3Jvdz17ZmFsc2V9XG4gICAgICAgIHBhdGg9XCJhSmF2YVNjcmlwdEZpbGUuanNcIlxuICAgICAgICB0ZXh0QnVmZmVyPXtidWZmZXIxfVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IHN0eWxlPXt7Li4uZWRpdG9yV3JhcHBlclN0eWxlLCBtYXJnaW5Ub3A6ICcyZW0nfX0+XG4gICAgICA8QXRvbVRleHRFZGl0b3JcbiAgICAgICAgZ3V0dGVySGlkZGVuPXt0cnVlfVxuICAgICAgICByZWFkT25seT17dHJ1ZX1cbiAgICAgICAgc3luY1RleHRDb250ZW50cz17ZmFsc2V9XG4gICAgICAgIGF1dG9Hcm93PXtmYWxzZX1cbiAgICAgICAgcGF0aD1cImFKYXZhU2NyaXB0RmlsZS5qc1wiXG4gICAgICAgIHRleHRCdWZmZXI9e2J1ZmZlcjJ9XG4gICAgICAvPlxuICAgIDwvZGl2PlxuICA8L0Jsb2NrPlxuKTtcblxuZXhwb3J0IGNvbnN0IFRleHRJbnB1dEV4YW1wbGVzID0ge1xuICBzZWN0aW9uTmFtZTogJ1RleHQgSW5wdXRzJyxcbiAgZGVzY3JpcHRpb246ICcnLFxuICBleGFtcGxlczogW1xuICAgIHtcbiAgICAgIHRpdGxlOiAnQXRvbUlucHV0JyxcbiAgICAgIGNvbXBvbmVudDogQXRvbUlucHV0RXhhbXBsZSxcbiAgICB9LFxuICAgIHtcbiAgICAgIHRpdGxlOiAnQXRvbVRleHRFZGl0b3InLFxuICAgICAgY29tcG9uZW50OiBBdG9tVGV4dEVkaXRvckV4YW1wbGUsXG4gICAgfSxcbiAgXSxcbn07XG4iXX0=