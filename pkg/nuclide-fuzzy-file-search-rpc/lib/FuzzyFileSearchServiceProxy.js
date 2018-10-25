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
        }, {
          name: "context",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ClientQueryContext"
            }
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

  remoteModule.queryAllExistingFuzzyFile = function (arg0, arg1, arg2, arg3) {
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
    }, {
      name: "context",
      type: {
        kind: "nullable",
        type: {
          kind: "named",
          name: "ClientQueryContext"
        }
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
        line: 15
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
    ClientQueryContext: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "ClientQueryContext.js",
        line: 25
      },
      name: "ClientQueryContext",
      definition: {
        kind: "object",
        fields: [{
          name: "session_id",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "open_arc_projects",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "working_sets",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: false
        }, {
          name: "recent_files",
          type: {
            kind: "array",
            type: {
              kind: "object",
              fields: [{
                name: "path",
                type: {
                  kind: "string"
                },
                optional: false
              }, {
                name: "timestamp",
                type: {
                  kind: "number"
                },
                optional: false
              }]
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
        line: 73
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 73
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
            }, {
              name: "context",
              type: {
                kind: "nullable",
                type: {
                  kind: "named",
                  name: "ClientQueryContext"
                }
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
        line: 118
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 118
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
        }, {
          name: "context",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "ClientQueryContext"
            }
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
        line: 148
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 148
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
        line: 157
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 157
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