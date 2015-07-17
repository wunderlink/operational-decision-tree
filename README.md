# Operational-Decision-Tree #

## Disclaimer ##

This package is brand new. I have yet to use it for the project I built it for. Consequently, this project may change soon.

## What it's not ##

ODT is not designed to be a machine learning decision tree. By all means though, use it how you want.

## What it is ##

ODT is a decision tree executor designed to run decision trees that are human-built and managed. Hence, it has features targetted at reducing the total number of nodes needed to achieve the desired leaf nodes.

Several things are required to use an ODT:
* The executor (this package)
* The tree data (provided by you)
* The decision condition functions (provided by you)
* The decision maker (a default decision maker is included in this package, but you can insert your own if need be)

Depending on the tree data you provide, the executor supports any combination of the following:
* Binary conditions (conditions that output either true or false)
* Arbitrary conditions (conditions that output an integer. In other words, more than two outcome branchways are possible)
* Multi-condition nodes (a single decision node can run multiple conditions)

## Example ##

binary-tree.json
```json
{
  "condition": {
    "name": "conditionAge",
    "opts": {
      "operator": ">",
      "value": 40
    }   
  },  
  "branches": [
    {   
      "condition": {
        "name": "conditionAge",
        "opts": {
          "operator": ">",
          "value": 20
        }   
      },  
      "branches": [
        {"result": "Leaf A: Aged between 0 and 20"},
        {"result": "Leaf B: Aged between 21 and 39"}
      ]   
    },  
    {   
      "condition": {
        "name": "conditionCountry",
        "opts": {
          "value": "US"
        }   
      },  
      "branches": [
        {"result": "Leaf C: Over 40 and not from US"},
        {"result": "Leaf D: Over 40 and from the US"}
      ]   
    }   
  ]
}
```

```js
var ODT = require('operational-decision-tree')

var treeData = require('./binary-tree.json')

var opts = { 
  conditions: {
    conditionAge: function (opts, data, cb) {
      if (eval(data.age+opts.operator+opts.value)){
        return cb(null, true)
      }   
      return cb(null, false)
    },
    conditionCountry: function (opts, data, cb) {
      if (data.nationality === opts.value) {
        return cb(null, true)
      }   
      return cb(null, false)
    }
  },
  decider: function (result) {
    if (result) {
      return 1
    } else {
      return 0
    }   
  }
}

var person = { 
  name: "Bob",
  age: 37, 
  nationality: 'US'
}


var DecisionTree = new ODT(opts)
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})
```


## A Note About Multi-Condition Nodes ##

Multi-condition nodes are useful for reducing the number of nodes needed for specific outcomes. They work well with binary trees, since the decision maker can resolve them with an && operation. However, when paired with arbitrary conditions, you may run into some problems depending on how your arbitrary conditions are setup.
