using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Data.Domain.Entities;

public class WorkSession
{
    public int Id { get; set;}

    public int TaskId { get; set;}

    public TaskItem Task { get; set; }

    public int UserId { get; set; }

    public User User { get; set; }

    public int Hours { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

}