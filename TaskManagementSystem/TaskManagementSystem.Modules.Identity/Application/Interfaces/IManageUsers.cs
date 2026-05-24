using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Identity.Application.DTOs;

namespace TaskManagementSystem.Modules.Identity.Application.Interfaces;

public interface IManageUsers
{
    Task<EditUserDto?> EditUser(EditUserDto request);
    Task Logout(int userId);
    Task<(bool status, string? error)> DeleteEmployeeAsync(int employeeId);
    Task<(bool status, string? error)> TransferOwnershipAsync(TransferManagerOwnershipDto request);
    Task<(bool status, string? error)> ForceDeleteManagerAsync(int managerId);
}
