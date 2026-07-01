using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using TaskManagementSystem.Data.Domain.Entities;
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

    public async Task<(bool isCreate, string?)> CreateLog(CreateLogDto request)
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
            UserId = request.UserId
        };

        _context.Logs.Add(log);
        await _context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(List<Log>? log, string?)> GetLogs(GetLogsRequestDto request)
    {
        IQueryable<Log> query = _context.Logs.AsNoTracking();

        if (request.UserId.HasValue)
            query = query.Where(x => x.UserId == request.UserId);

        if (request.ActionType.HasValue)
            query = query.Where(x => x.ActionType == request.ActionType);

        if (request.Module.HasValue)
            query = query.Where(x => x.Module == request.Module);

        if (request.FromDate.HasValue)
        {
            query = query.Where(x =>
                x.CreatedAt >= request.FromDate.Value);
        }

        if (request.ToDate.HasValue)
        {
            var endDate =
                request.ToDate.Value.Date.AddDays(1);

            query = query.Where(x =>
                x.CreatedAt < endDate);
        }

        query = request.SortBy?.ToLower() switch
        {
            "createdat" => request.SortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt),

            "userrole" => request.SortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(x => x.User != null ? x.User.Role : 0)
                : query.OrderBy(x => x.User != null ? x.User.Role : 0),

            _ => query.OrderByDescending(x => x.CreatedAt)
        };

        query = query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize);

        var logs = await query.ToListAsync();

        return (logs, null);
    }

    public async Task<(bool IsDeleted, string?)> DeleteLog(int logId)
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
