using System;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Data.Domain.Entities;

public class Log
{
    public int Id { get; set; }

    public LogModule Module { get; set; }

    public ActionType ActionType { get; set; }

    public string Action { get; set; } = string.Empty;

    public int? UserId { get; set; }

    public User? User { get; set; }

    public string? Data { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
