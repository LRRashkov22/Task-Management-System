using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Data.Domain.Entities;

public class CommentMention
{
    public int Id { get; set; }

    public int CommentId { get; set; }

    public Comment Comment { get; set; }

    public int MentionedUserId { get; set; }

    public User User { get; set; }
}