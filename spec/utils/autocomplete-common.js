'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type AutocompleteSuggestion = {
  word: string;
  leftLabel: string;
  rightLabel: string;
};

export function getAutocompleteView(): ?HTMLElement {
  const view = atom.views.getView(atom.workspace);
  return view.querySelector('.autocomplete-plus');
}

export function waitsForAutocompleteSuggestions(): void {
  waitsFor('autocomplete suggestions to load', 10000, () => {
    return getAutocompleteView() != null;
  });
}

export function getAutocompleteSuggestions(): Array<AutocompleteSuggestion> {
  const view = getAutocompleteView();
  if (view == null) {
    return [];
  }

  // $FlowIssue: NodeList should be iterable
  const items = Array.from(view.querySelectorAll('li'));
  return items.map(node => ({
    word: node.querySelector('.word').innerText,
    leftLabel: node.querySelector('.left-label').innerText,
    rightLabel: node.querySelector('.right-label').innerText,
  }));
}

export function getAutocompleteDescription(): ?string {
  const autocompleteView = getAutocompleteView();
  if (autocompleteView == null) {
    return null;
  }
  const typeHintView = autocompleteView.querySelector('.suggestion-description-content');
  if (typeHintView == null) {
    return null;
  }
  return typeHintView.innerText;
}
