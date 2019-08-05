pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract CoToken is IERC20, Ownable {
    using SafeMath for uint256;

    uint256 _totalSupply;
    string _name;
    string _symbol;
    uint8 _decimals;
    address public _owner;

    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) approvedTransfers;

    constructor(uint256 totalSupply, string memory name, string memory symbol, uint8 decimals) public {
        _totalSupply = totalSupply;
        balances[msg.sender] = totalSupply;
        _name = name;
        _symbol = symbol;
        _decimals = decimals;
        _owner = msg.sender;
    }
    
    function name() public view returns (string memory){
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function decimals() public view returns (uint8) {
        return _decimals;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256){
        return balances[account];
    }

    function transfer(address recipient, uint256 amount) external returns (bool){
        if (balances[msg.sender] >= amount) {
            balances[msg.sender] -= amount;
            balances[recipient] += amount;
            return true;
        }
        else {
            return false;
        }
    }

    function approve(address spender, uint256 amount) external returns (bool){
        if (balances[msg.sender] > amount) {
            approvedTransfers[msg.sender][spender] = amount;
            return true;
        }
        else {
            return false;
        }
    }

    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool){
        if (approvedTransfers[sender][recipient] >= amount) {
            if (balances[sender] >= amount) {
                balances[sender] -= amount;
                balances[recipient] += amount;
                approvedTransfers[sender][recipient] -= amount;
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }

    function allowance(address owner, address spender) external view returns (uint256){
        return approvedTransfers[owner][spender];
    }

    /// @param _n number of tokens wanting to be purchased
    function buyPrice(uint256 _n) public view returns (uint256) {
        uint256 _supply = totalSupply() - 1;
        // if there are n tokens in issue, the price for the (n+1)th token is 0.01n+0.2 eth
        uint256 _totalPrice = 0.2*10**18 wei;
        for (uint i = 1; i < _n+1; i++) {
            _totalPrice += 0.01*(10**18)*(_supply+i);
        }
        return _totalPrice;
    }

    function sellPrice(uint256 _n) public view returns (uint256) {
        uint256 _newSupply = totalSupply() - _n - 1;
        uint256 _totalPrice = 0.2*10**18 wei;
        for (uint i = 1; i < _n+1; i++) {
            _totalPrice += 0.01*(10**18)*(_newSupply+i);
        }
        return _totalPrice;
    }

    function mint(uint256 _n) public payable {
        uint256 _price = buyPrice(_n);
        require(msg.value == _price, "Incorrect value sent");
        require(msg.sender != address(0), "ERC20: mint to the zero address");

        _totalSupply = _totalSupply.add(_n);
        balances[msg.sender] = balances[msg.sender].add(_n);
        emit Transfer(address(0), msg.sender, _n);    }

    function burn(uint256 _n) public {
        // uint256 _price = sellPrice(_n);
        require(msg.sender == _owner, "only the registry owner can burn tokens");
        require(balances[msg.sender] >= _n, "cannot burn more tokens than owned");
        _totalSupply = _totalSupply.sub(_n);
        balances[msg.sender] = balances[msg.sender].sub(_n);

        emit Transfer(msg.sender, address(0), _n);
    }

    function destroy() public {
        require(msg.sender == _owner, "Only the registry owner can destroy the contract");
        require(balances[msg.sender] == totalSupply(), "All CO tokens must belong to the registry owner");
        selfdestruct(address(0));
    }

}