using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Data.Domain.Entities;

public class TaskHistory
{
    public int Id { get; set; }

    public int TaskId { get; set; }

    public TaskItem Item { get; set; }  

    public string Action { get; set; }

    public string OldValue { get; set; }

    public string NewValue { get; set; }

    public int ChangedById { get; set; }

    public User User { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
}