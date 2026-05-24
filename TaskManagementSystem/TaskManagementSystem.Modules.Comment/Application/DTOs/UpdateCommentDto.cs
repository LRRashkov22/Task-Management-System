using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace TaskManagementSystem.Modules.Comments.Application.DTOs
{
    public class UpdateCommentDto
    {
        [Required]
        [StringLength(1000, MinimumLength = 1, ErrorMessage = "Comment content cannot be empty or exceed 1000 characters.")]
        public string Content { get; set; } = string.Empty;

        public List<int> MentionedUserIds { get; set; } = new();
    }
}
