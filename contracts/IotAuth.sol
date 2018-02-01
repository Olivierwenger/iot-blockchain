pragma solidity ^0.4.2;

import "./IterableAccess.sol";


contract IotAuth {
    mapping(address => address) managers; //store the address of the managers
    address[16] public devices; //array with address of devices
    mapping(address => VoteAddManager) public voteAddManagerM; //ongoing votes to add managers
    mapping(uint => VoteAccess) public voteAccessM; // ongoing votes to access devices' logs
    mapping(address => UserList) vaKey; // vaKey[device].user[user] give back the key
    uint nbrManagers = 0;
    uint nbrDevice = 0;
    uint nbrVoteAccess = 0;
    IterableAccess.itmap access; // store all teh actual access with the remaining time

    struct UserList {
        mapping(address => uint) keyIndex;
    }

    
    struct VoteAccess {    
        address device;     // the device the person want access
        address user;       // the person wanting access to log
        uint accessTime;    // access wanted in minutes
        uint yesVote;       // nbr of people that voted "yes"
        uint noVote;        // nbr of people that voted "no"
    }

    struct VoteAddManager {
        address manager;    // the user that want to become manager
        uint yesVote;       // the amount of votes in favor
        uint noVote;        // the amount of votes against
        bool contains;      // the vote is still ongoing
    }
    
    // add a vote for a new manager
    function addManager(address user) public returns (bool worked) {
        if (voteAddManagerM[user].contains) {
            return false;
        }
        if (nbrManagers == 0) {
            managers[user] = user;
            nbrManagers++;
            return true;
        }
        voteAddManagerM[user] = VoteAddManager(user, 0, 0, true);
        return true;
    }

    // vote on an ongoing vote to add a new manager
    function voteAddManager(address user, bool yesVote) public returns (bool worked) {
        if (!voteAddManagerM[user].contains) {
            return false;
        }
        // check if msg.sender can vote
        if (managers[msg.sender] != msg.sender) {
            return false;
        }
        if (yesVote) {
            voteAddManagerM[user].yesVote++;
        } else {
            voteAddManagerM[user].noVote++;
        }
        if (voteAddManagerM[user].yesVote >= (nbrManagers/2)) {
            delete voteAddManagerM[user];
            managers[user] = user;
            nbrManagers++;
        } else if (voteAddManagerM[user].noVote >= (nbrManagers/2)) {
            delete voteAddManagerM[user];
        }
        return true;
    }

    // the caller register himself as a new device
    function registerDevice() public returns (bool worked) {
        for (uint index = 0; index < devices.length; index++) {
            if (msg.sender == devices[index]) {
                return false;
            }
        }
        devices[nbrDevice++] = msg.sender;
        return true;
    }

    // the user ask access to a listed device
    function askAccess(address device, uint accesTime) public returns (bool worked) {
        uint key = vaKey[device].keyIndex[msg.sender];
        if (key > 0) {  // this user already asked for this device
            return false;
        }
        key = ++nbrVoteAccess;
        vaKey[device].keyIndex[msg.sender] = key;
        voteAccessM[key] = VoteAccess(device, msg.sender, accesTime, 0, 0);
        return true;
        
    }

    // the manager vote on an ongoing vote to give access to a device
    function voteAccess(address device, address user, bool yesVote) public returns (bool worked) {
        uint keyIndex = vaKey[device].keyIndex[user];
        if (keyIndex == 0) { //this vote doesn't exist
            return false;
        }
        if (managers[msg.sender] != msg.sender) { //this user is not allowed to vote
            return false;
        }
        VoteAccess storage newVote = voteAccessM[keyIndex];
        if (yesVote) {
            newVote.yesVote++;
        } else {
            newVote.noVote++;
        }
        if (newVote.yesVote >= (nbrManagers/2)) {
            IterableAccess.insert(access, device, user, newVote.accessTime);
            delete voteAccessM[keyIndex];
            vaKey[device].keyIndex[user] = 0;
        } else if (newVote.noVote >= (nbrManagers/2)) {
            delete voteAccessM[keyIndex];
            vaKey[device].keyIndex[user] = 0;
        } else {
            voteAccessM[keyIndex] = newVote;
        }
        return true;
    }

    // return true if the user is a manager
    function isManager(address user) public view returns (bool) {
        return (managers[user] == user);
    }

    // return the number of managers on this contract
    function getNbrOfManager() public view returns (uint) {
        return nbrManagers;
    }

    // return the list of devices
    function getDevices() public view returns (address[16]) {
        return devices;
    }

    // return the device at the given index
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

    // return true if the user has access to the device
    function hasAccess(address device, address user) public view returns (bool) {
        return IterableAccess.contains(access, device, user);
    }
}