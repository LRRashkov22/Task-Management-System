using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Modules.Tasks.Application.DTOs
{
    public class CreateTaskDto
    {
      //  public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public Priority Priority { get; set; }

        public DateTime? Deadline { get; set; }

        public int TeamId { get; set; }

      //  public Team Team { get; set; } = null!;

       // public User CreatedBy { get; set; } = null!;

        public ICollection<int> Assignments { get; set; } = new HashSet<int>();
       // public Status Status { get; set; }

      //  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
