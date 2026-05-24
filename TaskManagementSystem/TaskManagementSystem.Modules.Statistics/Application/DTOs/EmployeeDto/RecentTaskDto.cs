using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.EmployeeDto;

public class EmployeeRecentTaskDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime Deadline { get; set; }
}
