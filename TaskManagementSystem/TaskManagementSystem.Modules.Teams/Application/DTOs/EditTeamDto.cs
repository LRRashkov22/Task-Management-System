using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Teams.Application.DTOs
{
    public class EditTeamDto
    {
        public int Id { get; set; }
        public string? Name { get; set; } = string.Empty;
        public ICollection<int>? Members { get; set; }
    }
}
