using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.Statistics.Application.DTO_s.ManagersDto;
using TaskManagementSystem.Modules.Teams.Application.DTOs;

namespace TaskManagementSystem.Modules.Teams.Application.Interfaces;

public interface ICRUDTeamService
{
    Task<bool> AdminRecoverTeam(RecoverOrArchiveDto request);
    Task<(Team? team, string? error)> CreateTeamAsync(CreateTeamDto request, int userid);
    Task<(EditTeamResponseDto? team, string? error)> UpdateTeamAsync(EditTeamDto request, int userid);
    Task<(bool isDeleted, string? error)> ArchiveTeam(RecoverOrArchiveDto request, int userid);
    Task<(bool? status, string? error)> TransferTeamAsync(TransferDto request, int userid, bool isAdmin);
    Task<(bool status, string? error)> DeleteArchivedTeamAsync(int teamId);
}
