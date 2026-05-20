// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ManualToken
 * @dev A fully manual implementation of the ERC-20 token standard without using external libraries.
 */
contract ManualToken {
    // State variables
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /**
     * @dev Initializes the contract with the given name, symbol, and initial supply.
     * @param _name The name of the token
     * @param _symbol The symbol of the token
     * @param _initialSupply The initial supply of tokens (in whole uints, will be multiplied by 10**decimals.
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /**
     * @dev Transfers tokens to a specified address.
     * @param _to The address to transfer to.
     * @param _value The amount to be transferred.
     * @return success A boolean that indicates if the operation was successful.
     */
    function transfer(address _to, uint256 _value) returns (bool success) {
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(
            balanceOf[msg.sender] >= _value,
            "ERC20: Transfer amount exceeds balance"
        );

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    /**
     * @dev Approves the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     * @return success A boolean that indicates if the operation was successfull.
     */
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(_spender != address(0), "ERC20: approve to the zero address");

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    /**
     * @dev Transfors tokens from one address to another using an allowance.
     * @param _from The address which you want to send tokens from.
     * @param _to The address which you want to transfer to.
     * @param _value The amount of tokens to be transferred.
     * @return success A boolean that indicates if the operation was successful.
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_from != address(0), "ERC20: transfer from the zero address");
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(
            balanceOf[_from] >= _value,
            "ERC20: transfer amount exceeds balance"
        );
        require(
            allowance[_from][msg.sender] >= _value,
            "ERC20: insufficient allowance"
        );

    }
}
