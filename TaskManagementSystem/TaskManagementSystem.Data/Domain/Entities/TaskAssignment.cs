using System;

namespace TaskManagementSystem.Data.Domain.Entities;

public class TaskAssignment
{
    public int TaskId { get; set; }

    public TaskItem TaskItem { get; set; } = null!;

    public int UserId { get; set; }

    public User User { get; set; } = null!;
}