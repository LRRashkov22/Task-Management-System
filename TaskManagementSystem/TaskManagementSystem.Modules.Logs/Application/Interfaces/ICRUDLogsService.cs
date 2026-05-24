using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Logs.Application.DTOs;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;

public interface ICRUDLogService
{
    Task<(bool IsDeleted, string? error)> DeleteLog(int logId);

    Task<(Log? log, string? error)> CreateLog(CreateLogDto request);
}
