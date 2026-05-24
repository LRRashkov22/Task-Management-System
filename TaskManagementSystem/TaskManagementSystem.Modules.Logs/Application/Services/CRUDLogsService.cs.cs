using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Domain.Interfaces;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;

namespace TaskManagementSystem.Modules.Logs.Application.Services;

public class CRUDLogService : ICRUDLogService
{
    private readonly TaskManagementDbContext _context;
    public CRUDLogService(TaskManagementDbContext context)
    {
        _context = context;
    }

    public async Task<(bool IsDeleted, string? error)> DeleteLog(int logId)
    {
        var log = await _context.Logs
            .Where(x => x.Id == logId)
            .FirstOrDefaultAsync();

        if (log == null)
        {
            return (false, "log not found");
        }

        _context.Logs.Remove(log);
        await _context.SaveChangesAsync();

        return (true, null);
    }

}