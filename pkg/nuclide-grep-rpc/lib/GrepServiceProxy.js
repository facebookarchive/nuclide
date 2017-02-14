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
          line: 42
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
          line: 43
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
          line: 44
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 44
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
          line: 45
        },
        kind: "named",
        name: "search$FileResult"
      });
    }).publish();
  };

  remoteModule.grepReplace = function (arg0, arg1, arg2, arg3) {
    return Observable.fromPromise(_client.marshalArguments(Array.from(arguments), [{
      name: "filePaths",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 53
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 53
          },
          kind: "named",
          name: "NuclideUri"
        }
      }
    }, {
      name: "regex",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 54
        },
        kind: "named",
        name: "RegExp"
      }
    }, {
      name: "replacementText",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 55
        },
        kind: "string"
      }
    }, {
      name: "concurrency",
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 56
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 56
          },
          kind: "number"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("GrepService/grepReplace", "observable", args);
    })).concatMap(id => id).concatMap(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 57
        },
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
    },
    search$FileResult: {
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
    },
    search$ReplaceResult: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "GrepService.js",
        line: 31
      },
      name: "search$ReplaceResult",
      definition: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 31
        },
        kind: "union",
        types: [{
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 31
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 32
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 32
              },
              kind: "string-literal",
              value: "success"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 33
            },
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 33
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 34
            },
            name: "replacements",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 34
              },
              kind: "number"
            },
            optional: false
          }]
        }, {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 35
          },
          kind: "object",
          fields: [{
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 36
            },
            name: "type",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 36
              },
              kind: "string-literal",
              value: "error"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 37
            },
            name: "filePath",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 37
              },
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 38
            },
            name: "message",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 38
              },
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
        line: 41
      },
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 41
        },
        kind: "function",
        argumentTypes: [{
          name: "directory",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 42
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
              line: 43
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
              line: 44
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 44
              },
              kind: "string"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 45
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 45
            },
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
        line: 52
      },
      type: {
        location: {
          type: "source",
          fileName: "GrepService.js",
          line: 52
        },
        kind: "function",
        argumentTypes: [{
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 53
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 53
              },
              kind: "named",
              name: "NuclideUri"
            }
          }
        }, {
          name: "regex",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 54
            },
            kind: "named",
            name: "RegExp"
          }
        }, {
          name: "replacementText",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 55
            },
            kind: "string"
          }
        }, {
          name: "concurrency",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 56
            },
            kind: "nullable",
            type: {
              location: {
                type: "source",
                fileName: "GrepService.js",
                line: 56
              },
              kind: "number"
            }
          }
        }],
        returnType: {
          location: {
            type: "source",
            fileName: "GrepService.js",
            line: 57
          },
          kind: "observable",
          type: {
            location: {
              type: "source",
              fileName: "GrepService.js",
              line: 57
            },
            kind: "named",
            name: "search$ReplaceResult"
          }
        }
      }
    }
  }
});