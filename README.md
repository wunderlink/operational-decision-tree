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
* Arbitrary conditions (conditions that output an integer. In other words, more than two outcome pathways are possible)
* Multi-condition nodes (a single decision node can run multiple conditions)

## Multi-Condition Nodes ##

Multi-condition nodes are useful for reducing the number of nodes needed for specific outcomes. They work well with binary trees, since the decision maker can resolve them with an && operation. However, when paired with arbitrary conditions, you may run into some problems depending on how your arbitrary conditions are setup.
