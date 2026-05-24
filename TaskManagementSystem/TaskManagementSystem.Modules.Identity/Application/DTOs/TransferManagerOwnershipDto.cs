using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.DTOs
{
    public class TransferManagerOwnershipDto
    {
        public int CurrentManagerId { get; set; }

        public int NewManagerId { get; set; }
    }
}
