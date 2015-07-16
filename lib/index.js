

DecisionTree = module.exports = function (opts) {
  if (!opts.conditions) {
    return new Error("Must specify all condition functions!")
  }
  this.opts = opts
}

DecisionTree.prototype.defaultDecider = function (result) {
  if (result) {
    return 1
  } else {
    return 0
  }
}

DecisionTree.prototype.run = function (treeData, subjectData, cb) {
  this.runNode(treeData, subjectData, function (err, result) {
    if (err) return cb(err)
    cb(err, result)
  })
}

DecisionTree.prototype.runNode = function (node, subjectData, cb) {
  var self = this
  if (node.condition) {
    this.testCondition(node.condition, subjectData, function (err, result) {
      if (err) return cb(err)
      if (self.opts.decider) {
        var decide = self.opts.decider
      } else {
        var decide = self.defaultDecider
      }
      decision = decide(result)
      self.handleDecision(node, subjectData, decision, cb)
    })
  } else if (node.conditions) {
  } else {
    cb(null, node)
  }
}

DecisionTree.prototype.testCondition = function (condition, subjectData, cb) {
  if (this.opts.conditions[condition.name]) {
    var fn = this.opts.conditions[condition.name]
    if (this.opts.conditions[condition.name].run) {
      fn = this.opts.conditions[condition.name].run
    }
    fn(condition.opts, subjectData, function (err, result) {
      if (err) return cb(err)
      cb(null, result)
    })
  } else {
    cb(new Error('Condition named: "'+condition.name+'" does not exist!'))
  }
}

DecisionTree.prototype.handleDecision = function (node, subjectData, decision, cb) {
  if (node.paths) {
    if (!node.paths[decision]) {
      return cb(new Error("result path does not exist"))
    }
    this.runNode(node.paths[decision], subjectData, cb)
  } else {
    cb(new Error('Node with decisions has no paths!'))
  }
}


DecisionTree.prototype.testConditions = function (conditions, req, res, cb) {
  for (var index in conditions) {
  }
}
