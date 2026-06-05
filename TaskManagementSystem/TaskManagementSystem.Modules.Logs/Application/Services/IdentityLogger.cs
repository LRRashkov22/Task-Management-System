using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;

namespace TaskManagementSystem.Modules.Logs.Application.Services;

public class IdentityLogger : IIdentityLogger
{
    private readonly ICRUDLogService _logService;
    private readonly TaskManagementDbContext _context;

    public IdentityLogger(ICRUDLogService logService, TaskManagementDbContext context)
    {
        _logService = logService;
        _context = context;
    }

    private async Task CreateLog(User user, string action, ActionType actionType)
    {
        await _logService.CreateLog(new CreateLogDto
        {
            ActionType = actionType,
            Module = LogModule.Identity,
            Action = action,
            UserId = user.Id
        });
    }

    private async Task<string> GetAdminName()
    {
        return await _context.Users
            .Where(x => x.Role == Role.Admin)
            .Select(x => x.Username)
            .FirstAsync();
    }

    public async Task UserCreatedLog(User user)
    {
        await CreateLog(
            user,
            $"User '{user.Username}' was created by {await GetAdminName()}.", ActionType.Create);
    }

    public async Task UserEditedLog(User user)
    {
        await CreateLog(
            user,
            $"User '{user.Username}' was edited by {await GetAdminName()}.", ActionType.Modify);
    }

    public async Task UserDeletedLog(User user)
    {
        await CreateLog(
            user,
            $"User '{user.Username}' was deleted by {await GetAdminName()}.", ActionType.Remove);
    }

    public async Task OwnershipTransferredLog(
        User oldManager,
        User newManager)
    {
        await CreateLog(
            oldManager,
            $"Ownership was transferred from '{oldManager.Username}' to '{newManager.Username}' by {await GetAdminName()}.", 
            ActionType.Modify);
    }

    public async Task ManagerForceDeletedLog(User manager)
    {
        await CreateLog(
            manager,
            $"Manager '{manager.Username}' was permanently deleted by {await GetAdminName()}.", ActionType.Remove);
    }

    public async Task PasswordChangedLog(User user)
    {
        await CreateLog(
            user,
            $"User '{user.Username}' changed their password.", ActionType.Modify);
    }

    public async Task LoginLog(User user)
    {
        await CreateLog(
            user,
            $"User '{user.Username}' logged in.", ActionType.Create);
    }

    public async Task LogoutLog(User user)
    {
        await CreateLog(
            user,
            $"User '{user.Username}' logged out.", ActionType.Create);
    }
}
