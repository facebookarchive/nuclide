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
          line: 31
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
          line: 32
        },
        kind: "string"
      }
    }, {
      name: "ignoredNames",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 33
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 33
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
          line: 34
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 34
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
          line: 40
        },
        kind: "string"
      }
    }, {
      name: "ignoredNames",
      type: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 41
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 41
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
          line: 42
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 42
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
          line: 61
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
          line: 62
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
          line: 69
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
          line: 69
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
      line: 30
    },
    type: {
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 30
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 31
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
            line: 32
          },
          kind: "string"
        }
      }, {
        name: "ignoredNames",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 33
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 33
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 34
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 34
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 34
            },
            kind: "named",
            name: "FileSearchResult"
          }
        }
      }
    }
  }], ["queryAllExistingFuzzyFile", {
    kind: "function",
    name: "queryAllExistingFuzzyFile",
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
        name: "queryString",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 40
          },
          kind: "string"
        }
      }, {
        name: "ignoredNames",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 41
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 41
            },
            kind: "string"
          }
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 42
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 42
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "FuzzyFileSearchService.js",
              line: 42
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
      line: 60
    },
    type: {
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 60
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 61
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 62
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 62
          },
          kind: "boolean"
        }
      }
    }
  }], ["disposeFuzzySearch", {
    kind: "function",
    name: "disposeFuzzySearch",
    location: {
      type: "source",
      fileName: "FuzzyFileSearchService.js",
      line: 69
    },
    type: {
      location: {
        type: "source",
        fileName: "FuzzyFileSearchService.js",
        line: 69
      },
      kind: "function",
      argumentTypes: [{
        name: "rootDirectory",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 69
          },
          kind: "named",
          name: "NuclideUri"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "FuzzyFileSearchService.js",
          line: 69
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "FuzzyFileSearchService.js",
            line: 69
          },
          kind: "void"
        }
      }
    }
  }]])
});