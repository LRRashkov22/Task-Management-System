using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;

namespace TaskManagementSystem.Modules.Logs.Application.Services;

public class TaskLogger : ITaskLogger
{
    private readonly ICRUDLogService _logService;
    private readonly TaskManagementDbContext _context;

    public TaskLogger(ICRUDLogService logService, TaskManagementDbContext context)
    {
        _logService = logService;
        _context = context;
    }

    public async Task TaskAssignedLog(
        CreateLogDto createLogDto,
        TaskItem task,
        IEnumerable<int> assignedUserIds,
        string managerName)
    {
        var usernames = await _context.Users
            .Where(x => assignedUserIds.Contains(x.Id))
            .Select(x => x.Username)
            .ToListAsync();

        createLogDto.Module = LogModule.Tasks;
        createLogDto.Action = 
            $"Task '{task.Title}' was assigned by {managerName} to {string.Join(", ", usernames)}";

        await _logService.CreateLog(createLogDto);
    }

    public async Task TaskRecoverLog(
    CreateLogDto createLogDto,
    TaskItem task)
    {
        createLogDto.Module = LogModule.Tasks;
        createLogDto.Action =
            $"Task '{task.Title}' was recovered.";

        await _logService.CreateLog(createLogDto);
    }

    public async Task TaskArchivedLog(
    CreateLogDto createLogDto,
    TaskItem task)
    {
        var username = await _context.Users
            .Where(x => x.Id == createLogDto.UserId)
            .Select(x => x.Username)
            .FirstOrDefaultAsync();

        createLogDto.Module = LogModule.Tasks;
        createLogDto.Action =
            $"Task '{task.Title}' was archived by {username}.";

        await _logService.CreateLog(createLogDto);
    }

    public async Task TaskTransferedLog(
    CreateLogDto createLogDto,
    TaskItem task,
    IEnumerable<int> oldAssignedUsers)
    {
        var usernames = await _context.Users
            .Where(x => oldAssignedUsers.Contains(x.Id))
            .Select(x => x.Username)
            .ToListAsync();

        createLogDto.Module = LogModule.Tasks;
        createLogDto.Action =
            $"Task '{task.Title}' was transferred from {string.Join(", ", usernames)}.";

        await _logService.CreateLog(createLogDto);
    }

    public async Task TaskEditLog(
    CreateLogDto createLogDto,
    TaskItem task,
    IEnumerable<int> removedUsers,
    IEnumerable<int> addedUsers)
    {
        var removedUsernames = await _context.Users
            .Where(x => removedUsers.Contains(x.Id))
            .Select(x => x.Username)
            .ToListAsync();

        var addedUsernames = await _context.Users
            .Where(x => addedUsers.Contains(x.Id))
            .Select(x => x.Username)
            .ToListAsync();

        createLogDto.Module = LogModule.Tasks;
        createLogDto.Action =
            $"Task '{task.Title}' was edited. " +
            $"Removed: {string.Join(", ", removedUsernames)}. " +
            $"Added: {string.Join(", ", addedUsernames)}.";

        await _logService.CreateLog(createLogDto);
    }
}