using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;

public class GetTeamDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int ManagerId { get; set; }

    public string ManagerUsername { get; set; } = string.Empty;
    public int EmployeesCount { get; set; }
    public int? TasksCount { get; set; }

    public ICollection<MemberDto> Members { get; set; } = new List<MemberDto>();

    public ICollection<TeamTaskCardDto> Tasks { get; set; } = new List<TeamTaskCardDto>();
}
