using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.UserDto_s
{
    public class GetUsersDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? ManagerName { get; set; } = string.Empty;
        public int? teams {  get; set; }
    }
}
