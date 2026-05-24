using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.DTOs
{
    public class EditUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public int? ManagerId { get; set; }

    }
}
