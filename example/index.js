


var DTS = require('../index.js')

var treeData = require('./tree.json')



var person = {
  name: "Bob",
  age: 41,
  nationality: 'US'
}

var conditionOpts = {
  populateFunctions: {
    random: function (node, comparisions, comparison, subjectData, cb) {
      var random = Math.floor(Math.random()*100)
      cb(null, random)
    }
  }
}

var DecisionTree = new DTS(conditionOpts)
DecisionTree.run(treeData, person, {}, function (err, result, populated) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
  console.log("PERSON", person)
  console.log("POPULATED", populated)
})

