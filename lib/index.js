

var _ = require('lodash')
var async = require('async')

DecisionTree = module.exports = function (opts) {
  if (opts) {
    this.opts = opts
  } else {
    this.opts = {}
  }
}


DecisionTree.prototype.run = function (treeData, subjectData, cb) {
  var nodeCount = -1
  this.runNode(nodeCount, treeData, subjectData, function (err, result) {
    if (err) return cb(err)
    cb(err, result)
  })
}

DecisionTree.prototype.runNode = function (nodeCount, node, subjectData, cb) {
  nodeCount++
  var self = this
  var resolved = false
  var resolvedIndex = 0
  this.runHits(node, subjectData)
  async.forEachOf(node.decisions, function (decision, index, callback) {
    if (resolved) {
      callback(null)
    } else {
      this.populate(nodeCount, node, node.decisions[i], subjectData, function (err, subjectData) {
        self.runComparisons(node.decisions[i], subjectData, function (err, result) {
          if (err) return cb(err)
          if (result) {
            resolved = true
          } else {
            resolvedIndex++
          }
          callback(null)
        })
      })
    }
  }, function (err) {
    if (err) return cb(err)
    self.handleDecision(nodeCount, node, subjectData, resolvedIndex, cb)
  })
}

DecisionTree.prototype.runComparisons = function (comparisons, subjectData, cb) {
  var self = this
  for (var i in comparisons) {
    var comparison = comparisons[i]
    var result = this.compare(comparison.property, comparison, subjectData, subjectPriority)
    if (!result) {
      return false
    }
  }
  return true
}

DecisionTree.prototype.runHits = function (node, subjectData) {
  var self = this
  if (node.runOnHit && this.opts.runOnHit) {
    for (var i in node.runOnHit) {
      var fn = node.runOnHit[i]
      if (this.opts.runOnHit[fn]) {
        this.opts.runOnHit[fn](subjectData)
      }
    }
  } else {
    return false
  }
}

DecisionTree.prototype.populate = function (nodeCount, node, comparisons, subjectData, cb) {
  var self = this
  async.each(comparisons, function (item, callback) {
    if (subjectData.odt[nodeCount] && subjectData.odt[nodeCount][item.property]) {
      callback(null)
    } else {
      self.getSubjectValue(node, item, subjectData, function (err, result) {
        if (err) return cb(err)
        if (!subjectData.odt) {
          subjectData.odt = {}
        }
        if (!subjectData.odt[nodeCount]) {
          subjectData.odt[nodeCount] = {}
        }
        subjectData.odt[nodeCount][item.property] = result
        return callback(null)
      })
    } else {
      return callback(null)
    }
  }, function (err) {
    if (err) return err
    return cb(null, subjectData)
  })
}

DecisionTree.prototype.getSubjectValue = function (decision, comparison, subjectData, cb) {
  if (isFunction(subjectData[comparison.property])) {
    // if a subject property is a function, run that function once per decision 
    // (so each comparison in the decision uses the same result of the subject function)
    subjectData[comparison.property](decision, subjectData, function (err, result) {
      if (err) return callback(err)
      return cb(null, result)
    })
  } else {
    return cb(null, null)
  }
}

DecisionTree.prototype.runComparison = function (decision, comparison, subjectData, subjectPriority, cb) {
  var run = null
  if (this.opts.decisionOpts && this.opts.decisionOpts[decision.name] && this.opts.decisionOpts[decision.name].run) {
    run = this.opts.decisionOpts[decision.name].run
  }
  if (run) {
    run(subjectData, function (err, result) {
      if (err) return err
      return cb(null, result)
    })
  } else {
    return cb(null, result)
  }
}

DecisionTree.prototype.compare = function (property, comparison, subjectData, subjectPriority) {
  var result = 0;
  if (subjectPriority && subjectPriority[property]) {
    var val = subjectPriority[property]
  } else {
    var val = _.get(subjectData, property)
  }
  switch (comparison.operation) {
    case ">":
      if (val > comparison.value) {
        result = 1;
      }
      break;
    case ">=":
      if (val >= comparison.value) {
        result = 1;
      }
      break;
    case "<":
      if (val < comparison.value) {
        result = 1;
      }
      break;
    case "<=":
      if (val <= comparison.value) {
        result = 1;
      }
      break;
    case "==":
      if (val == comparison.value) {
        result = 1;
      }
      break;
    case "===":
      if (val === comparison.value) {
        result = 1;
      }
      break;
    case "!=":
      if (val != comparison.value) {
        result = 1;
      }
      break;
    case "!==":
      if (val !== comparison.value) {
        result = 1;
      }
      break;
    case "exists":
      if (val) {
        result = 1;
      }
      break;
    case "in":
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 1;
        }
      }
      break;
    case "nin":
      result = 1;
      for (var i in comparison.value) {
        if (val === comparison.value[i]) {
          result = 0;
        }
      }
      break;
    default:
      return new Error('Invalid comparison operation')
  }
  return result
}

DecisionTree.prototype.handleDecision = function (nodeCount, node, subjectData, result, cb) {
  if (this.opts.decider) {
    var decide = this.opts.decider
  } else {
    var decide = this.defaultDecider
  }
  decision = decide(result)
console.log("RESULT", result)
console.log("decision", decision)
console.log("branches", node.branches)
  if (node.branches) {
    if (!node.branches[decision]) {
      return cb("result branch does not exist")
    }
    this.runNode(nodeCount, node.branches[decision], subjectData, cb)
  } else {
    return cb('Node with decisions has no branches!')
  }
}


DecisionTree.prototype.countDecisions = function (treeData, finished) {
  var decisionCount = {}
  var self = this
  this.walkTree(treeData, function (node, cb) {
    if (node.decision) {
      self.incrementDecisionCount(decisionCount, node.decision.name)
    } else if (node.decisions) {
      for (var index in node.decisions) {
        self.incrementDecisionCount(decisionCount, node.decisions[index].name)
      }
    }
    cb(null)
  }, function (err) {
    finished(err, decisionCount)
  })
}

DecisionTree.prototype.walkTree = function (node, perNode, finishedNode) {
  var self = this
  var count = 1
  var done = 0

  if (node.branches) {
    for (var index in node.branches) {
      count++
      self.walkTree(node.branches[index], perNode, function (err) {
        done++
        if (count === done) {
          finishedNode(null)
        }
      })
    }
  }

  perNode(node, function (err) {
    done++
    if (count === done) {
      finishedNode(null)
    }
  })
}

DecisionTree.prototype.incrementDecisionCount = function (decisionCount, decisionName) {
  if (!decisionCount[decisionName]) {
    decisionCount[decisionName] = 0
  }
  decisionCount[decisionName]++
}

function isFunction(functionToCheck) {
 var getType = {};
 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}
