using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Modules.Tasks.Application.DTOs
{
    public class CreatePersonalTaskDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Priority Priority { get; set; }
        public DateTime Deadline { get; set; }
        public int EstimatedHours { get; set; }
    }
}
