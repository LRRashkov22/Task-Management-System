using System;
using System.Collections.Generic;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Data.Domain.Entities;

public class TaskItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Priority Priority { get; set; }

    public bool IsArchived { get; set; } = false;

    public Status Status { get; set; } = Status.InProgress;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime Deadline { get; set; } 

    public int TeamId { get; set; }

    public Team Team { get; set; } = null!;

    public int? CreatedById { get; set; }

    public User? CreatedBy { get; set; } = null!;

    public ICollection<TaskAssignment> Assignments { get; set; } = new HashSet<TaskAssignment>();

    public ICollection<Comment> Comments { get; set; } = new HashSet<Comment>();

    public ICollection<TaskHistory> History { get; set; } = new HashSet<TaskHistory>();

    public ICollection<WorkSession> WorkSessions { get; set; } = new HashSet<WorkSession>();
}
