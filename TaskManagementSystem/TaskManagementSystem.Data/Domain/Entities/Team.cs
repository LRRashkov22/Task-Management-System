using System.Collections.Generic;

namespace TaskManagementSystem.Data.Domain.Entities;

public class Team
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int ManagerId { get; set; }

    public User Manager { get; set; } = null!;

    public ICollection<TeamMembership> Memberships { get; set; } = new HashSet<TeamMembership>();

    public ICollection<TaskItem> Tasks { get; set; } = new HashSet<TaskItem>();
}
