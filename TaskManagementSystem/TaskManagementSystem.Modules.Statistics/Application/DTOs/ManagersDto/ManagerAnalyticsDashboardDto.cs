using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;

public class ManagerAnalyticsDashboardDto
{
    public AnalyticsCardsDto Cards { get; set; } = null!;

    public TasksByStatusDto TasksByStatus { get; set; } = null!;

    public TasksByPriorityDto TasksByPriority { get; set; } = null!;

    public List<UserProductivityDto> Productivity { get; set; } = [];
}
