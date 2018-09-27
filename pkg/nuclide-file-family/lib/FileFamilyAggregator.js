"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class FileFamilyAggregator {
  constructor(providers) {
    this._disposables = new (_UniversalDisposable().default)(providers.subscribe(providersValue => this._providers = providersValue));
  }

  dispose() {
    this._disposables.dispose();
  }

  async getRelatedFiles(path) {
    const allRelatedFiles = await Promise.all([...this._providers].map(provider => provider.getRelatedFiles(path)));
    const allFiles = new Map();
    const directedAdjacencyMatrix = new Map();
    const undirectedAdjacencyMatrix = new Map();
    allRelatedFiles.forEach(({
      files,
      relations
    }) => {
      files.forEach((fileData, filePath) => addRelatedFiletoFileMap(filePath, fileData, allFiles)); // Combine labels for all directed relations with identical from and to fields
      // Also combine labels for all undirected relations, regardless of from and to

      relations.forEach(relation => {
        if (relation.directed) {
          addRelationToAdjacencyMatrix(relation, directedAdjacencyMatrix);
        } else {
          const existingReverse = undirectedAdjacencyMatrix.get(relation.to);

          if (existingReverse != null && existingReverse.has(relation.from)) {
            const reverse = {
              from: relation.to,
              to: relation.from,
              labels: relation.labels,
              directed: relation.directed
            };
            addRelationToAdjacencyMatrix(reverse, undirectedAdjacencyMatrix);
          } else {
            addRelationToAdjacencyMatrix(relation, undirectedAdjacencyMatrix);
          }
        }
      });
    });
    const allRelations = [];
    directedAdjacencyMatrix.forEach(map => map.forEach(relation => allRelations.push(relation)));
    undirectedAdjacencyMatrix.forEach(map => map.forEach(relation => allRelations.push(relation)));
    return {
      files: allFiles,
      relations: allRelations
    };
  }

}

exports.default = FileFamilyAggregator;

function addRelatedFiletoFileMap(filePath, fileData, fileMap) {
  const existingFileData = fileMap.get(filePath);

  if (existingFileData == null) {
    fileMap.set(filePath, fileData);
    return;
  }

  const newFileData = {};
  newFileData.labels = (0, _collection().setUnion)(existingFileData.labels, fileData.labels);

  if (existingFileData.exists != null || fileData.exists != null) {
    // We want to optimistically trust any provider that says the file exists
    // i.e., true > false > undefined
    newFileData.exists = Boolean(existingFileData.exists) || Boolean(fileData.exists);
  }

  if (existingFileData.creatable != null || fileData.creatable != null) {
    // We want to trust that any provider saying that a file is not creatable
    // knows what it's talking about
    // i.e., false > true > undefined
    newFileData.creatable = !(existingFileData.creatable === false || fileData.creatable === false);
  }

  fileMap.set(filePath, newFileData);
}

function addRelationToAdjacencyMatrix(relation, adjacencyMatrix) {
  const existingRelationFrom = adjacencyMatrix.get(relation.from);

  if (existingRelationFrom == null) {
    adjacencyMatrix.set(relation.from, new Map([[relation.to, relation]]));
    return;
  }

  const existingRelationTo = existingRelationFrom.get(relation.to);

  if (existingRelationTo == null) {
    existingRelationFrom.set(relation.to, relation);
    return;
  } // now we know that directed, from, and to are all equal


  const combinedRelation = {
    from: relation.from,
    to: relation.to,
    labels: (0, _collection().setUnion)(relation.labels, existingRelationTo.labels),
    directed: relation.directed
  };
  existingRelationFrom.set(relation.to, combinedRelation);
}