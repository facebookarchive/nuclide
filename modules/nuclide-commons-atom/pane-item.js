'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.














isPending = isPending;exports.




observePendingStateEnd = observePendingStateEnd;var _event;function _load_event() {return _event = require('../nuclide-commons/event');} /**
                                                                                                                                          * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                          * All rights reserved.
                                                                                                                                          *
                                                                                                                                          * This source code is licensed under the BSD-style license found in the
                                                                                                                                          * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                          * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                          *
                                                                                                                                          * 
                                                                                                                                          * @format
                                                                                                                                          */function isPending(paneItem) {const pane = atom.workspace.paneForItem(paneItem);return pane && pane.getPendingItem() === paneItem;}function observePendingStateEnd(paneItem) {if (!(typeof paneItem.onDidTerminatePendingState === 'function')) {throw new Error('paneItem must implement onDidTerminatePendingState method');}return (0, (_event || _load_event()).observableFromSubscribeFunction)(paneItem.onDidTerminatePendingState.bind(paneItem));}