const fs = require('fs/promises')
const { DATA_PATH } = require('../constant')
const debug = require("debug")('INFO');

async function _merge() {
    const dataFiles = await fs.readdir(DATA_PATH);
    let response = []
    for (let file of dataFiles) {
        const fileData = await fs.readFile(`${DATA_PATH}/${file}`);
        response = response.concat(JSON.parse(fileData.toString()))
    }
    return response
}


function _processChildren(inputs) {
    return inputs.map(input => input.txid)
}


class TransactionAncestory {
    #BLOCK_GRAPH = new Map();

    // pre process the transactions
    async preProcess() {
        const transactions = await _merge()
        for (let transaction of transactions) {
            if (this.#BLOCK_GRAPH.has(transaction.txid)) {
                // 
            } else {
                // Does not exist on Graph
                this.#BLOCK_GRAPH.set(transaction.txid, _processChildren(transaction.vin))
            }

        }
    }

    // process and reduce the graph
    async process() {
        for (let [transaction, ancestors] of this.#BLOCK_GRAPH) {
            const TRANSACTION_IN_DIFFERENT_BLOCK = new Set()
            for (let ancestor of ancestors) {
                if (this.#BLOCK_GRAPH.has(ancestor)) {
                    // add indirect parent
                    debug({
                        txn: transaction,
                        prevSize: this.#BLOCK_GRAPH.get(transaction).length,
                        message: 'FOUND_INDIRECT_PARENTS'
                    })
                    this.#BLOCK_GRAPH.set(transaction, this.#BLOCK_GRAPH.get(transaction).concat(ancestor))
                } else {
                    // parent not found in same block
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