using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;
{
    public class CommentDto
    {
        public int Id { get; set; }

        public string Content { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
