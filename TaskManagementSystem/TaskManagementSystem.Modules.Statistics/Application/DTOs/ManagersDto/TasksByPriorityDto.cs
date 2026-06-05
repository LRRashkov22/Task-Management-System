using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;

public class TasksByPriorityDto
{
    public int Low { get; set; }

    public int Medium { get; set; }

    public int High { get; set; }
}
