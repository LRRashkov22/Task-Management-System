using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Teams.Application.Dto_s
{
    public class GetTeamDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int ManagerId { get; set; }

        public string ManagerUsername { get; set; } = string.Empty;

        public ICollection<MemberDto> Members { get; set; } = new List<MemberDto>();

        public ICollection<TaskDto> Tasks { get; set; } = new List<TaskDto>();
    }
}
