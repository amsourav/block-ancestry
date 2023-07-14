# block-ancestry


## prerequesite

- `npm run seed`

## run

- `npm start`

## debug mode

- Seeding `DEBUG=INFO npm run seed`
- Execute `DEBUG=INFO npm start`

## steps

- preProcess
    - read all api data and construct a graph with transaction id as key and vin transaction id as nodes
    - dfs on all nodes to find all parents of a transactions

- process
    - go through the whole graph an exclude transactions not present in the block/graph

- postProcess
    - transfor the graph into an sorted array of tuple [txid, count of parents]

- final
    - pick the top 10 items in descending order


## output

```csv
7d08f0c61cda9379bdf1fa68095f827199a0d4cb6b466a6da3f0dc956772c52b 14
b2bab595112517e8b6a06aa9f616272b479e57e21b4da52877ddf385316aa19b 13
d294be35db0b5fab4a6a00d6e4441c7e54be88fa02dfc188b75e4604ec6c3fcf 12
4205c68c68266259c5723948e0407dff25600e6420659cef4286dd1ae4658b63 12
7841dc7cf61d394094f4341fa98d0a6fd771e95ac93a9dcfec12a23ed3c670c5 12
7a128b0242d89d327fc2c273199c7529a31477d8ea949e5176b2a4eb69b74464 12
afe4b90e667df0171f63e6cc95c0a12d24592d436dd2e8b9b2a9998b4099ff6d 11
973e5adb05cc1cb80cabc5e451200333c993034153a078733ec06af7bf3c860b 11
4b4c90943c1651eabb8c5dfb6f490c4e56bd6cf42950a0430db17b9691b0236c 11
ef6c8e97b62eced1913df503667d49b9f5890cdb201be5d5d6c304af1d3f5db1 11
```