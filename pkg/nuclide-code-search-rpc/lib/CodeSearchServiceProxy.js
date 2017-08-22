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

  remoteModule.searchWithTool = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "tool",
      type: {
        kind: "string"
      }
    }, {
      name: "directory",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "query",
      type: {
        kind: "string"
      }
    }, {
      name: "maxResults",
      type: {
        kind: "number"
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("CodeSearchService/searchWithTool", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "CodeSearchResult"
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
        line: 20
      },
      type: {
        location: {
          type: "source",
          fileName: "CodeSearchService.js",
          line: 20
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
        line: 12
      },
      name: "CodeSearchResult",
      definition: {
        kind: "object",
        fields: [{
          name: "file",
          type: {
            kind: "string"
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
    searchWithTool: {
      kind: "function",
      name: "searchWithTool",
      location: {
        type: "source",
        fileName: "CodeSearchService.js",
        line: 51
      },
      type: {
        location: {
          type: "source",
          fileName: "CodeSearchService.js",
          line: 51
        },
        kind: "function",
        argumentTypes: [{
          name: "tool",
          type: {
            kind: "string"
          }
        }, {
          name: "directory",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "query",
          type: {
            kind: "string"
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
    }
  }
});