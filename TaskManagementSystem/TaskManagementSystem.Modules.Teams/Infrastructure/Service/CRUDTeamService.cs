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
    public async Task<List<GetTeamDto>> GetAllTeamsAsync(int userid)
    {
        var managerExists = await context.Users.AnyAsync(m => m.Id == userid);
        // if (!managerExists) throw new Exception("Error finding teams");
        var teams = await context.Teams
            .Include(t => t.Manager)
            .Include(t => t.Memberships)
                .ThenInclude(m => m.User)
            .Include(t => t.Tasks)
            .Where(t => t.ManagerId == userid)
            .ToListAsync();

        return teams.Select(t => new GetTeamDto
        {
            Id = t.Id,
            Name = t.Name,
            ManagerId = t.ManagerId,
            ManagerUsername = t.Manager.Username,
            Members = t.Memberships.Select(m =>
            new MemberDto
            {
                Id = m.UserId,
                Username = m.User.Username
            }).ToList(),
            Tasks = t.Tasks!.Select(task =>
            new TaskDto
            {
                Id = task.Id,
                Title = task.Title
            }).ToList()
        }).ToList();
    }

    public async Task<(EditTeamDto? teams, string? error)> UpdateTeamAsync(EditTeamDto request) {

        bool hasAnyTeam = await context.Teams.AsNoTracking().AnyAsync(t => request.Id == t.Id);
        if (!hasAnyTeam) return (null, "No teams found");

        var team = await context.Teams
            .Include(u => u.Memberships)
            .FirstAsync(t => request.Id == t.Id);

        if (request.Name != null) team.Name = request.Name;
        
        if (request.Members != null) {
            var currentMemberIds = team.Memberships.Select(n => n.UserId).ToList();

            var requestMemberIds = request.Members.Select(m => m.Id).ToList();

            var membersToRemove = team.Memberships
                .Where(m => !requestMemberIds.Contains(m.UserId))
                .ToList();

            var membersToAdd = request.Members
                .Where(m => !currentMemberIds.Contains(m.Id))
                .ToList();

            context.TeamMemberships.RemoveRange(membersToRemove);
            foreach (var member in membersToAdd)
            {
                team.Memberships.Add(new TeamMembership
                {
                    UserId = member.Id,
                    TeamId = team.Id
                });
            }
            await context.SaveChangesAsync();
        }
        return (null, "Erro Editing Team");


    }


    
}
