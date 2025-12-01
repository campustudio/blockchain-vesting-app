// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenVesting
 * @dev A token vesting contract that releases tokens gradually over time with cliff period support
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct VestingSchedule {
        address beneficiary;
        address token;
        uint256 totalAmount;
        uint256 released;
        uint256 startTime;
        uint256 cliff;
        uint256 duration;
        bool revocable;
        bool revoked;
    }

    // Mapping from vesting ID to VestingSchedule
    mapping(bytes32 => VestingSchedule) public vestingSchedules;
    
    // Mapping from beneficiary to their vesting IDs
    mapping(address => bytes32[]) public beneficiarySchedules;
    
    // Total vesting schedules count
    uint256 public vestingSchedulesCount;

    // Events
    event VestingScheduleCreated(
        bytes32 indexed vestingId,
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliff,
        uint256 duration
    );

    event TokensReleased(
        bytes32 indexed vestingId,
        address indexed beneficiary,
        uint256 amount
    );

    event VestingRevoked(bytes32 indexed vestingId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new vesting schedule
     * @param _beneficiary Address of the beneficiary
     * @param _token Address of the ERC20 token
     * @param _amount Total amount of tokens to vest
     * @param _startTime Start time of vesting
     * @param _cliff Cliff period in seconds
     * @param _duration Total vesting duration in seconds
     * @param _revocable Whether the vesting is revocable
     */
    function createVestingSchedule(
        address _beneficiary,
        address _token,
        uint256 _amount,
        uint256 _startTime,
        uint256 _cliff,
        uint256 _duration,
        bool _revocable
    ) external onlyOwner {
        require(_beneficiary != address(0), "Beneficiary cannot be zero address");
        require(_amount > 0, "Amount must be greater than 0");
        require(_duration > 0, "Duration must be greater than 0");
        require(_cliff <= _duration, "Cliff must be less than or equal to duration");

        // Generate unique vesting ID
        bytes32 vestingId = keccak256(
            abi.encodePacked(_beneficiary, _token, _amount, _startTime, vestingSchedulesCount)
        );

        // Transfer tokens to this contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        // Create vesting schedule
        vestingSchedules[vestingId] = VestingSchedule({
            beneficiary: _beneficiary,
            token: _token,
            totalAmount: _amount,
            released: 0,
            startTime: _startTime,
            cliff: _cliff,
            duration: _duration,
            revocable: _revocable,
            revoked: false
        });

        // Add to beneficiary's schedules
        beneficiarySchedules[_beneficiary].push(vestingId);
        vestingSchedulesCount++;

        emit VestingScheduleCreated(
            vestingId,
            _beneficiary,
            _amount,
            _startTime,
            _cliff,
            _duration
        );
    }

    /**
     * @dev Calculates the vested amount for a vesting schedule
     * @param vestingId The vesting schedule ID
     * @return The vested amount
     */
    function computeReleasableAmount(bytes32 vestingId) public view returns (uint256) {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        
        if (schedule.revoked) {
            return 0;
        }

        return _computeReleasableAmount(schedule);
    }

    /**
     * @dev Internal function to compute releasable amount
     */
    function _computeReleasableAmount(VestingSchedule memory schedule) 
        internal 
        view 
        returns (uint256) 
    {
        uint256 currentTime = block.timestamp;

        // If before cliff, nothing is vested
        if (currentTime < schedule.startTime + schedule.cliff) {
            return 0;
        }

        // If after vesting period, everything is vested
        if (currentTime >= schedule.startTime + schedule.duration) {
            return schedule.totalAmount - schedule.released;
        }

        // Calculate vested amount based on time elapsed
        uint256 timeElapsed = currentTime - schedule.startTime;
        uint256 vestedAmount = (schedule.totalAmount * timeElapsed) / schedule.duration;
        
        return vestedAmount - schedule.released;
    }

    /**
     * @dev Release vested tokens to beneficiary
     * @param vestingId The vesting schedule ID
     * @param token The token address
     */
    function release(bytes32 vestingId, address token) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        
        require(msg.sender == schedule.beneficiary, "Only beneficiary can release");
        require(!schedule.revoked, "Vesting has been revoked");

        uint256 releasableAmount = _computeReleasableAmount(schedule);
        require(releasableAmount > 0, "No tokens are due");

        schedule.released += releasableAmount;

        IERC20(token).safeTransfer(schedule.beneficiary, releasableAmount);

        emit TokensReleased(vestingId, schedule.beneficiary, releasableAmount);
    }

    /**
     * @dev Revoke a vesting schedule
     * @param vestingId The vesting schedule ID
     * @param token The token address
     */
    function revoke(bytes32 vestingId, address token) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        
        require(schedule.revocable, "Vesting is not revocable");
        require(!schedule.revoked, "Vesting already revoked");

        uint256 releasableAmount = _computeReleasableAmount(schedule);
        
        if (releasableAmount > 0) {
            schedule.released += releasableAmount;
            IERC20(token).safeTransfer(schedule.beneficiary, releasableAmount);
        }

        uint256 refundAmount = schedule.totalAmount - schedule.released;
        if (refundAmount > 0) {
            IERC20(token).safeTransfer(owner(), refundAmount);
        }

        schedule.revoked = true;

        emit VestingRevoked(vestingId);
    }

    /**
     * @dev Get all vesting schedules for a beneficiary
     * @param beneficiary The beneficiary address
     * @return Array of vesting IDs
     */
    function getBeneficiarySchedules(address beneficiary) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return beneficiarySchedules[beneficiary];
    }

    /**
     * @dev Get vesting schedule details
     * @param vestingId The vesting schedule ID
     */
    function getVestingSchedule(bytes32 vestingId) 
        external 
        view 
        returns (
            address beneficiary,
            address token,
            uint256 totalAmount,
            uint256 released,
            uint256 startTime,
            uint256 cliff,
            uint256 duration,
            bool revocable,
            bool revoked
        ) 
    {
        VestingSchedule storage schedule = vestingSchedules[vestingId];
        return (
            schedule.beneficiary,
            schedule.token,
            schedule.totalAmount,
            schedule.released,
            schedule.startTime,
            schedule.cliff,
            schedule.duration,
            schedule.revocable,
            schedule.revoked
        );
    }
}
