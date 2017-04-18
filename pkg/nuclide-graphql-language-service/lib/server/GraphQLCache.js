'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GraphQLCache = exports.getGraphQLCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getGraphQLCache = exports.getGraphQLCache = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (configDir) {
    const graphQLRC = yield (0, (_GraphQLConfig || _load_GraphQLConfig()).getGraphQLConfig)(configDir);
    const watchmanClient = new (_GraphQLWatchman || _load_GraphQLWatchman()).GraphQLWatchman();
    watchmanClient.checkVersion();
    watchmanClient.watchProject(configDir);
    return new GraphQLCache(configDir, graphQLRC, watchmanClient);
  });

  return function getGraphQLCache(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Given a list of GraphQL file metadata, read all files collected from watchman
 * and create fragmentDefinitions and GraphQL files cache.
 */
let readAllGraphQLFiles = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (list) {
    const queue = list.slice(); // copy
    const responses = [];
    while (queue.length) {
      const chunk = queue.splice(0, MAX_READS);
      const promises = chunk.map(function (fileInfo) {
        return promiseToReadGraphQLFile(fileInfo.filePath).catch(function (error) {
          /**
           * fs emits `EMFILE | ENFILE` error when there are too many open files -
           * this can cause some fragment files not to be processed.
           * Solve this case by implementing a queue to save files failed to be
           * processed because of `EMFILE` error, and await on Promises created
           * with the next batch from the queue.
           */
          if (error.code === 'EMFILE' || error.code === 'ENFILE') {
            queue.push(fileInfo);
          }
        }).then(function (response) {
          return responses.push(Object.assign({}, response, {
            mtime: fileInfo.mtime,
            size: fileInfo.size
          }));
        });
      });
      yield Promise.all(promises); // eslint-disable-line no-await-in-loop
    }

    return processGraphQLFiles(responses);
  });

  return function readAllGraphQLFiles(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

/**
 * Takes an array of GraphQL File information and batch-processes into a
 * map of fragmentDefinitions and GraphQL file cache.
 */


var _fs = _interopRequireDefault(require('fs'));

var _path = _interopRequireDefault(require('path'));

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _kinds;

function _load_kinds() {
  return _kinds = require('graphql/language/kinds');
}

var _GraphQLConfig;

function _load_GraphQLConfig() {
  return _GraphQLConfig = require('../config/GraphQLConfig');
}

var _GraphQLWatchman;

function _load_GraphQLWatchman() {
  return _GraphQLWatchman = require('./GraphQLWatchman');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Maximum files to read when processing GraphQL files.

// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
const MAX_READS = 200; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        */

class GraphQLCache {

  constructor(configDir, graphQLRC, watchmanClient) {
    this._configDir = configDir;
    this._graphQLRC = graphQLRC;
    this._watchmanClient = watchmanClient || new (_GraphQLWatchman || _load_GraphQLWatchman()).GraphQLWatchman();
    this._graphQLFileListCache = new Map();
    this._schemaMap = new Map();
    this._fragmentDefinitionsCache = new Map();
  }

  getGraphQLRC() {
    return this._graphQLRC;
  }

  getFragmentDependencies(query, fragmentDefinitions) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // If there isn't context for fragment references,
      // return an empty array.
      if (!fragmentDefinitions) {
        return [];
      }
      // If the query cannot be parsed, validations cannot happen yet.
      // Return an empty array.
      let parsedQuery;
      try {
        parsedQuery = (0, (_graphql || _load_graphql()).parse)(query);
      } catch (error) {
        return [];
      }
      return _this.getFragmentDependenciesForAST(parsedQuery, fragmentDefinitions);
    })();
  }

  getFragmentDependenciesForAST(parsedQuery, fragmentDefinitions) {
    return (0, _asyncToGenerator.default)(function* () {
      if (!fragmentDefinitions) {
        return [];
      }

      const existingFrags = new Map();
      const referencedFragNames = new Set();

      (0, (_graphql || _load_graphql()).visit)(parsedQuery, {
        FragmentDefinition(node) {
          existingFrags.set(node.name.value, true);
        },
        FragmentSpread(node) {
          if (!referencedFragNames.has(node.name.value)) {
            referencedFragNames.add(node.name.value);
          }
        }
      });

      const asts = new Set();
      referencedFragNames.forEach(function (name) {
        if (!existingFrags.has(name) && fragmentDefinitions.has(name)) {
          asts.add((0, (_nullthrows || _load_nullthrows()).default)(fragmentDefinitions.get(name)));
        }
      });

      const referencedFragments = [];

      asts.forEach(function (ast) {
        (0, (_graphql || _load_graphql()).visit)(ast.definition, {
          FragmentSpread(node) {
            if (!referencedFragNames.has(node.name.value) && fragmentDefinitions.get(node.name.value)) {
              asts.add((0, (_nullthrows || _load_nullthrows()).default)(fragmentDefinitions.get(node.name.value)));
              referencedFragNames.add(node.name.value);
            }
          }
        });
        if (!existingFrags.has(ast.definition.name.value)) {
          referencedFragments.push(ast);
        }
      });

      return referencedFragments;
    })();
  }

  getFragmentDefinitions(graphQLConfig) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // This function may be called from other classes.
      // If then, check the cache first.
      const rootDir = graphQLConfig.getRootDir();
      if (_this2._fragmentDefinitionsCache.has(rootDir)) {
        return _this2._fragmentDefinitionsCache.get(rootDir) || new Map();
      }

      const inputDirs = graphQLConfig.getInputDirs();
      const excludeDirs = graphQLConfig.getExcludeDirs();
      const filesFromInputDirs = yield _this2._watchmanClient.listFiles(rootDir, { path: inputDirs });

      const list = filesFromInputDirs.map(function (fileInfo) {
        return {
          filePath: _path.default.join(rootDir, fileInfo.name),
          size: fileInfo.size,
          mtime: fileInfo.mtime
        };
      }).filter(function (fileInfo) {
        return excludeDirs.every(function (exclude) {
          return !fileInfo.filePath.startsWith(_path.default.join(rootDir, exclude));
        });
      });

      const { fragmentDefinitions, graphQLFileMap } = yield readAllGraphQLFiles(list);

      _this2._fragmentDefinitionsCache.set(rootDir, fragmentDefinitions);
      _this2._graphQLFileListCache.set(rootDir, graphQLFileMap);

      _this2._subscribeToFileChanges(rootDir, inputDirs, excludeDirs);

      return fragmentDefinitions;
    })();
  }

  /**
   * Subscribes to the file changes and update the cache accordingly.
   * @param `rootDir` the directory of config path
   */
  _subscribeToFileChanges(rootDir, inputDirs, excludeDirs) {
    var _this3 = this;

    this._watchmanClient.subscribe(this._configDir, result => {
      if (result.files && result.files.length > 0) {
        const graphQLFileMap = this._graphQLFileListCache.get(rootDir);
        if (!graphQLFileMap) {
          return;
        }
        result.files.forEach((() => {
          var _ref2 = (0, _asyncToGenerator.default)(function* ({ name, exists, size, mtime }) {
            // Prune the file using the input/excluded directories
            if (!inputDirs.some(function (dir) {
              return name.startsWith(dir);
            }) || excludeDirs.some(function (dir) {
              return name.startsWith(dir);
            })) {
              return;
            }
            const filePath = _path.default.join(result.root, result.subscription, name);

            // In the event of watchman recrawl (is_fresh_instance),
            // watchman subscription returns a full set of files within the
            // watched directory. After pruning with input/excluded directories,
            // the file could have been created/modified.
            // Using the cached size/mtime information, only cache the file if
            // the file doesn't exist or the file exists and one of or both
            // size/mtime is different.
            if (result.is_fresh_instance && exists) {
              const existingFile = graphQLFileMap.get(filePath);
              // Same size/mtime means the file stayed the same
              if (existingFile && existingFile.size === size && existingFile.mtime === mtime) {
                return;
              }

              const fileAndContent = yield promiseToReadGraphQLFile(filePath);
              graphQLFileMap.set(filePath, Object.assign({}, fileAndContent, {
                size,
                mtime
              }));
              // Otherwise, create/update the cache with the updated file and
              // content, or delete the cache if (!exists)
            } else {
              if (graphQLFileMap) {
                _this3._graphQLFileListCache.set(rootDir, (yield _this3._updateGraphQLFileListCache(graphQLFileMap, { size, mtime }, filePath, exists)));
              }
              const fragmentDefinitionCache = _this3._fragmentDefinitionsCache.get(rootDir);
              if (fragmentDefinitionCache) {
                _this3._fragmentDefinitionsCache.set(rootDir, (yield _this3._updateFragmentDefinitionCache(fragmentDefinitionCache, filePath, exists)));
              }
            }
          });

          return function (_x2) {
            return _ref2.apply(this, arguments);
          };
        })());
      }
    });
  }

  _updateGraphQLFileListCache(graphQLFileMap, metrics, filePath, exists) {
    return (0, _asyncToGenerator.default)(function* () {
      const fileAndContent = exists ? yield promiseToReadGraphQLFile(filePath) : null;
      const graphQLFileInfo = Object.assign({}, fileAndContent, metrics);

      const existingFile = graphQLFileMap.get(filePath);

      // 3 cases for the cache invalidation: create/modify/delete.
      // For create/modify, swap the existing entry if available;
      // otherwise, just push in the new entry created.
      // For delete, check `exists` and splice the file out.
      if (existingFile && !exists) {
        graphQLFileMap.delete(filePath);
      } else if (graphQLFileInfo) {
        graphQLFileMap.set(filePath, graphQLFileInfo);
      }

      return graphQLFileMap;
    })();
  }

  _updateFragmentDefinitionCache(fragmentDefinitionCache, filePath, exists) {
    return (0, _asyncToGenerator.default)(function* () {
      const fileAndContent = exists ? yield promiseToReadGraphQLFile(filePath) : null;
      // In the case of fragment definitions, the cache could just map the
      // definition name to the parsed ast, whether or not it existed
      // previously.
      // For delete, remove the entry from the set.
      // For cases where the modified content has syntax error and therefore
      // cannot be parsed, maintain the previous cache (do nothing).
      if (!exists) {
        fragmentDefinitionCache.delete(filePath);
      } else if (fileAndContent && fileAndContent.ast) {
        fileAndContent.ast.definitions.forEach(function (definition) {
          if (definition.kind === (_kinds || _load_kinds()).FRAGMENT_DEFINITION) {
            fragmentDefinitionCache.set(definition.name.value, {
              filePath: fileAndContent.filePath,
              content: fileAndContent.content,
              definition
            });
          }
        });
      }

      return fragmentDefinitionCache;
    })();
  }

  getSchema(configSchemaPath) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!configSchemaPath) {
        return null;
      }
      const schemaPath = _path.default.join(_this4._configDir, configSchemaPath);
      if (_this4._schemaMap.has(schemaPath)) {
        return _this4._schemaMap.get(schemaPath);
      }

      const schemaDSL = yield new Promise(function (resolve) {
        return _fs.default.readFile(schemaPath, 'utf8', function (error, content) {
          if (error) {
            throw new Error(String(error));
          }
          resolve(content);
        });
      });

      const schemaFileExt = _path.default.extname(schemaPath);
      let schema;
      try {
        switch (schemaFileExt) {
          case '.graphql':
            schema = (0, (_graphql || _load_graphql()).buildSchema)(schemaDSL);
            break;
          case '.json':
            schema = (0, (_graphql || _load_graphql()).buildClientSchema)(JSON.parse(schemaDSL));
            break;
          default:
            throw new Error('Unsupported schema file extention');
        }
      } catch (error) {
        throw new Error(error);
      }

      _this4._schemaMap.set(schemaPath, schema);
      return schema;
    })();
  }
}exports.GraphQLCache = GraphQLCache;
function processGraphQLFiles(responses) {
  const fragmentDefinitions = new Map();
  const graphQLFileMap = new Map();

  responses.forEach(response => {
    const { filePath, content, ast, mtime, size } = response;

    if (ast) {
      ast.definitions.forEach(definition => {
        if (definition.kind === (_kinds || _load_kinds()).FRAGMENT_DEFINITION) {
          fragmentDefinitions.set(definition.name.value, { filePath, content, definition });
        }
      });
    }

    // Relay the previous object whether or not ast exists.
    graphQLFileMap.set(filePath, {
      filePath,
      content,
      ast,
      mtime,
      size
    });
  });

  return { fragmentDefinitions, graphQLFileMap };
}

/**
 * Returns a Promise to read a GraphQL file and return a GraphQL metadata
 * including a parsed AST.
 */
function promiseToReadGraphQLFile(filePath) {
  return new Promise((resolve, reject) => _fs.default.readFile(filePath, 'utf8', (error, content) => {
    if (error) {
      reject(error);
      return;
    }

    let ast = null;
    if (content.trim().length !== 0) {
      try {
        ast = (0, (_graphql || _load_graphql()).parse)(content);
      } catch (_) {
        // If query has syntax errors, go ahead and still resolve
        // the filePath and the content, but leave ast with null.
        resolve({ filePath, content, ast: null });
        return;
      }
    }
    resolve({ filePath, content, ast });
  }));
}