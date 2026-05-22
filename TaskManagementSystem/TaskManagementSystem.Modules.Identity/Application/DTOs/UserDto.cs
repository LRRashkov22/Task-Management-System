using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.DTOs;

public class UserDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
