pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/IotAuth.sol";

contract TestIotAuth {
    IotAuth iotAuth = IotAuth(DeployedAddresses.IotAuth());

    // Testing the register() function
    function testUserCanRegisterHimself() public {
        bool worked = iotAuth.registerDevice();
        assert(worked);
    }


    
}