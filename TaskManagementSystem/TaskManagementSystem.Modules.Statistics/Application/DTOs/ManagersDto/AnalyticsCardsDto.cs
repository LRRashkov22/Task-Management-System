using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto
{
    public class AnalyticsCardsDto
    {
        public int TaskCompleted { get; set; }
        public int TotalTime { get; set; }
        public int AvgTimePerTask { get; set; }
        public int CompleationRate { get; set; }


    }
}
