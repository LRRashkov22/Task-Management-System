using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
namespace TaskManagementSystem.Data.Domain.Entities;

public class User
{
    public int id { get; set; }

    [Required]
    [Length(3, 20)]
    [RegularExpression(@"^[a-zA-Z]$",
    ErrorMessage = "Characters are not allowed.")]
    public string Username { get; set; } = string.Empty;

    [Required]
    [Length(8, 30)]
    public string PasswordHash { get; set; } = string.Empty;

    public Role? Role { get; set; }

    int? ManagerId;
    User? Manager;

    //ICollection<TaskAssignment> TaskAssignments;
    //ICollection<Comment> Comments;
    //ICollection<Notification> Notifications;

    //DateTime CreatedAt;

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }
}
