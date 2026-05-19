using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.Dto;

public class GetArchivedTaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string TeamName {  get; set; } = string.Empty;
    public string? ManagerName { get; set; }
    public int AssignedEmployeesCount { get; set; }

}
