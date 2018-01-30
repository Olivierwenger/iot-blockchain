pragma solidity ^0.4.2;

// This library allow us to iterate over the actual given access
library IterableAccess {
    struct Access {
        address user;
        DeviceAccess deviceAccess;
    }
    
    struct DeviceAccess {
        address device;
        uint remainingTime;
    }

    struct itmap {
        mapping(address => UserIndex) data;
        KeyFlag[] keys;
        uint size;
    }

    struct UserIndex {
        mapping(address => IndexValue) data;
    }
    
    struct IndexValue {
        uint keyIndex;
        Access value;
    }

    // use to know if the element is deleted
    struct KeyFlag {
        address[2] key; // key={device, user}
        bool deleted;
    }



    
    function insert(itmap storage self, address device, address user, uint accessTime) public returns (bool replaced) {
        address[2] memory key = [device, user];
        uint keyIndex = self.data[device].data[user].keyIndex;
        self.data[device].data[user].value = Access(user, DeviceAccess(device, accessTime));
        if (keyIndex > 0) {
            return true;
        } else {
            keyIndex = self.keys.length++;
            self.data[device].data[user].keyIndex = keyIndex + 1;
            self.keys[keyIndex].key = key;
            self.size++;
            return false;
        }
    }

    function decrement(itmap storage self, uint keyIndex) public returns (bool) {
        var key = self.keys[keyIndex].key;
        var value = self.data[key[0]].data[key[1]].value;
        var newTime = value.deviceAccess.remainingTime -= 10;
        if (newTime <= 0) {
            remove(self, key[0], key[1]);
        }
        return true;
    }


    function remove (itmap storage self, address device, address user) private returns (bool success) {
        uint keyIndex = self.data[device].data[user].keyIndex;
        if (keyIndex == 0) {
            return false;
        }
        delete self.data[device].data[user];
        self.keys[keyIndex - 1].deleted = true;
        self.size--;
    }

    function contains (itmap storage self, address device, address user) public view returns (bool) {
        uint keyIndex = self.data[device].data[user].keyIndex;
        if (keyIndex > 0) {
            return true;
        } else {
            return false;
        }
    }

    function iterate_start (itmap storage self) public view returns (uint keyIndex) {
        return iterate_next(self, uint(-1));
    }

    function iterate_valid (itmap storage self, uint keyIndex) public view returns (bool) {
        return keyIndex < self.keys.length;
    }

    function iterate_next (itmap storage self, uint keyIndex) public view returns (uint r_keyIndex) {
        keyIndex++;
        while (keyIndex < self.keys.length && self.keys[keyIndex].deleted) {
            keyIndex++;
        }
        return keyIndex;
    }

    function get (itmap storage self, address device, address user) private view returns (Access value) {
        return self.data[device].data[user].value;
    }


    function iterate_get(itmap storage self, uint keyIndex) private view returns (address[2] key, Access value) {
        key = self.keys[keyIndex].key;
        value = self.data[key[0]].data[key[1]].value;
    }
}