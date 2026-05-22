using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;

public interface ICRUDLogService
{
    Task<IEnumerable<Log>> GetLogs();

    Task<(bool IsDeleted, string? error)> DeleteLog(int logId);
}
