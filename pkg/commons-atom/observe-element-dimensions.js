'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeElementDimensions = observeElementDimensions;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

const observerConfig = {
  childList: true,
  attributes: true,
  characterData: true,
  subtree: true,
  attributeOldValue: true,
  characterDataOldValue: true
}; /**
    * Copyright (c) 2015-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the license found in the LICENSE file in
    * the root directory of this source tree.
    *
    * 
    * @format
    */

function getElementDimensions(node) {
  return {
    clientHeight: node.clientHeight,
    clientWidth: node.clientWidth,
    offsetHeight: node.offsetHeight,
    offsetWidth: node.offsetWidth,
    scrollHeight: node.scrollHeight,
    scrollWidth: node.scrollWidth
  };
}

function observeElementDimensions(node) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    observer.next(getElementDimensions(node));

    // eslint-disable-next-line no-undef
    const mutationObserver = new MutationObserver(() => {
      observer.next(getElementDimensions(node));
    });

    mutationObserver.observe(node, observerConfig);

    return mutationObserver.disconnect.bind(mutationObserver);
  }).distinctUntilChanged((dimensions1, dimensions2) => {
    for (const key in dimensions1) {
      if (dimensions1[key] !== dimensions2[key]) {
        return false;
      }
    }
    return true;
  });
}