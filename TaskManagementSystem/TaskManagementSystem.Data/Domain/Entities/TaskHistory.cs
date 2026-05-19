using System;

namespace TaskManagementSystem.Data.Domain.Entities;

public class TaskHistory
{
    public int Id { get; set; }

    public int TaskId { get; set; }

    public TaskItem TaskItem { get; set; } = null!;

    public string Action { get; set; } = string.Empty;

    public string? OldValue { get; set; }

    public string? NewValue { get; set; }

    public int? ChangedById { get; set; }

    public User? ChangedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
