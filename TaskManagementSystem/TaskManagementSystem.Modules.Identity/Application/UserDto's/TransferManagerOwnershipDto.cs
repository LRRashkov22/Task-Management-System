using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Identity.Application.UserDto_s
{
    public class TransferManagerOwnershipDto
    {
        public int CurrentManagerId { get; set; }

        public int NewManagerId { get; set; }
    }
}
