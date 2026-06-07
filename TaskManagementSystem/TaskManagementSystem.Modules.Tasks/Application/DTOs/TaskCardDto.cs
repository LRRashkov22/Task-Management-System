using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.DTOs
{
    public class TaskCardDto
    {
        public int Id { get; set; }
        public int EstimatedHours { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Priority { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public DateTime? Deadline { get; set; }

        public int AssignedEmployeesCount { get; set; }

        public int WorkHours { get; set; }
    }
}
