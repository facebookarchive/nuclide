"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.queryFuzzyFile = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 27
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 28
        },
        kind: "string"
      }
    }, {
      name: "ignoredNames",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 29
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 29
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FuzzyFileSearchService/queryFuzzyFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 30
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 30
          },
          kind: "named",
          name: "FileSearchResult"
        }
      });
    });
  };

  remoteModule.queryAllExistingFuzzyFile = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "queryString",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 49
        },
        kind: "string"
      }
    }, {
      name: "ignoredNames",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 50
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 50
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("FuzzyFileSearchService/queryAllExistingFuzzyFile", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 51
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 51
          },
          kind: "named",
          name: "FileSearchResult"
        }
      });
    });
  };

  remoteModule.isFuzzySearchAvailableFor = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 71
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FuzzyFileSearchService/isFuzzySearchAvailableFor", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 72
        },
        kind: "boolean"
      });
    });
  };

  remoteModule.disposeFuzzySearch = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 79
        },
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("FuzzyFileSearchService/disposeFuzzySearch", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 79
        },
        kind: "void"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
  }
});
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
    queryFuzzyFile: {
      kind: "function",
      name: "queryFuzzyFile",
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 26
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 26
        },
        kind: "function",
        argumentTypes: [{
          name: "rootDirectory",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 27
            },
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "queryString",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 28
            },
            kind: "string"
          }
        }, {
          name: "ignoredNames",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 29
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FuzzyFileSearchService.js",
                line: 29
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 30
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 30
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FuzzyFileSearchService.js",
                line: 30
              },
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
        line: 48
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 48
        },
        kind: "function",
        argumentTypes: [{
          name: "queryString",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 49
            },
            kind: "string"
          }
        }, {
          name: "ignoredNames",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 50
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FuzzyFileSearchService.js",
                line: 50
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 51
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 51
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "FuzzyFileSearchService.js",
                line: 51
              },
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
        line: 70
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 70
        },
        kind: "function",
        argumentTypes: [{
          name: "rootDirectory",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 71
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 72
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 72
            },
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
        line: 79
      },
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 79
        },
        kind: "function",
        argumentTypes: [{
          name: "rootDirectory",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 79
            },
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 79
          },
          kind: "promise",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 79
            },
            kind: "void"
          }
        }
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
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 14
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "path",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "score",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "number"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "matchIndexes",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 17
              },
              kind: "number"
            }
          },
          optional: false
        }]
      }
    }
  }
});