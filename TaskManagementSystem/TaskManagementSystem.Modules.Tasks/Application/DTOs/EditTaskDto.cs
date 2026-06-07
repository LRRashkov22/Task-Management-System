using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.DTOs
{
    public class EditTaskDto
    {
        public string? Name { get; set; } = string.Empty;
        public int? EstimatedHours { get; set; }
        public string? Description { get; set; } = string.Empty;
        public DateTime? Deadline { get; set; }
        public ICollection<int>? Members { get; set; }
    }
}
