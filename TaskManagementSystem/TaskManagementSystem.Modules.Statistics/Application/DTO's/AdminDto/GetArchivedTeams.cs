using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTO_s.AdminDto
{
    public class GetArchivedTeams
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ManagerName { get; set; } = string.Empty;
        public int MembersCount { get; set; }
        public int taskCount { get; set; }
            

    }
}
