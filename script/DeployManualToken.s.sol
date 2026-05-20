// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ManualToken} from "../src/ManualToken.sol";

contract DeployManualToken is Script {
    function run() external returns (ManualToken) {
        uint256 deployerPrivateKey = uint256(vm.envUint("PRIVATE_KEY"));
        vm.startBroadcast(deployerPrivateKey);

        ManualToken token = new ManualToken("ManualToken", "MTK", 1000000);

        vm.stopBroadcast();

        console.log("ManualToken deployed to:", address(token));

        return token;
    }
}
