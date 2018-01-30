var IotAuth = artifacts.require("./IotAuth.sol");
const crypto = require('crypto');


var iot;
const ITER= 32; // number of time user should request access
const timelapiter = 11; // number of time oracle should send request time

var accounts;
/**
 * get the accounts from the blockchain
 */
web3.eth.getAccountsPromise = function () {
    return new Promise(function (resolve, reject) {
        web3.eth.getAccounts(function (e, accounts) {
            if (e != null) {
                reject(e);
            } else {
                resolve(accounts);
            }
        });
    });
};

/**
 * promise to wait
 * @param {*} t time in milisecond
 * @param {*} v not used
 */
function delay(t, v) {
    return new Promise((resolve) => {
        setTimeout(resolve.bind(null, v), t)
    });
}

/**
 * add a new pending manager on the blockchain
 */
addManager = function(user, manager) {
    return new Promise((resolve, reject) => {
        iot.addManager(user, {from: manager})
    })
}

/**
 * add multiples pending managers
 */
addManagers = function() {
    Promise.all([
        addManager(accounts[7], accounts[6]),
        addManager(accounts[8], accounts[6]),
        addManager(accounts[9], accounts[6]),
        delay(1000)
    ]).then(result =>  resolve(result))
    .catch(err => reject(err))
}

/**
 * vote for multiples managers on the blockchain
 */
voteManagers = function() {
    return Promise.all([
        iot.voteAddManager(accounts[7], true, {from: accounts[6]}),
        iot.voteAddManager(accounts[8], true, {from: accounts[6]}),
        iot.voteAddManager(accounts[8], true, {from: accounts[7]}),
        iot.voteAddManager(accounts[9], false, {from: accounts[6]}),
        iot.voteAddManager(accounts[9], false, {from: accounts[7]}),
        iot.voteAddManager(accounts[9], false, {from: accounts[8]}),
        delay(1000)
    ]);
}

/**
 * register a device on the blockchain
 */
registerDevice = function(account) {
    console.log("register device account number: "+account);
    return new Promise((resolve, reject) => {
        iot.registerDevice({from: account})
    });
}

/**
 * register multiples devices
 */
registerDevices = function() {
    Promise.all([
        registerDevice(accounts[2]),
        registerDevice(accounts[3]),
        registerDevice(accounts[4]),
        registerDevice(accounts[5]),
        delay(1000)
    ])
    .then((result) => {
        return result;
    }).catch(err => reject(err));
}

/**
 * ask access to a device's log via the blockchain
 */
askAccess = function(user, time, fromAddress) {
    return new Promise((resolve, reject) => {
        iot.askAccess(user, time, {from: fromAddress});
    });
}

/**
 * ask multiples access
 */
askAccesses = function() {
    console.log("askAccesses");
    Promise.all([
        askAccess(accounts[1], 60, accounts[6]),
        askAccess(accounts[2], 60, accounts[6]),
        askAccess(accounts[3], 60, accounts[6]),
        askAccess(accounts[4], 60, accounts[6]),
        askAccess(accounts[5], 60, accounts[6]),
        askAccess(accounts[1], 80, accounts[7]),
        askAccess(accounts[2], 80, accounts[7]),
        askAccess(accounts[3], 80, accounts[7]),
        askAccess(accounts[4], 80, accounts[7]),
        askAccess(accounts[5], 80, accounts[7]),
        askAccess(accounts[1], 100, accounts[8]),
        askAccess(accounts[2], 100, accounts[8]),
        askAccess(accounts[3], 100, accounts[8]),
        askAccess(accounts[4], 100, accounts[8]),
        askAccess(accounts[5], 100, accounts[8]),
        delay(1000)
    ])
    .then((result) => {
        resolve(result);
    }).catch(err => reject(err));
}

/**
 * generate random boolean
 */
function randomBool() {
    return Math.random() >= 0.5;
}

/**
 * All managers vote randomly to allow or not access to a device
 */
voteAccess = function() {
    for (var i = 6; i < 9; i++) {
        for (var j = 6; j < 9; j++) {
            for (var k = 1; k < 6; k++) {
                var vote = randomBool();
                iot.voteAccess(accounts[k], accounts[j], vote, {from: accounts[i]});
            }
        }
    }
    console.log("vote access finished");
}

/**
 * check who has access to a device
 */
getAccess = function() {
    var deviceAccess;
    for (var j = 6; j < 9; j++) {
        for (var k = 1; k < 6; k++) {
            const lJ = j;
            const lK = k;
            iot.hasAccess.call(accounts[k], accounts[j], {from: accounts[0]})
                .then((result) => {
                    console.log("account "+lJ+ " has access to device "+lK+" ? :"+result);
                }).catch(err => {
                    console.log("error get access");
                    console.log(err);
                })
        }
    }
}





web3.eth.getAccountsPromise().then((result) => {
    accounts = result;
    assert(accounts.length === 10, "Ganache should be started with 10 accounts");
    console.log("accounts: ")
    console.log(accounts);
    IotAuth.web3.eth.getGasPrice((error, result) => {
        console.log('estimated gas price'+result);
    });
    console.log('estimated gas price: '+ result);
    return IotAuth.deployed();
}).then((instance) => {
    console.log("IotAuth deployed");
    iot = instance;
    iot.registerDevice({from: accounts[1]});
    return iot.getDevice.call(0, {from: accounts[1]});
}).then((result) => {
    console.assert(result === accounts[1], "account 1 creation failed");
    iot.registerDevice({from: accounts[1]});
    return iot.getDevice.call(1, {from: accounts[1]});
}).then((result) => {
    console.log("testing creating twice the same account");
    console.assert(result !== accounts[1], "registred twice account 1");
    return registerDevices();
}).then((result) => {
    console.log(result);
    console.log("registered devices...");
    return iot.getDevices.call({from: accounts[1]});
}).then((result) => {
    console.log("registred Devices: ");
    console.log(result);
    return iot.addManager(accounts[6], {from: accounts[6]});
}).then(() => {
    console.log("checking if acc[6] registered itself");
    return iot.isManager.call(accounts[6], {from: accounts[6]});
}).then((result) => {
    console.log("adding the rest of managers");
    console.log(result);
    console.assert(result === true, "manager accounts[6] didn't register itself");
    return addManagers();
}).then(() => {
    return iot.getNbrOfManager({from: accounts[6]});
}).then((result) => {
    assert.equal(result, 1, "only one manager should be there");
    return voteManagers();   
}).then(() => {
    return iot.getNbrOfManager.call({from: accounts[6]});
}).then((result) => {
    console.log('nbr of managers after vote: ' + result);
    assert(result <= 3, "nbr of managers should'nt be higher than 3");
    for (var i = 0; i < ITER; i++) {
        askAccesses()
        delay(2000)
        .then(() => {
            voteAccess();
        }).then(() => {
            delay(2000)
        }).then(() => {
            getAccess();
        }).then(() => {
            for (var j = 0; j < timelapiter; j++) {
                // setTimeout(() => iot.refreshTime({from: accounts[0]}),1000)
                delay(1000)
                    .then(()=>iot.refreshTime({from: accounts[0]}));
            }
        })
        console.log("iter number: "+i);
    }
}).catch((e) => {
    console.log("error");
    console.log(e);
});
