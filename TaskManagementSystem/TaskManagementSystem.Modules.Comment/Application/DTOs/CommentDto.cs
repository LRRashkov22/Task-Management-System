using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Comments.Application.DTOs
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public int? UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public int TaskId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<int> MentionedUserIds { get; set; } = new();
    }
}
