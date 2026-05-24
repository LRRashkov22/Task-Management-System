using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;

namespace TaskManagementSystem.Modules.Logs.Application.DTOs;

public class CreateLogDto
{
    public LogModule Module { get; set; }

    public ActionType ActionType { get; set; }

    public string Action { get; set; } = string.Empty;

    public int UserId { get; set; }


    public string? Data { get; set; }
}
