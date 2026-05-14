using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Tasks.Application.Dto;
using TaskManagementSystem.Modules.Tasks.Application.Interface;
namespace TaskManagementSystem.Modules.Tasks.Infrastructure.Service;

public class ManageTasks : IManageTasks
{
    private readonly TaskManagementDbContext context;
    public ManageTasks(TaskManagementDbContext context)
    {
        this.context = context;
    }

    public async Task<(CreateTaskDto?, string?)> CreateTaskAsync(CreateTaskDto request, int userid) {

        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Description) ||
            request.Deadline < DateTime.UtcNow)
            return (null, "Title and description are required. Deadline cannot be in the past");

        bool teamExist = await context.Teams.AsNoTracking()
            .AnyAsync(t => t.Id == request.TeamId);
        if (!teamExist) return (null, "team not found");

        var managerOwnership = await context.Teams.AsNoTracking()
            .AnyAsync(m => m.Id == request.TeamId && m.ManagerId == userid);
        if (!managerOwnership) return (null, "You do not own this team");

        if (request.Assignments.Count == 0)
            return (null, "At least one assignment is required");

        var validAssignmentsCount = await context.TeamMemberships.AsNoTracking()
            .CountAsync(tm =>
                tm.TeamId == request.TeamId &&
                request.Assignments.Contains(tm.UserId));

        if (validAssignmentsCount != request.Assignments.Count)
        {
            return (null, "Some assigned users are not part of the team");
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            CreatedAt = DateTime.UtcNow,
            Deadline = request.Deadline,
            TeamId = request.TeamId,
            CreatedById = userid
        };
        foreach (var memberId in request.Assignments)
        {
            task.Assignments.Add(new TaskAssignment 
            {
                UserId = memberId
            });
        }
        context.TaskItems.Add(task);
        await context.SaveChangesAsync();
        return (request, null);
    }



}
