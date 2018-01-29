pragma solidity ^0.4.2;

import "./IterableAccess.sol";


contract IotAuth {
    mapping(address => uint) userKey;
    mapping(address => address) users;
    address[16] public devices;
    bool[16][16] authorisedUsers;
    mapping(address => VoteAddManager) public voteAddManager;
    mapping(uint => VoteAccess) public voteAccessM;
    mapping(address => UserList) vaKey; // vaKey[device].user[user] give back the key
    uint nbrUser = 0;
    uint nbrDevice = 0;
    uint nbrVoteAccess = 0;

    //event RegisterWorked();

    struct UserList {
        mapping(address => uint) keyIndex;
    }
    IterableAccess.itmap access;
    
    struct VoteAccess {    
        address device;     // the device the person want access
        address user;       // the person wanting access to log
        uint accessTime;    // access wanted in minutes
        uint yesVote;       // nbr of people that voted "yes"
        uint noVote;        // nbr of people that voted "no"
    }

    struct VoteAddManager {
        address manager;
        uint yesVote;
        uint noVote;
        bool contains;
    }

    struct VoteRemoveManager {
        address manager;
        int yesVote;
        uint noVote;
    }
    
    function addManager(address user) public returns (bool worked) {
        if (voteAddManager[user].contains) {
            return false;
        }
        if (nbrUser == 0) {
            users[user] = user;
            nbrUser++;
            return true;
        }
        voteAddManager[user] = VoteAddManager(user, 0, 0, true);
        return true;
    }

    function voteAddManager(address user, bool yesVote) public returns (bool worked) {
        if (!voteAddManager[user].contains) {
            return false;
        }
        // check if msg.sender can vote
        if (users[msg.sender] != msg.sender) {
            return false;
        }
        if (yesVote) {
            voteAddManager[user].yesVote++;
        } else {
            voteAddManager[user].noVote++;
        }
        if (voteAddManager[user].yesVote >= (nbrUser/2)) {
            delete voteAddManager[user];
            users[user] = user;
            nbrUser++;
            // userKey[user] = ++nbrUser;
            // users[nbrUser] = user;
        } else if (voteAddManager[user].noVote >= (nbrUser/2)) {
            delete voteAddManager[user];
        }
        return true;
    }

    // function removeManager(address user) public returns (bool worked) {
    //     if (!voteRemoveManager.contains(user)) {
    //         return false;
    //     }
    //     voteRemoveManager[user] = VoteRemoveManager(user, 0, 0);
    //     return true;
    // }

    // function voteRemoveManager(address user, bool yesVote) public returns (bool worked) {
    //     if (!voteRemoveManager.contains(user)) {
    //         return false;
    //     }
    //     if (yesVote) {
    //         voteRemoveManager[user].yesVote++;
    //     } else {
    //         voteRemoveManager[user].noVote++;
    //     }
    //     if (voteRemoveManager[user].yesVote >= (nbrManager/2)) {
    //         delete voteRemoveManager[user];
    //         delete manager[user];
    //     } else if (voteRemoveManager[user].noVote >= (nbrManager/2)) {
    //         delete voteRemoveManager[user];
    //     }
    //     return true;
    // }

    function registerDevice() public returns (bool worked) {
        for (uint index = 0; index < devices.length; index++) {
            if (msg.sender == devices[index]) {
                return false;
            }
        }
        devices[nbrDevice++] = msg.sender;
        return true;
    }

    function askAccess(address device, uint accesTime) public returns (bool worked) {
        uint key = vaKey[device].keyIndex[msg.sender];
        if (key > 0) {  // this user already asked for this device
            return false;
        }
        key = ++nbrVoteAccess;
        vaKey[device].keyIndex[msg.sender] = key;
        voteAccessM[key] = VoteAccess(device, msg.sender, accesTime, 0, 0);
        // self.data[key].keyIndex = keyIndex + 1;
        // self.keys[keyIndex].key = key;
        // self.size++;
        //RegisterWorked();
        return true;
        
    }

    function voteAccess(address device, address user, bool yesVote) public returns (bool worked) {
        uint keyIndex = vaKey[device].keyIndex[user];
        if (keyIndex == 0) { //this vote doesn't exist
            return false;
        }
        if (users[msg.sender] != msg.sender) { //this user is not allowed to vote
            return false;
        }
        VoteAccess storage newVote = voteAccessM[keyIndex];
        if (yesVote) {
            newVote.yesVote++;
        } else {
            newVote.noVote++;
        }
        if (newVote.yesVote >= (nbrUser/2)) {
            IterableAccess.insert(access, device, user, newVote.accessTime);
            delete voteAccessM[keyIndex];
            vaKey[device].keyIndex[user] = 0;
        } else if (newVote.noVote >= (nbrUser/2)) {
            delete voteAccessM[keyIndex];
            vaKey[device].keyIndex[user] = 0;
        } else {
            voteAccessM[keyIndex] = newVote;
        }
        return true;
        // if (worked) {
        //     VoteAccess voteAccesVal = IterableVoteAccess.get(voteAcces, key);
        //     if (voteAccesVal.yesVote >= (nbrManager/2)) {
        //         IterableAccess.insert(access, key, voteAccesVal.ac);
        //         IterableVoteAcces.remove(voteAcces, key);
        //     } else if (voteAccesVal.noVote >= (nbrManager/2)) {
        //         IterableVoteAcces.remove(voteAcces, key);
        //     }
        // }
    }

    // function getManagers() public view returns (address[16]) {
    //     return users;
    // }

    function isManager(address user) public view returns (bool) {
        return (users[user] == user);
    }

    function getNbrOfManager() public view returns (uint) {
        return nbrUser;
    }

    function getDevices() public view returns (address[16]) {
        return devices;
    }

    function getDevice(uint index) public view returns (address) {
        return devices[index];
    }

    // decrement all remaining time from 10
    function refreshTime() public {
        for (var i = IterableAccess.iterate_start(access); 
        IterableAccess.iterate_valid(access, i); 
        i = IterableAccess.iterate_next(access, i)) {
            IterableAccess.decrement(access, i);
        }
    }    

    function hasAccess(address device, address user) public view returns (bool) {
        return IterableAccess.contains(access, device, user);
    }
}