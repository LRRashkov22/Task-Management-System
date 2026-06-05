using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Logs.Application.DTOs;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;

public interface ICRUDLogService
{
    Task<(bool isCreate, string?)> CreateLog(CreateLogDto request);

    Task<(List<Log>? log, string?)> GetLogs(GetLogsRequestDto request);

    Task<(bool IsDeleted, string?)> DeleteLog(int logId);
}
