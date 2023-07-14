const fetch = require('isomorphic-fetch');
const fs = require('fs/promises')
const debug = require('debug')("INFO")

const BLOCK_HASH = '000000000000000000076c036ff5119e5a5a74df77abf64203473364509f7732'
const MAX_SIZE = 2850
const CONSTRUCT_TRANSACTION_API = ({
    hash = BLOCK_HASH,
    offset
}) => `https://blockstream.info/api/block/${hash}/txs/${offset}`

async function getTransactions() {

    let offset = 0
    const increment = 25
    const cachedFiles = new Set(await fs.readdir('data'));

    while (offset <= MAX_SIZE) {
        try {
            const FILE_NAME = `${offset}.json`
            if (!cachedFiles.has(FILE_NAME)) {
                const response = await fetch(CONSTRUCT_TRANSACTION_API({ offset }))
                    .then(e => e.json())
                await fs.writeFile(`data/${FILE_NAME}`, JSON.stringify(response))
                debug({
                    message: `SUCCESS: offset: ${offset}`
                })
            } else {
                debug({
                    message: `SKIPPED: offset: ${offset}`
                })
            }
        } catch (e) {
            // queue failed api calls for retry
            debug({
                error: `FAILED: offset: ${offset}`,
                e,
            })
        }
        offset += increment
    }
}

module.exports = {
    getTransactions
}