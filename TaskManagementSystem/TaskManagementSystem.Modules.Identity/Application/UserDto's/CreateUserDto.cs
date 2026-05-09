using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Domain.Entities;
namespace TaskManagementSystem.Modules.Identity.Application.UserDto_s;

public class CreateUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public Role Role { get; set; }
    public int? ManagerId { get; set; }
}
