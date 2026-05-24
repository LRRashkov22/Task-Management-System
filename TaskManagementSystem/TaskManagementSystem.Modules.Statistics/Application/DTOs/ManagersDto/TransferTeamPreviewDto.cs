using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto
{
    public class TransferTeamPreviewDto
    {
        public int TeamId { get; set; }

        public string TeamName { get; set; } = string.Empty;

        public int MembersCount { get; set; }

        public int TasksCount { get; set; }

        public string CurrentManagerName { get; set; } = string.Empty;
    }
}
