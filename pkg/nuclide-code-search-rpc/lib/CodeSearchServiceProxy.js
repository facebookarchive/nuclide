"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.isEligibleForDirectory = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("CodeSearchService/isEligibleForDirectory", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "boolean"
      });
    });
  };

  remoteModule.codeSearch = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "regex",
      type: {
        kind: "named",
        name: "RegExp"
      }
    }, {
      name: "useVcsSearch",
      type: {
        kind: "boolean"
      }
    }, {
      name: "tool",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "maxResults",
      type: {
        kind: "number"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("CodeSearchService/codeSearch", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "CodeSearchResult"
      });
    }).publish();
  };

  remoteModule.remoteAtomSearch = function (arg0, arg1, arg2, arg3, arg4) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "regex",
      type: {
        kind: "named",
        name: "RegExp"
      }
    }, {
      name: "subdirs",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "useVcsSearch",
      type: {
        kind: "boolean"
      }
    }, {
      name: "tool",
      type: {
        kind: "nullable",
        type: {
          kind: "string"
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("CodeSearchService/remoteAtomSearch", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "search$FileResult"
      });
    }).publish();
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
    isEligibleForDirectory: {
      kind: "function",
      name: "isEligibleForDirectory",
      location: {
        type: "source",
        fileName: "CodeSearchService.js",
        line: 29
      },
      type: {
        location: {
          type: "source",
          fileName: "CodeSearchService.js",
          line: 29
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
    CodeSearchResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 14
      },
      name: "CodeSearchResult",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "row",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "column",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "string"
          },
          optional: false
        }]
      }
    },
    codeSearch: {
      kind: "function",
      name: "codeSearch",
      location: {
        type: "source",
        fileName: "CodeSearchService.js",
        line: 53
      },
      type: {
        location: {
          type: "source",
          fileName: "CodeSearchService.js",
          line: 53
        },
        kind: "function",
        argumentTypes: [{
          name: "directory",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "regex",
          type: {
            kind: "named",
            name: "RegExp"
          }
        }, {
          name: "useVcsSearch",
          type: {
            kind: "boolean"
          }
        }, {
          name: "tool",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "maxResults",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "CodeSearchResult"
          }
        }
      }
    },
    search$Match: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 21
      },
      name: "search$Match",
      definition: {
        kind: "object",
        fields: [{
          name: "lineText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "lineTextOffset",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "matchText",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "range",
          type: {
            kind: "array",
            type: {
              kind: "array",
              type: {
                kind: "number"
              }
            }
          },
          optional: false
        }]
      }
    },
    search$FileResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 28
      },
      name: "search$FileResult",
      definition: {
        kind: "object",
        fields: [{
          name: "filePath",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "matches",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "search$Match"
            }
          },
          optional: false
        }]
      }
    },
    remoteAtomSearch: {
      kind: "function",
      name: "remoteAtomSearch",
      location: {
        type: "source",
        fileName: "CodeSearchService.js",
        line: 76
      },
      type: {
        location: {
          type: "source",
          fileName: "CodeSearchService.js",
          line: 76
        },
        kind: "function",
        argumentTypes: [{
          name: "directory",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "regex",
          type: {
            kind: "named",
            name: "RegExp"
          }
        }, {
          name: "subdirs",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "useVcsSearch",
          type: {
            kind: "boolean"
          }
        }, {
          name: "tool",
          type: {
            kind: "nullable",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "search$FileResult"
          }
        }
      }
    }
  }
});