using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Teams.Application.Dto_s;
namespace TaskManagementSystem.Modules.Teams.Application.Interfaces
{
    public interface ICRUDTeamService
    {
        Task<(EditTeamResponseDto? teams, string? error)> UpdateTeamAsync(EditTeamDto request);
        Task<(Team? team, string? error)> CreateTeamAsync(CreateTeamDto request, int userid);

        Task<(bool isDeleted, string? error)> DeleteTeam(int id);

    }
}
