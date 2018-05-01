'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default =




































addTooltip;var _react = _interopRequireWildcard(require('react'));var _reactDom = _interopRequireDefault(require('react-dom'));var _shallowequal;function _load_shallowequal() {return _shallowequal = _interopRequireDefault(require('shallowequal'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}const REREGISTER_DELAY = 100; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    */const _tooltipRequests = new Map();const _createdTooltips = new Map();const _toDispose = new Set();let _timeoutHandle; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Adds a self-disposing Atom tooltip to a react element.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Typical usage:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * <div ref={addTooltip({title: 'My awesome tooltip', delay: 100, placement: 'top'})} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * or, if the ref needs to be preserved:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * <div ref={c => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *   addTooltip({title: 'My awesome tooltip', delay: 100, placement: 'top'})(c);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              *   _myDiv = c;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * }} />
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */function addTooltip(options) {let node;return elementRef => {_scheduleTooltipMaintenance();if (elementRef == null) {if (node != null) {if (_tooltipRequests.has(node)) {_tooltipRequests.delete(node);} else {_toDispose.add(node);}}return;}node = _reactDom.default.findDOMNode(elementRef);
    _tooltipRequests.set(node, options);
  };
}

function _registrationUndoesDisposal(
node,
options)
{
  const created = _createdTooltips.get(node);
  if (created == null) {
    return false;
  }

  return (0, (_shallowequal || _load_shallowequal()).default)(options, created.options);
}

function _scheduleTooltipMaintenance() {
  if (_timeoutHandle != null) {
    return;
  }

  _timeoutHandle = setTimeout(() => _performMaintenance(), REREGISTER_DELAY);
}

function _performMaintenance() {
  _timeoutHandle = null;

  for (const [node, options] of _tooltipRequests.entries()) {
    if (_registrationUndoesDisposal(node, options)) {
      _toDispose.delete(node);
      _tooltipRequests.delete(node);
    }
  }

  _toDispose.forEach(node => {
    const created = _createdTooltips.get(node);
    if (created != null) {
      created.disposable.dispose();
      _createdTooltips.delete(node);
    }
  });
  _toDispose.clear();

  for (const [node, options] of _tooltipRequests.entries()) {
    // $FlowIgnore
    const disposable = atom.tooltips.add(node, Object.assign({
      keyBindingTarget: node },
    options));


    _createdTooltips.set(node, { disposable, options });
  }
  _tooltipRequests.clear();
}