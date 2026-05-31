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
            UserId = request.UserId
        };

        _context.Logs.Add(log);
        await _context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(List<Log>? log, string?)> GetLogs(GetLogsRequestDto request)
    {
        IQueryable<Log> query = _context.Logs;

        if (request.UserId.HasValue)
            query = query.Where(x => x.UserId == request.UserId);

        if (request.ActionType.HasValue)
            query = query.Where(x => x.ActionType == request.ActionType);

        if (request.Module.HasValue)
            query = query.Where(x => x.Module == request.Module);


        query = request.SortBy?.ToLower() switch
        {
            "createdAt" => request.SortDirection?.ToLower() == "desc"
                ? query.OrderByDescending(x => x.CreatedAt)
                : query.OrderBy(x => x.CreatedAt),

            "userRole" => request.SortDirection?.ToLower() == "desc"
                ? query
                    .Include(x => x.UserId)
                    .OrderByDescending(x => x.User.Role)
                : query
                    .Include(x => x.UserId)
                    .OrderBy(x => x.User.Role),

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