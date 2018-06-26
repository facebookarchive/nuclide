"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.queryFuzzyFile = function (arg0) {
    return _client.callRemoteFunction("FuzzyFileSearchService/queryFuzzyFile", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "config",
      type: {
        kind: "object",
        fields: [{
          name: "rootDirectory",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "queryRoot",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: true
        }, {
          name: "queryString",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "ignoredNames",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "smartCase",
          type: {
            kind: "boolean"
          },
          optional: true
        }, {
          name: "preferCustomSearch",
          type: {
            kind: "boolean"
          },
          optional: false
        }]
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "FileSearchResult"
        }
      });
    });
  };

  remoteModule.queryAllExistingFuzzyFile = function (arg0, arg1, arg2) {
    return _client.callRemoteFunction("FuzzyFileSearchService/queryAllExistingFuzzyFile", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "queryString",
      type: {
        kind: "string"
      }
    }, {
      name: "ignoredNames",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "preferCustomSearch",
      type: {
        kind: "boolean"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "array",
        type: {
          kind: "named",
          name: "FileSearchResult"
        }
      });
    });
  };

  remoteModule.isFuzzySearchAvailableFor = function (arg0) {
    return _client.callRemoteFunction("FuzzyFileSearchService/isFuzzySearchAvailableFor", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.disposeFuzzySearch = function (arg0) {
    return _client.callRemoteFunction("FuzzyFileSearchService/disposeFuzzySearch", "promise", _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "void"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "defs", {
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    FileSearchResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 14
      },
      name: "FileSearchResult",
      definition: {
        kind: "object",
        fields: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "score",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "matchIndexes",
          type: {
            kind: "array",
            type: {
              kind: "number"
            }
          },
          optional: false
        }]
      }
    },
    queryFuzzyFile: {
      kind: "function",
      name: "queryFuzzyFile",
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 72
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 72
        },
        kind: "function",
        argumentTypes: [{
          name: "config",
          type: {
            kind: "object",
            fields: [{
              name: "rootDirectory",
              type: {
                kind: "named",
                name: "NuclideUri"
              },
              optional: false
            }, {
              name: "queryRoot",
              type: {
                kind: "named",
                name: "NuclideUri"
              },
              optional: true
            }, {
              name: "queryString",
              type: {
                kind: "string"
              },
              optional: false
            }, {
              name: "ignoredNames",
              type: {
                kind: "array",
                type: {
                  kind: "string"
                }
              },
              optional: false
            }, {
              name: "smartCase",
              type: {
                kind: "boolean"
              },
              optional: true
            }, {
              name: "preferCustomSearch",
              type: {
                kind: "boolean"
              },
              optional: false
            }]
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "FileSearchResult"
            }
          }
        }
      }
    },
    queryAllExistingFuzzyFile: {
      kind: "function",
      name: "queryAllExistingFuzzyFile",
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 112
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 112
        },
        kind: "function",
        argumentTypes: [{
          name: "queryString",
          type: {
            kind: "string"
          }
        }, {
          name: "ignoredNames",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "preferCustomSearch",
          type: {
            kind: "boolean"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "FileSearchResult"
            }
          }
        }
      }
    },
    isFuzzySearchAvailableFor: {
      kind: "function",
      name: "isFuzzySearchAvailableFor",
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 140
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 140
        },
        kind: "function",
        argumentTypes: [{
          name: "rootDirectory",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "boolean"
          }
        }
      }
    },
    disposeFuzzySearch: {
      kind: "function",
      name: "disposeFuzzySearch",
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 149
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 149
        },
        kind: "function",
        argumentTypes: [{
          name: "rootDirectory",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "void"
          }
        }
      }
    }
  }
});