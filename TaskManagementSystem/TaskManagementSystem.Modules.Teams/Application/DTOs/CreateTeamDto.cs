using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.Teams.Application.DTOs
{
    public class CreateTeamDto
    {
        public string Name { get; set; } = string.Empty;

        public int ManagerId { get; set; }

        public ICollection<int> MemberIds { get; set; } = new HashSet<int>();
    }
}
