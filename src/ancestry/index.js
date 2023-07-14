const fs = require('fs/promises')
const { DATA_PATH } = require('../constant')
const debug = require("debug")('INFO');




class TransactionAncestory {
    #BLOCK_GRAPH = new Map();

    async  #_merge() {
        const dataFiles = await fs.readdir(DATA_PATH);
        let response = []
        for (let file of dataFiles) {
            const fileData = await fs.readFile(`${DATA_PATH}/${file}`);
            response = response.concat(JSON.parse(fileData.toString()))
        }
        return response
    }


    #dfs(tx) {
        let stack = [tx]
        const visited = new Set()
        while (stack.length) {
            const node = stack.pop();
            visited.add(node)
            const children = this.#BLOCK_GRAPH.get(node);
            if (Array.isArray(children)) {
                stack = stack.concat(children)
            }
        }

        return Array.from(visited);
    }


    #_processChildren(inputs) {

        const children = inputs.map(input => {
            return this.#dfs(input.txid)
        })
        return children.flat();
    }

    getGraph() {
        return this.#BLOCK_GRAPH
    }

    // pre process the transactions
    async preProcess() {
        const transactions = await this.#_merge()
        for (let transaction of transactions) {
            if (this.#BLOCK_GRAPH.has(transaction.txid)) {
                // do nothing
            } else {
                // Does not exist on Graph
                this.#BLOCK_GRAPH.set(transaction.txid, this.#_processChildren(transaction.vin))
            }
        }
    }

    // process and reduce the graph
    async process() {
        for (let [transaction, ancestors] of this.#BLOCK_GRAPH) {
            const TRANSACTION_IN_DIFFERENT_BLOCK = new Set()
            for (let ancestor of ancestors) {
                // parent not found in same block
                if (!this.#BLOCK_GRAPH.has(ancestor)) {
                    debug({
                        message: 'TRANSACTION_IN_DIFFERENT_BLOCK',
                        txn: ancestor
                    })
                    TRANSACTION_IN_DIFFERENT_BLOCK.add(ancestor)
                }
            }

            this.#BLOCK_GRAPH.set(transaction, ancestors.filter(_ancestor => !TRANSACTION_IN_DIFFERENT_BLOCK.has(_ancestor)))
        }
    }

    // transformation to output
    async postProcess() {
        const output = []

        for (let [transaction, parents] of this.#BLOCK_GRAPH) {
            output.push([transaction, parents.length])
        }

        return output.sort((a, b) => b[1] - a[1])
    }
}

module.exports = TransactionAncestory