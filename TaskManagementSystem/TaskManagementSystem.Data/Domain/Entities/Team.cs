using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Data.Domain.Entities;

public class Team
{
    public int Id { get; set; }

    public string Name { get; set; }

    public int ManagerId { get; set; }

    public User User { get; set; }
}