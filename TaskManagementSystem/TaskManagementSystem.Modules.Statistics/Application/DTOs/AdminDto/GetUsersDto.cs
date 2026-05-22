using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.AdminDto
{
    public class GetUsersDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? ManagerName { get; set; } = string.Empty;
        public int? teams { get; set; }
    }
}
