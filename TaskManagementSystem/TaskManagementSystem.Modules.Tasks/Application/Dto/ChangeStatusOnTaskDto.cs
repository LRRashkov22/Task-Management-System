using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Modules.Tasks.Application.Dto
{
    public class ChangeStatusOnTaskDto
    {
        public int Id { get; set; }
        public Status status { get; set; }
    }
}
