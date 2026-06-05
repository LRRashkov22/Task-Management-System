using System;
using System.Collections.Generic;
using System.Text;

namespace TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;

public class TaskDetailsDto
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public DateTime? Deadline { get; set; }

    public int WorkHours { get; set; }

    public List<MemberDto> AssignedUsers { get; set; } = new();

    public List<CommentDto> Comments { get; set; } = new();

    public List<WorkSessionDto> WorkSessions { get; set; } = new();

    public List<TaskHistoryDto> History { get; set; } = new();
}
