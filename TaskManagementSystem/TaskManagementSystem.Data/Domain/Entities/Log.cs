using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Data.Domain.Entities;

public class Log
{
    public int Id { get; set; }

    public string Action { get; set; }

    public int UserId { get; set; }

    public User User { get; set; }

    public string Data { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

}