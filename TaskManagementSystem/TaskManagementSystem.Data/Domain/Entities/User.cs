using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Data.Domain.Entities;

public class User
{
    public int Id { get; set; }

    [Required]
    [Length(3, 20)]
    [RegularExpression(@"^[a-zA-Z]$",
    ErrorMessage = "Characters are not allowed.")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Length(8, 30)]
    public string PasswordHash { get; set; } = string.Empty;

    public Role Role { get; set; }
    public int? ManagerId { get; set; }
    public User? Manager { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public ICollection<User> ManagedUsers { get; set; } = new HashSet<User>();

    public ICollection<Team> ManagedTeams { get; set; } = new HashSet<Team>();

    public ICollection<TeamMembership> TeamMemberships { get; set; } = new HashSet<TeamMembership>();

    public ICollection<TaskAssignment> TaskAssignments { get; set; } = new HashSet<TaskAssignment>();

    public ICollection<TaskItem> CreatedTasks { get; set; } = new HashSet<TaskItem>();

    public ICollection<Comment> Comments { get; set; } = new HashSet<Comment>();

    public ICollection<CommentMention> CommentMentions { get; set; } = new HashSet<CommentMention>();

    public ICollection<Notification> Notifications { get; set; } = new HashSet<Notification>();

    public ICollection<TaskHistory> TaskHistories { get; set; } = new HashSet<TaskHistory>();

    public ICollection<WorkSession> WorkSessions { get; set; } = new HashSet<WorkSession>();

    public ICollection<Log> Logs { get; set; } = new HashSet<Log>();
}
