const TransactionAncestory = require("./src/ancestry");

(async function () {
    let transactionAncestory = new TransactionAncestory()

    await transactionAncestory.preProcess();
    await transactionAncestory.process();
    const allTransactions = await transactionAncestory.postProcess();
    const output = []
    for (let i = 0; i < 10; i++) {
        output.push(`${allTransactions[i][0]} ${allTransactions[i][1]}`)
    }

    console.log(output.join("\n"))
})()