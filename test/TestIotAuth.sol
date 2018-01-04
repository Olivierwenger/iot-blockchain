pragma solidity ^0.4.2;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/IotAuth.sol";

contract TestIotAuth {
    IotAuth iotAuth = IotAuth(DeployedAddresses.IotAuth());

    // Testing the adopt() function
    function testUserCanRegisterHimself() public {
        bool worked = iotAuth.registerDevice();
        assert(worked);
    

        // Assert.equal(returnedId, expected, "Adoption of the pet ID 8 should be recorded");
    }

    // // Testing retrieval of a single pet's owner
    // function testGetAdopterAddressByPetid() public {
    //     // Expected owner is this contract
    //     address expected = this;

    //     address adopter = adoption.adopters(8);

    //     Assert.equal(adopter, expected, "Owner of pet ID 8 should be recorded");
    // }

    // // Testing retrieval of all pet owners
    // function testGetAdopterAddressByPetIdInArray() public {

    //     // Expected owner is this contract
    //     address expected =this;

    //     // Store adopters in memory rather than contract's storage
    //     address[16] memory adopters = adoption.getAdopters();

    //     Assert.equal(adopters[8], expected, "Owner of the pet Id 8 should be recorded.");
    // }
    
}