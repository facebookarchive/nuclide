'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAlternatesFromGraph = getAlternatesFromGraph;

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function getAlternatesFromGraph(graph, activeUri) {
  return (0, (_collection || _load_collection()).arrayUnique)(graph.relations.filter(r => r.from === activeUri && (r.labels.has('test') || r.labels.has('alternate'))).map(relation => relation.to));
}