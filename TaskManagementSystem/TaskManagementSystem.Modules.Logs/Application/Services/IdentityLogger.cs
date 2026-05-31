using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
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

    private async Task CreateLog(string action, ActionType actionType)
    {
        await _logService.CreateLog(new CreateLogDto
        {
            ActionType = actionType,
            Module = LogModule.Identity,
            Action = action
        });
    }

    private async Task<string> GetAdminName()
    {
        return await _context.Users
            .Where(x => x.Role == Role.Admin)
            .Select(x => x.Username)
            .FirstOrDefaultAsync();
    }

    public async Task UserCreatedLog(User user)
    {
        await CreateLog(
            $"User '{user.Username}' was created by {GetAdminName()}.", ActionType.Create);
    }

    public async Task UserEditedLog(User user)
    {
        await CreateLog(
            $"User '{user.Username}' was edited by {GetAdminName()}.", ActionType.Modify);
    }

    public async Task UserDeletedLog(User user)
    {
        await CreateLog(
            $"User '{user.Username}' was deleted by {GetAdminName()}.", ActionType.Remove);
    }

    public async Task OwnershipTransferredLog(
        User oldManager,
        User newManager)
    {
        await CreateLog(
            $"Ownership was transferred from '{oldManager.Username}' to '{newManager.Username}' by {GetAdminName()}.", 
            ActionType.Modify);
    }

    public async Task ManagerForceDeletedLog(User manager)
    {
        await CreateLog(
            $"Manager '{manager.Username}' was permanently deleted by {GetAdminName()}.", ActionType.Remove);
    }

    public async Task PasswordChangedLog(User user)
    {
        await CreateLog(
            $"User '{user.Username}' changed their password.", ActionType.Modify);
    }

    public async Task LoginLog(User user)
    {
        await CreateLog(
            $"User '{user.Username}' logged in.", ActionType.Create);
    }

    public async Task LogoutLog(User user)
    {
        await CreateLog(
            $"User '{user.Username}' logged out.", ActionType.Create);
    }
}