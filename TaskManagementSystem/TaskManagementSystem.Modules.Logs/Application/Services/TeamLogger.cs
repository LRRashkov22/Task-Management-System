using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;

namespace TaskManagementSystem.Modules.Logs.Application.Services;

public class TeamLogger : ITeamLogger
{
    private readonly ICRUDLogService _logService;
    private readonly TaskManagementDbContext _context;

    public TeamLogger(
        ICRUDLogService logService,
        TaskManagementDbContext context)
    {
        _logService = logService;
        _context = context;
    }

    public async Task LogCreateTeam(
        CreateLogDto createLogDto,
        Team team,
        IEnumerable<int> memberIds,
        string managerName)
    {
        var usernames = await _context.Users
            .Where(x => memberIds.Contains(x.Id))
            .Select(x => x.Username)
            .ToListAsync();

        createLogDto.Module = LogModule.Teams;
        createLogDto.Action =
            $"Team '{team.Name}' was created by {managerName} and assigned to {string.Join(", ", usernames)}";

        await _logService.CreateLog(createLogDto);
    }

    public async Task LogTeamArchived(CreateLogDto createLogDto, Team team)
    {
        var userIds = team.Memberships.Select(x => x.UserId).ToList();

        createLogDto.Module = LogModule.Teams;
        createLogDto.Action = $"Team '{team.Name}' was archived";

        await _logService.CreateLog(createLogDto);
    }

    public async Task LogTeamRecovered(CreateLogDto createLogDto, Team team)
    {
        createLogDto.Module = LogModule.Teams;
        createLogDto.Action = $"Team '{team.Name}' was recovered by manager {team.ManagerId}";

        await _logService.CreateLog(createLogDto);
    }

    public async Task LogTeamTransferred(
        CreateLogDto createLogDto,
        Team team,
        int oldManagerId,
        int newManagerId)
    {
        var oldManager = await _context.Users
            .Where(x => x.Id == oldManagerId)
            .Select(x => x.Username)
            .FirstOrDefaultAsync();

        var newManager = await _context.Users
            .Where(x => x.Id == newManagerId)
            .Select(x => x.Username)
            .FirstOrDefaultAsync();

        createLogDto.Module = LogModule.Teams;
        createLogDto.Action = $"Team '{team.Name}' was transferred from {oldManager} to {newManager}";

        await _logService.CreateLog(createLogDto);
    }

    public async Task LogTeamEdited(
        CreateLogDto createLogDto,
        Team team,
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

        createLogDto.Module = LogModule.Teams;
        createLogDto.Action =
            $"Team '{team.Name}' was edited. " +
            $"Removed: {string.Join(", ", removedUsernames)}. " +
            $"Added: {string.Join(", ", addedUsernames)}";

        await _logService.CreateLog(createLogDto);
    }

    public async Task LogTeamDeleted(
        CreateLogDto createLogDto,
        Team team
    )
    {
        createLogDto.Module = LogModule.Teams;
        createLogDto.Action = $"Team '{team.Name}' was deleted.";

        await _logService.CreateLog(createLogDto);
    }
}