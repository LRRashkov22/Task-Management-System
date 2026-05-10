using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Data.Domain.Entities;

public class Comment
{
    public int Id { get; set; }

    public required string Content { get; set; }

    public int UserId { get; set; }

    public required User User { get; set; }

    public int TaskId { get; set; }

    public required TaskItem TaskItem { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}