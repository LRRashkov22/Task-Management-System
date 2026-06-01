using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto
{
    public class AnalyticsCardsDto
    {
        public int TasksCompleted { get; set; }

        public int TotalHours { get; set; }

        public double CompletionRate { get; set; }
    }
}
