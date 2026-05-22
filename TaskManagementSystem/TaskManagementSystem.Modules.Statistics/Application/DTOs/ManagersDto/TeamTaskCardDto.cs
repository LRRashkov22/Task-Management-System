using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto
{
    public class TeamTaskCardDto
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Status { get; set; } = string.Empty;

        public string Priority { get; set; } = string.Empty;

        public DateTime? Deadline { get; set; }

        public int AssignedEmployeesCount { get; set; }

        public int WorkHours { get; set; }

        public ICollection<MemberDto> AssignedEmployees { get; set; }
            = new List<MemberDto>();
    }
}
