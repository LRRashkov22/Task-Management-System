using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.Dto
{
    public class WorkSessionDto
    {
        public int Id { get; set; }

        public int Hours { get; set; }

        public string Username { get; set; } = string.Empty;

        public DateTime Date { get; set; }
    }
}
