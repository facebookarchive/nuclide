"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.grepSearch = function (arg0, arg1, arg2) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "directory",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 32
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "regex",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 33
        },
        kind: "named",
        name: "RegExp"
      }
    }, {
      name: "subdirs",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 34
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 34
          },
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("GrepService/grepSearch", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 35
        },
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
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["search$Match", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "GrepService.js",
      line: 19
    },
    name: "search$Match",
    definition: {
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 19
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 20
        },
        name: "lineText",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 20
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 21
        },
        name: "lineTextOffset",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 21
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 22
        },
        name: "matchText",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 22
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 23
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 23
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 23
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 23
              },
              kind: "number"
            }
          }
        },
        optional: false
      }]
    }
  }], ["search$FileResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "GrepService.js",
      line: 26
    },
    name: "search$FileResult",
    definition: {
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 26
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 27
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 27
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 28
        },
        name: "matches",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 28
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 28
            },
            kind: "named",
            name: "search$Match"
          }
        },
        optional: false
      }]
    }
  }], ["grepSearch", {
    kind: "function",
    name: "grepSearch",
    location: {
      type: "source",
      fileName: "GrepService.js",
      line: 31
    },
    type: {
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 31
      },
      kind: "function",
      argumentTypes: [{
        name: "directory",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 32
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "regex",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 33
          },
          kind: "named",
          name: "RegExp"
        }
      }, {
        name: "subdirs",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 34
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 34
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 35
        },
        kind: "observable",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 35
          },
          kind: "named",
          name: "search$FileResult"
        }
      }
    }
  }]])
});