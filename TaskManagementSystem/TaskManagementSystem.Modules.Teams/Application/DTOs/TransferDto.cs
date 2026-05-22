using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Teams.Application.DTOs
{
    public class TransferDto
    {
        public int TeamId { get; set; }
        //public int currentid {  get; set; }
        public int NewManagerId { get; set; }
    }
}
