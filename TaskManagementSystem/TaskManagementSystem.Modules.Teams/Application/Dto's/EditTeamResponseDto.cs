using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto;

namespace TaskManagementSystem.Modules.Teams.Application.Dto_s
{
    public class EditTeamResponseDto
    {
            public int Id { get; set; }
            public string? Name { get; set; } = string.Empty;
            public ICollection<MemberDto>? Members { get; set; } = new List<MemberDto>();
    }
}
