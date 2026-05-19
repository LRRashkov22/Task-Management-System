using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Tasks.Application.Dto
{
    public class CommentDto
    {
        public int Id { get; set; }

        public string Content { get; set; } = string.Empty;

        public string Username { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
