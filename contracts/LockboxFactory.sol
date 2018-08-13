pragma solidity ^0.4.24;

contract LockboxFactory {
  event ExpiredSharedSecret(uint valid_until);

  struct Lockbox {
    string shared_secret;
    uint64 valid_until;
  }

  Lockbox[] public lockboxes;
  uint validity_period = 2 days;
  mapping ( address => uint256 ) address_to_lockbox_id;

  function assign_shared_secret(string _shared_secret) external {
    uint256 id = lockboxes.push(Lockbox(_shared_secret, uint64(now + validity_period)));

    address_to_lockbox_id[msg.sender] = id - 1;
  }

  function get_shared_secret(address _address) external returns(string) {
    uint256 id = address_to_lockbox_id[_address];
    if (lockboxes[id].valid_until < now) {
      emit ExpiredSharedSecret(lockboxes[id].valid_until);
      return 'INVALID';
    }

    return lockboxes[id].shared_secret;
  }

  function get_validity_period(address _address) external view returns(uint64) {
    return lockboxes[address_to_lockbox_id[_address]].valid_until;
  }
}