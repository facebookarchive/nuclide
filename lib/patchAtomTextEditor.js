/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import invariant from 'assert';

// TODO(T31782876): Remove once fixed upstream in Atom
// https://github.com/atom/atom/pull/17702

// Currently, the updateClassList function on Atom's TextEditorComponent class
// does not properly re-add its managed classes (editor, isFocused, mini) to the
// element when the element has been rerendered with changed classes passed in.
// This patches the atom-text-editor element to fix the updateClassList function
// until a proper fix can be upstreamed to Atom

// Flag to prevent repatching if the Atom package is disabled and then re-enabled.
// Repatching would cause an infinite loop since the patchedUpdateClassList function
// calls the prototype updateClassList implementation
let isPatched = false;

export default function patchAtomTextEditor() {
  if (isPatched) {
    return;
  }
  isPatched = true;
  const atomTextEditor: atom$TextEditor = atom.workspace.buildTextEditor();

  // getElement initializes the AtomTextEditor's component property if it does
  // not exist yet
  atomTextEditor.getElement();

  // $FlowFixMe component is added by getElement() call if it doesn't exist
  invariant(atomTextEditor.component != null);

  const atomTextEditorComponentPrototype = Object.getPrototypeOf(
    atomTextEditor.component,
  );
  const updateClassListFn = atomTextEditorComponentPrototype.updateClassList;

  if (updateClassListFn != null) {
    atomTextEditorComponentPrototype.updateClassList = function() {
      updateClassListFn.call(this);
      for (let i = 0; i < this.classList.length; i++) {
        this.element.classList.add(this.classList[i]);
      }
    };
  }
}
