using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Interfaces;
using TaskManagementSystem.Data.Persistance;

namespace TaskManagementSystem.Modules.Logs.Application.Services;

public class AppLogger : IAppLogger
{
    private readonly TaskManagementDbContext _context;
    public AppLogger(TaskManagementDbContext context)
    {
        _context = context;
    }

    public async Task<(bool isCreate, string? error)> CreateLog(Log request)
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
}