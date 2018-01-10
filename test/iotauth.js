var IotAuth = artifacts.require("./IotAuth.sol");
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

addManagers = function() {
    return Promise.all([
        iot.addManager(accounts[7], {from: accounts[6]}),
        iot.addManager(accounts[8], {from: accounts[6]}),
        iot.addManager(accounts[9], {from: accounts[6]}),
    ]);
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

registerDevices = function() {
    return Promise.all([
        iot.registerDevice({from: accounts[2]}),
        iot.registerDevice({from: accounts[3]}),
        iot.registerDevice({from: accounts[4]}),
        iot.registerDevice({from: accounts[5]})
    ]);
}

askAccess = function() {
    return Promise.all([
        iot.askAccess(accounts[1], 60, {from: accounts[6]}),
        iot.askAccess(accounts[2], 60, {from: accounts[6]}),
        iot.askAccess(accounts[3], 60, {from: accounts[6]}),
        iot.askAccess(accounts[4], 60, {from: accounts[6]}),
        iot.askAccess(accounts[5], 60, {from: accounts[6]}),
        iot.askAccess(accounts[1], 80, {from: accounts[7]}),
        iot.askAccess(accounts[2], 80, {from: accounts[7]}),
        iot.askAccess(accounts[3], 80, {from: accounts[7]}),
        iot.askAccess(accounts[4], 80, {from: accounts[7]}),
        iot.askAccess(accounts[5], 80, {from: accounts[7]}),
        iot.askAccess(accounts[1], 100, {from: accounts[8]}),
        iot.askAccess(accounts[2], 100, {from: accounts[8]}),
        iot.askAccess(accounts[3], 100, {from: accounts[8]}),
        iot.askAccess(accounts[4], 100, {from: accounts[8]}),
        iot.askAccess(accounts[5], 100, {from: accounts[8]})
    ])
}
function randomBool() {
    var a = new Uint8Array(1);
    crypto.getRandomValues(a);
    return a[0] > 127;
}

voteAccess = function() {
    return new Promise((resolve, reject) => {
        for (var i = 6; i < 9; i++) {
            for (var j = 6; j < 9; j++) {
                for (var k = 1; j < 6; j++) {
                    iot.voteAccess(accounts[k], accounts[j], randomBool(), {from: accounts[i]});
                }
            }
            
        }
    })
}

getAccess = function() {
    
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
}).then(() => {
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
        askAccess().then(() => {
            console.log("access asked");
            voteAccess().then(() => {
                getAccess();
            })
            // var timer = 0;
            // let timerId = setInterval(() => iot.refreshTime({from: accounts[0]}), timelap);
            // setTimeout(() => clearInterval(timerId), timelapiter*timelap);
            for (var j = 0; j < timelapiter; j++) {
                iot.refreshTime({from: accounts[0]});
            }
        })
    }
}).catch((e) => {
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