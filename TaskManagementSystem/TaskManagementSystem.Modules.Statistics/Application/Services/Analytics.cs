using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Text;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTOs;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.Interfaces;
namespace TaskManagementSystem.Modules.Statistics.Application.Services;


public class GetManagerAnalytics : IGetManagerAnalytics
{
    private readonly TaskManagementDbContext context;

    public GetManagerAnalytics(
        TaskManagementDbContext context)
    {
        this.context = context;
    }

    public async Task<ManagerAnalyticsDashboardDto> GetAnalyticsDashboardAsync(int managerId)
    {

        // Cards

        var totalTasks = await context.TaskItems
            .CountAsync(t =>
                t.Team.ManagerId == managerId);

        var completedTasks = await context.TaskItems
            .CountAsync(t =>
                t.Team.ManagerId == managerId &&
                t.Status == Status.Done);

        var totalHours = await context.WorkSessions
            .Where(w =>
                w.TaskItem.Team.ManagerId == managerId)
            .SumAsync(w => (int?)w.Hours) ?? 0;

        var completionRate =
            totalTasks == 0
                ? 0
                : Math.Round(
                    (double)completedTasks /
                    totalTasks * 100,
                    2);

        // Tasks By Status

        var statusData = await context.TaskItems
            .Where(t =>
                t.Team.ManagerId == managerId)
            .GroupBy(t => t.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        // Tasks By Priority

        var priorityData = await context.TaskItems
            .Where(t =>
                t.Team.ManagerId == managerId)
            .GroupBy(t => t.Priority)
            .Select(g => new
            {
                Priority = g.Key,
                Count = g.Count()
            })
            .ToListAsync();

        // Productivity

        var productivity = await context.Users
            .Where(u =>
                u.Role == Role.Employee &&
                u.ManagerId == managerId)
            .Select(u => new UserProductivityDto
            {
                UserId = u.Id,

                Username = u.Username,

                CompletedTasks =
                    u.TaskAssignments.Count(a =>
                        a.TaskItem.Status == Status.Done),

                HoursLogged =
                    u.WorkSessions.Sum(w => w.Hours)
            })
            .OrderByDescending(x =>
                x.CompletedTasks)
            .ToListAsync();

        // Result
      
        return new ManagerAnalyticsDashboardDto
        {
            Cards = new AnalyticsCardsDto
            {
                TasksCompleted = completedTasks,
                TotalHours = totalHours,
                CompletionRate = completionRate
            },

            TasksByStatus = new TasksByStatusDto
            {
                Todo =
                    statusData.FirstOrDefault(
                        x => x.Status == Status.ToDo)
                    ?.Count ?? 0,

                InProgress =
                    statusData.FirstOrDefault(
                        x => x.Status == Status.InProgress)
                    ?.Count ?? 0,

                Review =
                    statusData.FirstOrDefault(
                        x => x.Status == Status.Review)
                    ?.Count ?? 0,

                Done =
                    statusData.FirstOrDefault(
                        x => x.Status == Status.Done)
                    ?.Count ?? 0
            },

            TasksByPriority = new TasksByPriorityDto
            {
                Low =
                    priorityData.FirstOrDefault(
                        x => x.Priority == Priority.Low)
                    ?.Count ?? 0,

                Medium =
                    priorityData.FirstOrDefault(
                        x => x.Priority == Priority.Medium)
                    ?.Count ?? 0,

                High =
                    priorityData.FirstOrDefault(
                        x => x.Priority == Priority.High)
                    ?.Count ?? 0
            },

            Productivity = productivity
        };
    }
}