using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Identity.Application.UserDto_s;

namespace TaskManagementSystem.Modules.Identity.Application.Interfaces;

public interface IManageUsers
{
    Task<List<GetUsersDto>> GetAllUsersByRole(Role role);
    Task<EditUserDto?> EditUser(EditUserDto request);
    Task Logout(int userId);
    Task<bool> DeleteUser(GetUsersDto request);
}
