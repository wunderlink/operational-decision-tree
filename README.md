# Operational-Decision-Tree #

## Disclaimer ##

This package is brand new. I have yet to use it for the project I built it for. Consequently, this project may change soon.

## What it's not ##

ODT is not designed to be a machine learning decision tree. By all means though, use it how you want.

## What it is ##

ODT is a decision tree executor designed to run decision trees that are human-built and managed. Hence, it has features targetted at reducing the total number of nodes needed to achieve the desired leaf nodes.

For each condition, ODT compares the subject data to the tree data based on the "operation" parameter you pass in the tree. Supported operations are:
* > subject value is greater than tree comparison value
* >= subject value is greater than or equal to tree comparison value
* < subject value is less than tree comparison value
* <= subject value is less than or equal to tree comparison value
* == subject value is equal to tree comparison value
* === subject value is definitely equal to tree comparison value
* != subject value is not equal to tree comparison value
* !== subject value is definitely not equal to tree comparison value
* in subject value is present in tree comparison value (tree comparison value must be an array)
* nin subject value is not present in tree comparison value (tree comparison value must be an array)

Several things are required to use an ODT:
* The executor (this package)
* The tree data (provided by you)
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
    "property": "age",
    "comparison": {
      "operation": ">",
      "value": 40
    }   
  },  
  "branches": [
    {   
      "condition": {
        "name": "conditionAge",
        "property": "age",
        "comparison": {
          "operation": ">",
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
        "property": "nationality",
        "comparison": {
          "operation": "in",
          "value": ["US", "CA"]
        }   
      },  
      "branches": [
        {"result": "Leaf C: Over 40 and not from North America"},
        {"result": "Leaf D: Over 40 and from the North America"}
      ]   
    }   
  ]
}
```

```js
var ODT = require('operational-decision-tree')

var treeData = require('./binary-tree.json')

var person = { 
  name: "Bob",
  age: 37, 
  nationality: 'US'
}


var DecisionTree = new ODT()
DecisionTree.run(treeData, person, function (err, result) {
  if (err) console.error("ERROR", err)
  console.log("RESULT", result)
})
```


## A Note About Multi-Condition Nodes ##

Multi-condition nodes are useful for reducing the number of nodes needed for specific outcomes. They work well with binary trees, since the decision maker can resolve them with an && operation. However, when paired with arbitrary conditions, you may run into some problems depending on how your arbitrary conditions are setup.
