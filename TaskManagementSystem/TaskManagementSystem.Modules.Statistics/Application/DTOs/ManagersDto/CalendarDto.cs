using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto
{
    public class CalendarDto
    {
        public string TaskName { get; set; } = string.Empty;
        public string TeamName { get; set; } = string.Empty;
        public Status Status { get; set; }
        public DateTime Deadline { get; set; }
        public DateTime StartDate { get; set; }
    }
}
