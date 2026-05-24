using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.EmployeeDto
{

    public class EmployeeDashboardDto
    {
        public int MyTasks { get; set; }

        public int InProgressTasks { get; set; }

        public int CompletedTasks { get; set; }

        public int OverdueTasks { get; set; }

        public int TotalHoursLogged { get; set; }

        public int TasksCompleted { get; set; }

        public int AvgTimePerTask { get; set; }

        public List<EmployeeRecentTaskDto> RecentTasks { get; set; } = [];
    }
}
