using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Teams.Application.Dto_s;
namespace TaskManagementSystem.Modules.Teams.Application.Interfaces
{
    public interface ICRUDTeamService
    {
        Task<(Team? team, string? error)> CreateTeamAsync(CreateTeamDto request, int userid);
        //Task<(GetTeamDto? team, string? error)> GetTeamById(int id);
        Task<List<GetTeamDto>> GetAllTeams(int userid);
        //Task<(GetTeamDto? team, string? error)> UpdateTeam(EditTeamDto request);
        //Task<(bool isDeleted, string? error)> DeleteTeam(int id);

    }
}
