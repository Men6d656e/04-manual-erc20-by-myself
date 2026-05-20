// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ManualToken} from "../src/ManualToken.sol";
import {DeployManualToken} from "../script/DeployManualToken.s.sol";

contract ManualTokenTest is Test {
    ManualToken public token;
    
    address public deployer;
    address public user1 = makeAddr("user1");
    address public user2 = makeAddr("user2");

    function setUp() public {
        deployer = address(this);
        token = new ManualToken("ManualToken", "MTK", 1000000);
    }

    function testInitialization() public view {
        assertEq(token.name(), "ManualToken");
        assertEq(token.symbol(), "MTK");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 1000000 * 10**18);
        assertEq(token.balanceOf(deployer), 1000000 * 10**18);
    }

    function testTransferSuccess() public {
        uint256 transferAmount = 100 * 10**18;
        
        token.transfer(user1, transferAmount);
        
        assertEq(token.balanceOf(user1), transferAmount);
        assertEq(token.balanceOf(deployer), token.totalSupply() - transferAmount);
    }

    function testTransferFailInsufficientBalance() public {
        uint256 transferAmount = 1000001 * 10**18; // More than total supply
        
        vm.expectRevert("ERC20: Transfer amount exceeds balance");
        token.transfer(user1, transferAmount);
    }

    function testApproveAndTransferFrom() public {
        uint256 transferAmount = 50 * 10**18;
        
        // deployer approves user1 to spend tokens
        token.approve(user1, transferAmount);
        assertEq(token.allowance(deployer, user1), transferAmount);
        
        // user1 transfers from deployer to user2
        vm.prank(user1);
        token.transferFrom(deployer, user2, transferAmount);
        
        assertEq(token.balanceOf(user2), transferAmount);
        assertEq(token.allowance(deployer, user1), 0);
    }

    function testTransferFromFailInsufficientAllowance() public {
        uint256 transferAmount = 50 * 10**18;
        
        // deployer approves user1 to spend half the transfer amount
        token.approve(user1, transferAmount / 2);
        
        vm.prank(user1);
        vm.expectRevert("ERC20: insufficient allowance");
        token.transferFrom(deployer, user2, transferAmount);
    }
}
