using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Logs.Application.DTOs;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;

public interface ICRUDLogService
{
    Task<(bool isCreate, string? error)> CreateLog(CreateLogDto request);

    Task<(List<Log>? log, string? error)> GetLog();
    Task<(bool IsDeleted, string? error)> DeleteLog(int logId);
}
