'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.BusyMessageInstance = undefined;var _UniversalDisposable;














function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class BusyMessageInstance {







  // These things might be modified afterwards:
  // These things are set at construction-time:




  constructor(
  publishCallback,
  creationOrder,
  waitingFor,
  onDidClick,
  disposables)
  {this._titleElement = document.createElement('span');this._currentTitle = null;this._isVisibleForDebounce = true;this._isVisibleForFile = true;this._revealTooltip = false;
    this._publishCallback = publishCallback;
    this._creationOrder = creationOrder;
    this._waitingFor = waitingFor;
    this._onDidClick = onDidClick;
    this._disposables = disposables;
  }

  get waitingFor() {
    return this._waitingFor;
  }

  setTitle(val) {if (!
    !this._disposables.disposed) {throw new Error('Invariant violation: "!this._disposables.disposed"');}
    if (this._currentTitle === val) {
      return;
    }
    this._currentTitle = val;
    while (this._titleElement.firstChild != null) {
      this._titleElement.removeChild(this._titleElement.firstChild);
    }
    if (this._onDidClick == null) {
      this._titleElement.appendChild(document.createTextNode(val));
    } else {
      const anchor = document.createElement('a');
      anchor.onclick = this._onDidClick;
      anchor.appendChild(document.createTextNode(val));
      this._titleElement.appendChild(anchor);
    }
    if (this.isVisible()) {
      this._publishCallback();
    }
  }

  getTitleElement() {
    return this._titleElement;
  }

  setIsVisibleForDebounce(val) {if (!
    !this._disposables.disposed) {throw new Error('Invariant violation: "!this._disposables.disposed"');}
    this._isVisibleForDebounce = val;
    this._publishCallback();
  }

  setIsVisibleForFile(val) {if (!
    !this._disposables.disposed) {throw new Error('Invariant violation: "!this._disposables.disposed"');}
    this._isVisibleForFile = val;
    this._publishCallback();
  }

  isVisible() {if (!
    !this._disposables.disposed) {throw new Error('Invariant violation: "!this._disposables.disposed"');}
    return (
      this._isVisibleForFile &&
      this._isVisibleForDebounce &&
      this._currentTitle != null);

  }

  setRevealTooltip(val) {
    this._revealTooltip = val;
  }

  shouldRevealTooltip() {
    return this._revealTooltip;
  }

  compare(that) {
    return this._creationOrder - that._creationOrder;
  }

  dispose() {
    this._disposables.dispose();
    this._currentTitle = null;
    this._publishCallback();
  }}exports.BusyMessageInstance = BusyMessageInstance;


// This is how we declare that a type fulfills an interface in Flow:
/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */null;