using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
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

    public async Task<(bool isCreate, string? error)> CreateLog(CreateLogDto request)
    {
        if (!request.UserId.HasValue)
        {
            return (false, "no userId");
        }

        var user = await _context.Users.AsNoTracking().AnyAsync(x => x.Id == request.UserId);

        if (!user)
        {
            return (false, "no user found");
        }

        if (string.IsNullOrWhiteSpace(request.Action))
        {
            return (false, "missing action");
        }

        var log = new Log
        {
            Module = request.Module,
            ActionType = request.ActionType,
            Action = request.Action,
            UserId = request.UserId,
            Data = request.Data
        };

        _context.Logs.Add(log);
        await _context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(List<Log>? log, string? error)> GetLog()
    {
        var logs = await _context.Logs
            .Include(x => x.User)
            .ToListAsync();

        return (logs, "");
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