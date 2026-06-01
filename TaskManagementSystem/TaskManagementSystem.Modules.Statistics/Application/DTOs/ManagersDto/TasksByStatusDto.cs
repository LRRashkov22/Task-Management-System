using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;

public class TasksByStatusDto
{
    public int Todo { get; set; }
    public int InProgress { get; set; }
    public int Review { get; set; }
    public int Done { get; set; }
}
