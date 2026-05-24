using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.AdminDto
{
    public class GetPreviewOnDeletingManagerDto
    {
        public string ManagerName { get; set; } = string.Empty;
        public int teams { get; set; }
        public int tasks { get; set; }
        public int employees { get; set; }
    }
}
