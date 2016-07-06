"use strict";

let Observable, trackOperationTiming;

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

  remoteModule.isFuzzySearchAvailableFor = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "rootDirectory",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 40
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
          line: 41
        },
        kind: "boolean"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
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
  }], ["FileSearchResult", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "FuzzyFileSearchService.js",
      line: 14
    },
    name: "FileSearchResult",
    definition: {
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 14
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 15
        },
        name: "path",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 15
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 16
        },
        name: "score",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 16
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 17
        },
        name: "matchIndexes",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 17
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 17
            },
            kind: "number"
          }
        },
        optional: false
      }]
    }
  }], ["queryFuzzyFile", {
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
  }], ["isFuzzySearchAvailableFor", {
    kind: "function",
    name: "isFuzzySearchAvailableFor",
    location: {
      type: "source",
      fileName: "FuzzyFileSearchService.js",
      line: 39
    },
    type: {
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 39
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 40
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 41
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 41
          },
          kind: "boolean"
        }
      }
    }
  }]])
});