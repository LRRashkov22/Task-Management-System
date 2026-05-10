using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Data.Domain.Entities;

public class TaskItem
{

    public int Id { get; set; }

    public string Title { get; set; }
    public string Description { get; set; }

    public Priority Priority { get; set; }

    public Status Status { get; set; }  

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public DateTime Deadline { get; set; } = DateTime.Now;

    public int TeamId { get; set; }

    public Team Team { get; set; }

    public int CreatedBy { get; set; }

    public User User { get; set; }

}