using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;

public class UserProductivityDto
{
    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public int CompletedTasks { get; set; }

    public int HoursLogged { get; set; }
}
