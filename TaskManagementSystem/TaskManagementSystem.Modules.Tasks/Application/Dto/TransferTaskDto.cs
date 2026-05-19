using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.Dto
{
    public class TransferTaskDto
    {
        public int TaskId { get; set; }

        public int NewTeamId { get; set; }

        public ICollection<int> Assignments { get; set; } =  new List<int>();
    }
}
