using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Modules.Logs.Application.DTOs;

public class GetLogsRequestDto
{
    public string? SortBy { get; set; }
    public string? SortDirection { get; set; } = "asc";

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;

    public int? UserId { get; set; }
    public ActionType? ActionType { get; set; } = null;

    public LogModule? Module { get; set; } = null;

    public DateTime? FromDate { get; set; }

    public DateTime? ToDate { get; set; }
}