using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Logs.Application.DTOs;

namespace TaskManagementSystem.Modules.Logs.Application.Interfaces;
public interface ITeamLogger
{

    Task LogCreateTeam(
        CreateLogDto createLogDto,
        Team team,
        IEnumerable<int> memberIds,
        string managerName);

    Task LogTeamArchived(
        CreateLogDto createLogDto,
        Team team);

    Task LogTeamRecovered(
        CreateLogDto createLogDto,
        Team team);

    Task LogTeamTransferred(
        CreateLogDto createLogDto, 
        Team team,
        int oldManagerId,
        int newManagerId);

    Task LogTeamEdited(
        CreateLogDto createLogDto,
        Team team,
        IEnumerable<int> removedUsers,
        IEnumerable<int> addedUsers);
}