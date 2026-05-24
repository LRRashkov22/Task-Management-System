using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.DTOs
{
    public class TaskHistoryDto
    {
        public int Id { get; set; }

        public string Action { get; set; } = string.Empty;

        public string? OldValue { get; set; }

        public string? NewValue { get; set; }

        public string ChangedByUsername { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
