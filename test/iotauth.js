var IotAuth = artifacts.require("./IotAuth.sol");
const crypto = require('crypto');
// var account0 = "0x627306090abaB3A6e1400e9345bC60c78a8BEf57";
// var account1 = '0xf17f52151EbEF6C7334FAD080c5704D77216b732';
// var account2 = "0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef";
// var account3 = "0x821aEa9a577a9b44299B9c15c88cf3087F3b5544";
// var account4 = "0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2";
// var account5 = "0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e";
// var account6 = "0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5";
// var account7 = "0x0F4F2Ac550A1b4e2280d04c21cEa7EBD822934b5";
// var account8 = "0x6330A553Fc93768F612722BB8c2eC78aC90B3bbc";
// var account9 = "0x5AEDA56215b167893e80B4fE645BA6d5Bab767DE";

var iot;
const ITER=3; // number of time user should request access
const timelap=10000;
const timelapiter = 11;
// contract('IotAuth', function() {
//     it("should register account 1 only one time", function() {
//         return IotAuth.deployed().then(function(instance) {
//             iot = instance;
//             return iot.registerDevice({from: account1});
//         }).then(function(result) {
//             assert.equal(result, true, "register account 1 succesful");
//         });
//     });
// });
var accounts;
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

addManager = function(user, manager) {
    return new Promise((resolve, reject) => {
        iot.addManager(user, {from: manager})
    })
}

addManagers = function() {
    Promise.all([
        addManager(accounts[7], accounts[6]),
        addManager(accounts[8], accounts[6]),
        addManager(accounts[9], accounts[6]),
    ]).then(result =>  resolve(result))
    .catch(err => reject(err))
}

voteManagers = function() {
    return Promise.all([
        iot.voteAddManager(accounts[7], true, {from: accounts[6]}),
        iot.voteAddManager(accounts[8], true, {from: accounts[6]}),
        iot.voteAddManager(accounts[8], true, {from: accounts[7]}),
        iot.voteAddManager(accounts[9], false, {from: accounts[6]}),
        iot.voteAddManager(accounts[9], false, {from: accounts[7]}),
        iot.voteAddManager(accounts[9], false, {from: accounts[8]}),
    ]);
}

registerDevice = function(account) {
    console.log("register device account number: "+account);
    return new Promise((resolve, reject) => {
        iot.registerDevice({from: account})
    });
}

registerDevices = function() {
    Promise.all([
        registerDevice(accounts[2]),
        registerDevice(accounts[3]),
        registerDevice(accounts[4]),
        registerDevice(accounts[5])
    ])
    .then((result) => {
        return result;
    }).catch(err => reject(err));
}
askAccess = function(user, time, fromAddress) {
    console.log("askaccess");
    return new Promise((resolve, reject) => {
        iot.askAccess(user, time, {from: fromAddress});
    });
}

askAccesses = function() {
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
        askAccess(accounts[5], 100, accounts[8])
    ])
    .then((result) => {
        resolve(result);
    }).catch(err => reject(err));
}
function randomBool() {
    return Math.random() >= 0.5;
}

voteAccess = function() {
    //return new Promise((resolve, reject) => {
        for (var i = 6; i < 9; i++) {
            for (var j = 6; j < 9; j++) {
                for (var k = 1; k < 6; k++) {
                    console.log("vote access i j k"+i+j+k);
                    var vote = randomBool();
                    console.log(vote);
                    iot.voteAccess(accounts[k], accounts[j], vote, {from: accounts[i]});
                }
            }
        }
        console.log("vote access finished");
    //})
}

getAccess = function() {
    // return new Promise((resolve, reject) => {
        console.log("getAccess");
        var deviceAccess;
        for (var j = 6; j < 9; j++) {
            for (var k = 1; k < 6; k++) {
                console.log("in the loop j k: "+j+k);
                iot.hasAccess.call(accounts[k], accounts[j], {from: accounts[0]})
                    .then((result) => {
                        console.log("account "+j+ "has access to device "+k+" ? :"+result);
                    }).catch(err => {
                        console.log("error get access");
                        console.log(err);
                    })
            }
        }
    // })
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
        // askAccesses().then(() => {
        askAccesses()
            console.log("access asked");
            voteAccess();
            // voteAccess().then(() => {
                console.log("access voted");
               getAccess();
            // })
            // var timer = 0;
            // let timerId = setInterval(() => iot.refreshTime({from: accounts[0]}), timelap);
            // setTimeout(() => clearInterval(timerId), timelapiter*timelap);
            for (var j = 0; j < timelapiter; j++) {
                console.log("refresh time")
                iot.refreshTime({from: accounts[0]});
                console.log("finished 0")
            }
            console.log("finished refresh time1")
        // })
        // .catch((e) => {
        //     console.log("error");
        //     console.log(e)
        // })
        console.log("finished refresh time2")
    }
}).catch((e) => {
    console.log("error");
    console.log(e);
});


//     return iot.registerDevice({from: account1});
// }).then(function(result) {
//     assert.equal(result, true, 'Registred account 1 succesful');
// }).catch(function(e) {

// });


// contract('IotAuth', function(accounts) {
//     it("should register account 1 as device", function() {
//         assert.equal(IotAuth.deployed(), true, "IotAuth is deployed");
//     });
// });