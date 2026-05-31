using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Logs.Application.DTOs;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;
public interface ITeamLogger
{

    Task LogCreateTeamAsync(
        CreateLogDto createLogDto,
        Team team,
        IEnumerable<int> memberIds,
        string managerName);

    Task LogTeamArchivedAsync(
        CreateLogDto createLogDto,
        Team team);

    Task LogTeamRecoveredAsync(
        CreateLogDto createLogDto,
        Team team);

    Task LogTeamTransferredAsync(
        CreateLogDto createLogDto, 
        Team team,
        int oldManagerId,
        int newManagerId);

    Task LogTeamEditedAsync(
        CreateLogDto createLogDto,
        Team team,
        IEnumerable<int> removedUsers,
        IEnumerable<int> addedUsers);
}