using System;

namespace TaskManagementSystem.Data.Domain.Entities;

public class WorkSession
{
    public int Id { get; set; }

    public int TaskId { get; set; }

    public TaskItem TaskItem { get; set; } = null!;

    public int? UserId { get; set; }

    public User? User { get; set; }

    public int Hours { get; set; }

    public DateTime Date { get; set; } = DateTime.UtcNow;

    public string? Description { get; set; }
}
