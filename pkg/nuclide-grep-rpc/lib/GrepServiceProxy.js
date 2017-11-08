"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.grepSearch = function (arg0, arg1, arg2) {
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
    }])).switchMap(args => {
      return _client.callRemoteFunction("GrepService/grepSearch", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "search$FileResult"
      });
    }).publish();
  };

  remoteModule.grepReplace = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePaths",
      type: {
        kind: "array",
        type: {
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "regex",
      type: {
        kind: "named",
        name: "RegExp"
      }
    }, {
      name: "replacementText",
      type: {
        kind: "string"
      }
    }, {
      name: "concurrency",
      type: {
        kind: "nullable",
        type: {
          kind: "number"
        }
      }
    }])).switchMap(args => {
      return _client.callRemoteFunction("GrepService/grepReplace", "observable", args);
    }).concatMap(value => {
      return _client.unmarshal(value, {
        kind: "named",
        name: "search$ReplaceResult"
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
    search$Match: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 20
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
        fileName: "GrepService.js",
        line: 27
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
    search$ReplaceResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 32
      },
      name: "search$ReplaceResult",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "success"
            },
            optional: false
          }, {
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "replacements",
            type: {
              kind: "number"
            },
            optional: false
          }]
        }, {
          kind: "object",
          fields: [{
            name: "type",
            type: {
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            name: "filePath",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "message",
            type: {
              kind: "string"
            },
            optional: false
          }]
        }],
        discriminantField: "type"
      }
    },
    grepSearch: {
      kind: "function",
      name: "grepSearch",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 44
      },
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 44
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
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "search$FileResult"
          }
        }
      }
    },
    grepReplace: {
      kind: "function",
      name: "grepReplace",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 60
      },
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 60
        },
        kind: "function",
        argumentTypes: [{
          name: "filePaths",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "regex",
          type: {
            kind: "named",
            name: "RegExp"
          }
        }, {
          name: "replacementText",
          type: {
            kind: "string"
          }
        }, {
          name: "concurrency",
          type: {
            kind: "nullable",
            type: {
              kind: "number"
            }
          }
        }],
        returnType: {
          kind: "observable",
          type: {
            kind: "named",
            name: "search$ReplaceResult"
          }
        }
      }
    }
  }
});