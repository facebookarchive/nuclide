'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';

const VALID_NUX_POSITIONS = new Set(['top', 'bottom', 'left', 'right', 'auto']);
// The maximum number of times the NuxView will attempt to attach to the DOM

function validatePlacement(position: string) : boolean {
  return VALID_NUX_POSITIONS.has(position);
}

export class NuxView {
  _selector : Function;
  _position: string;
  _content: string;
  _customContent: boolean;
  _disposables : CompositeDisposable;
  _callback: ?(() => void);
  _displayPredicate: (() => boolean);
  _completePredicate: (() => boolean);

  /**
   * Constructor for the NuxView.
   *
   * @param {?string} selectorString - The query selector to use to find an element
    on the DOM to attach to. If null, will use `selectorFunction` instead.
   * @param {?Function} selectorFunction - The function to execute to query an item
    on the DOM to attach to. If this is null, will use `selectorString` inside
    a call to `document.querySelector`.
   * @param {string} position - The position relative to the DOM element that the
    NUX should show.
   * @param {string} content - The content to show in the NUX.
   * @param {boolean} customContent - True iff `content` is a valid HTML String.
   * @param {?(() => boolean)} displayPredicate - Will be used when display the NUX.
   * The NUX will only show if this predicate returns true. If null, the predicate used
   * will always true.
   * @param {?(() => boolean)} completePredicate - Will be used when determining whether
   * the NUX has been completed/viewed. The NUX will only be completed if this returns true.
   * If null, the predicate used will always return true.
   *
   * @throws Errors if both `selectorString` and `selectorFunction` are null.
   */
  constructor(
    selectorString: ?string,
    selectorFunction : ?Function,
    position: string,
    content: string,
    customContent: boolean = false,
    displayPredicate: ?(() => boolean) = null,
    completePredicate: ?(() => boolean) = null,
  ) : void {
    if (selectorFunction != null) {
      this._selector = selectorFunction;
    } else if (selectorString != null) {
      //$FlowIgnore - selectorString complains even with the explicit check above.
      this._selector = () => document.querySelector(selectorString);
    } else {
      throw new Error('Either the selector or selectorFunction must be non-null!');
    }
    this._content = content;
    this._position = validatePlacement(position) ? position : 'auto';
    this._customContent = customContent;
    this._displayPredicate = displayPredicate || (() => true);
    this._completePredicate = completePredicate || (() => true);

    this._disposables = new CompositeDisposable();
  }

  setNuxCompleteCallback(callback: (() => void)): void {
    this._callback = callback;
  }

  _onNuxComplete(success: boolean): boolean {
    if (this._callback) {
      this._callback();
       // avoid the callback being invoked again
      this._callback = null;
    }
    this.dispose();
    return success;
  }

  dispose() : void {
    this._disposables.dispose();
  }
}
