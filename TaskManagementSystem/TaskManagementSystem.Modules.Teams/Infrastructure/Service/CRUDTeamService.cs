using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Teams.Application.Dto_s;
using TaskManagementSystem.Modules.Teams.Application.Interfaces;
namespace TaskManagementSystem.Modules.Teams.Infrastructure.Service;

public class CRUDTeamService : ICRUDTeamService
{
    private readonly TaskManagementDbContext context;
    public CRUDTeamService(TaskManagementDbContext context)
    {
        this.context = context;
    }

    public async Task<(Team? team, string? error)> CreateTeamAsync(CreateTeamDto request, int userid)
    {
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

        var team = new TaskManagementSystem.Data.Domain.Entities.Team
        {
            Name = request.Name,
            ManagerId = request.ManagerId,
        };
        foreach (var memberId in request.MemberIds)
        {
            team.Memberships.Add(new TeamMembership
            {
                UserId = memberId
            });
        }
        context.Teams.Add(team);
        await context.SaveChangesAsync();
        return (team, null);
    }
 

    public async Task<(EditTeamResponseDto? teams, string? error)> UpdateTeamAsync(EditTeamDto request) {

        var team = await context.Teams
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == request.Id);

        if (team == null)
            return (null, "No teams found");
        if (request.Name != null) team.Name = request.Name;
        
        if (request.Members != null && request.Members.Count != 0) {
            var currentMemberIds = team.Memberships.Select(n => n.UserId).ToList();

            var requestMemberIds = request.Members.ToList();

            var membersToRemove = team.Memberships
                .Where(m => !requestMemberIds.Contains(m.UserId))
                .ToList();

            var membersToAdd = request.Members
                .Where(m => !currentMemberIds.Contains(m))
                .ToList();

            context.TeamMemberships.RemoveRange(membersToRemove);
            foreach (var member in membersToAdd)
            {
                team.Memberships.Add(new TeamMembership
                {
                    UserId = member,
                    TeamId = team.Id
                });
            }

        }
        await context.SaveChangesAsync();

        team = await context.Teams.AsNoTracking()
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .FirstAsync(t => t.Id == team.Id);
        return (new EditTeamResponseDto
        {
            Id = team.Id,
            Name = team.Name,
            Members = team.Memberships
        .Select(m => new MemberDto
        {
            Id = m.UserId,
            Username = m.User.Username
        }).ToList()}, null);
    }

    public async Task<(bool isDeleted, string? error)> DeleteTeam(int id)
    {
        var team = await context.Teams
            .Include(t => t.Memberships)
            .Include(t => t.Tasks)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (team == null)
            return (false, "Team not found");

        // if team has tasks do not allow delete
         if (team.Tasks != null && team.Tasks.Any())
             return (false, "Cannot delete team with tasks");

        context.TeamMemberships.RemoveRange(team.Memberships);

        context.Teams.Remove(team);

        await context.SaveChangesAsync();

        return (true, null);
    }
}
