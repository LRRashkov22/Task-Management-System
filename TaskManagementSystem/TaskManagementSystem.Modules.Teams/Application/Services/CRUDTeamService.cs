using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using TaskManagementSystem.Modules.Notification.Application.Services;
using TaskManagementSystem.Modules.Teams.Application.DTOs;
using TaskManagementSystem.Modules.Teams.Application.Interfaces;
namespace TaskManagementSystem.Modules.Teams.Application.Services;

public class CRUDTeamService : ICRUDTeamService
{
    private readonly TaskManagementDbContext context;
    private readonly ITeamNotificationService teamNotificationService;
    public CRUDTeamService(TaskManagementDbContext context, ITeamNotificationService teamNotificationService)
    {
        this.context = context;
        this.teamNotificationService = teamNotificationService;
    }

    public async Task<(Team? team, string? error)> CreateTeamAsync(CreateTeamDto request, int userid)
    {
        var teamName = await context.Teams.AsNoTracking().AnyAsync(t => request.Name == t.Name);
        if (teamName) return (null, "this name is already taken");
        if (request.Name == string.Empty) return (null, "Name cannot be empty");
        var managerExists = await context.Users.AnyAsync(m => m.Id == userid);
        if (!managerExists) return (null, "Manager not found");
        if (!request.MemberIds.Any()) return (null, "Must assing at least one employee");
        var validUsersCount = await context.Users
            .CountAsync(x =>
                request.MemberIds.Contains(x.Id) &&
                x.ManagerId == userid);

        if (validUsersCount != request.MemberIds.Count)
            return (null, "Some users do not belong to this manager");

        var team = new Team
        {
            Name = request.Name,
            ManagerId = userid
        };
        foreach (var memberId in request.MemberIds)
        {
            team.Memberships.Add(new TeamMembership
            {
                UserId = memberId
            });
        }
        var managerName = await context.Users
            .AsNoTracking()
            .Where(m => m.Id == userid)
            .Select(m => m.Username)
            .FirstAsync();

        context.Teams.Add(team);
        await context.SaveChangesAsync();
        await teamNotificationService.NotifyCreateTeamAsync(team, request.MemberIds, managerName);
        return (team, null);
    }

    public async Task<(bool? status, string? error)> TransferTeamAsync(TransferDto request,int userid,bool isAdmin)
    {
        await using var transaction = await context.Database.BeginTransactionAsync();

        try
        {
            var team = await context.Teams
                .Include(t => t.Memberships)
                .Include(t => t.Tasks)
                    .ThenInclude(t => t.Assignments)
                .FirstOrDefaultAsync(t => t.Id == request.TeamId);

            if (team == null) return (false, "Team not found");

            if (!isAdmin && team.ManagerId != userid) return (false, "You do not own this team");
            

            var managerExists = await context.Users
                .AnyAsync(u =>
                    u.Id == request.NewManagerId &&
                    u.Role == Role.Manager);

            if (!managerExists) return (false, "New manager not found");

            team.ManagerId = request.NewManagerId;

            context.TeamMemberships.RemoveRange(team.Memberships);

            foreach (var task in team.Tasks)
            {
                context.TaskAssignments.RemoveRange(task.Assignments);
            }
            await context.SaveChangesAsync();
            await transaction.CommitAsync();
            await teamNotificationService.NotifyTeamTransferredAsync(team, userid, request.NewManagerId);

            return (true, null);
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();

            return (false, "Transfer failed");
        }
    }

    public async Task<(EditTeamResponseDto? team, string? error)> UpdateTeamAsync(EditTeamDto request, int userid)
    {
        var team = await context.Teams
            .Where(t => !t.IsArchived && t.ManagerId == userid)
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == request.Id);

        if (team == null) return (null, "Team not found");

        if (!string.IsNullOrWhiteSpace(request.Name)) team.Name = request.Name;      
        if (request.Members != null)
        {
            var validUsersCount = await context.Users
                .CountAsync(u =>
                    request.Members.Contains(u.Id) &&
                    u.ManagerId == userid);

            if (validUsersCount != request.Members.Count)
            {
                return (null, "Some users do not belong to this manager");
            }

            var currentMemberIds = team.Memberships
                .Select(m => m.UserId)
                .ToList();

            var requestMemberIds = request.Members.ToList();

            var membersToRemove = team.Memberships
                .Where(m => !requestMemberIds.Contains(m.UserId))
                .ToList();
            var memebreToRemoveIds = membersToRemove.Select(m => m.UserId).ToList();

            var membersToAdd = requestMemberIds
                .Where(id => !currentMemberIds.Contains(id))
                .ToList();

            context.TeamMemberships.RemoveRange(membersToRemove);

            foreach (var memberId in membersToAdd)
            {
                team.Memberships.Add(new TeamMembership
                {
                    TeamId = team.Id,
                    UserId = memberId
                });
             
            }
            await teamNotificationService.NotifyTeamEditedAsync(team, memebreToRemoveIds, membersToAdd);
        }

        await context.SaveChangesAsync();


        await context.Entry(team)
    .Collection(t => t.Memberships)
    .Query()
    .Include(m => m.User)
    .LoadAsync();

        var response = new EditTeamResponseDto
        {
            Id = team.Id,
            Name = team.Name,

            Members = team.Memberships
                .Select(m => new MemberDto
                {
                    Id = m.UserId,
                    Username = m.User.Username
                })
                .ToList()
        };

        return (response, null);
    }

    public async Task<(bool isDeleted, string? error)> ArchiveTeam(RecoverOrArchiveDto request, int userid)
    {
        var team = await context.Teams
            .Where(t => t.ManagerId == userid)
            .Include(t => t.Memberships)
            .Include(t => t.Tasks)
            .FirstOrDefaultAsync(t => t.Id == request.Id);

        if (team == null)
            return (false, "Team not found");
        if (team.IsArchived)
            return (false, "Team already archived");
        team.IsArchived = true;
        foreach (var task in team.Tasks)
        {
            task.IsArchived = true;
        }
        await teamNotificationService.NotifyTeamArchivedAsync(team);
        await context.SaveChangesAsync();

        return (true, null);
    }
    public async Task<bool> AdminRecoverTeam(RecoverOrArchiveDto request) {
       
        var team = await context.Teams.Where(t => t.IsArchived)
            .Include(t => t.Tasks)
            .FirstOrDefaultAsync(t => t.Id == request.Id);

        if (team == null) return false;

        team.IsArchived = false;
        var savedChanges = await context.SaveChangesAsync();
        await teamNotificationService.NotifyTeamRecoveredAsync(team);
        return savedChanges > 0;
    }


    public async Task<(bool status, string? error)> DeleteArchivedTeamAsync(int teamId)
    {
        var team = await context.Teams
            .Include(t => t.Tasks)
            .FirstOrDefaultAsync(t => t.Id == teamId && t.IsArchived);

        if (team == null) return (false, "Archived team not found");
        if (team.Tasks.Any(t => !t.IsArchived))
        {
            return (false,
                "Cannot delete team with active tasks");
        }

        context.TaskItems.RemoveRange(team.Tasks);
        context.Teams.Remove(team);

        await context.SaveChangesAsync();

        return (true, null);
    }
}
