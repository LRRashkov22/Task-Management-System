using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using TaskManagementSystem.Modules.Tasks.Application.DTOs;

using TaskManagementSystem.Modules.Tasks.Application.Interfaces;
namespace TaskManagementSystem.Modules.Tasks.Application.Services;

public class ManageTasks : IManageTasks
{
    private readonly TaskManagementDbContext context;
    private readonly INotificationService notificationService;
    public ManageTasks(TaskManagementDbContext context, INotificationService notificationService)
    {
        this.context = context;
        this.notificationService = notificationService;
    }
    public async Task<List<TaskCardDto>> GetBoardTasks(int userid)
    {
        return await context.TaskItems
            .Where(t => !t.IsArchived &&
             t.Team.ManagerId == userid && !t.Team.IsArchived)
            .Select(t => new TaskCardDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority.ToString(),
                Status = t.Status.ToString(),
                Deadline = t.Deadline,
                AssignedEmployeesCount = t.Assignments.Count,
                WorkHours = t.WorkSessions.Sum(w => w.Hours)
            }).ToListAsync();  
    }

    public async Task<TaskDetailsDto?> GetTaskDetails(int taskId, int userid)
    {
        return await context.TaskItems
            .Where(t => t.Id == taskId &&
            t.Team.ManagerId == userid &&
             !t.Team.IsArchived)
            .Select(t => new TaskDetailsDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority.ToString(),
                Status = t.Status.ToString(),
                Deadline = t.Deadline,
                WorkHours = t.WorkSessions.Sum(w => w.Hours),
                AssignedUsers = t.Assignments
                    .Select(a => new MemberDto
                    {
                        Id = a.UserId,
                        Username = a.User.Username
                    }).ToList(),
                Comments = t.Comments
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new CommentDto
                    {
                        Id = c.Id,
                        Content = c.Content,
                         Username = c.User != null ? c.User.Username : "Deleted User",
                        CreatedAt = c.CreatedAt
                    }).ToList(),
                WorkSessions = t.WorkSessions
                    .OrderByDescending(w => w.Date)
                    .Select(w => new WorkSessionDto
                    {
                        Id = w.Id,
                        Hours = w.Hours,
                        Username = w.User != null ? w.User.Username : "Deleted User",
                        Date = w.Date
                    })
                    .ToList(),
                History = t.History
                    .OrderByDescending(h => h.CreatedAt)
                    .Select(h => new TaskHistoryDto
                    {
                        Id = h.Id,
                        Action = h.Action,
                        OldValue = h.OldValue,
                        NewValue = h.NewValue,
                        ChangedByUsername = h.ChangedBy != null ? h.ChangedBy.Username : "Deleted User",
                        CreatedAt = h.CreatedAt
                    })
                    .ToList()
            }).FirstOrDefaultAsync();
    }
    public async Task<List<GetArchivedTaskDto>> GetAdminArchivedTasks()
    {
        var tasks = await context.TaskItems
        .Where(t => t.IsArchived)
        .Include(t => t.Assignments)
        .Include(t => t.CreatedBy)
        .Include(t => t.Team)
        .ToListAsync();

        return tasks.Select(t => new GetArchivedTaskDto
        {
            Id = t.Id,
            Title = t.Title,
            TeamName = t.Team.Name,
            ManagerName = t.CreatedBy!.Username, 
            AssignedEmployeesCount = t.Assignments.Count
        }).ToList();
    }

    public async Task<(CreateTaskDto?, string?)> CreateTaskAsync(CreateTaskDto request, int userid) {
        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Description) ||
            request.Deadline < DateTime.UtcNow)
            return (null, "Title and description are required. Deadline cannot be in the past");

        bool teamExist = await context.Teams.AsNoTracking()
            .AnyAsync(t => t.Id == request.TeamId && !t.IsArchived);
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
            Status = Data.Domain.Enums.Status.ToDo,
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

        //SignalR
        foreach (var memberId in request.Assignments)
        {
            await notificationService.SendNotificationAsync(memberId,
                $"You were assigned to task: {task.Title}");
        }
        return (request, null);
    }
    public async Task<(bool isDeleted, string? error)> ArchiveTask(RecoverOrArchiveDto request,int userid)
    {
        var task = await context.TaskItems
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t =>
                t.Id == request.Id &&
                t.Team.ManagerId == userid);

        if (task == null)
            return (false, "Task not found");

        if (task.IsArchived)
            return (false, "Task already archived");

        task.IsArchived = true;

        await context.SaveChangesAsync();

        //SignalR
        foreach (var memberId in task.Assignments)
        {
            await notificationService.SendNotificationAsync(memberId.UserId,
                $"Task: {task.Title} were deleted");
        }
        await notificationService.SendNotificationAsync(userid,
                 $"Task: {task.Title} were deleted");
        return (true, null);
    }

    public async Task<(bool? status, string? error)> TransferTaskAsync(TransferTaskDto request,int userid, bool isAdmin)
    {
        using var transaction =
            await context.Database.BeginTransactionAsync();
        try
        {
            var task = await context.TaskItems
                .Include(t => t.Assignments)
                .Include(t => t.Team)
                    .ThenInclude(team => team.Manager)
                .Include(t => t.History)
                .FirstOrDefaultAsync(t => t.Id == request.TaskId);
            
            if (task == null)
                return (false, "Task not found");

            if (task.IsArchived)
                return (false, "Cannot transfer archived task");

            var newTeam = await context.Teams
                .FirstOrDefaultAsync(t =>
                    t.Id == request.NewTeamId &&
                    !t.IsArchived);

            if (newTeam == null)
                return (false, "New team not found");

            if (!isAdmin && task.Team.ManagerId != userid)
                return (false, "You do not own this task");

            if (!isAdmin && newTeam.ManagerId != userid)
                return (false, "You can transfer only to your own teams");

            var assignments = request.Assignments.Distinct().ToList();
            var validAssignmentsCount = await context.TeamMemberships
                .CountAsync(tm =>
                    tm.TeamId == request.NewTeamId &&
                    assignments.Contains(tm.UserId));

            if (validAssignmentsCount != assignments.Count)
            {
                return (false, "Some users are not part of the new team");
            }
            var oldAssignedUsers = task.Assignments.Select(a => a.UserId).ToList();

            var oldTeamId = task.TeamId;

            task.TeamId = request.NewTeamId;
            var oldManagerName = task.Team.Manager.Username;
            context.TaskAssignments.RemoveRange(task.Assignments);
            task.Assignments.Clear();

            foreach (var userId in request.Assignments)
            {
                task.Assignments.Add(new TaskAssignment
                {
                    UserId = userId
                });
            }

            task.History.Add(new TaskHistory
            {
                Action = "Task transferred",
                OldValue = $"Team {oldTeamId}",
                NewValue = $"Team {request.NewTeamId}",
                ChangedById = userid,
                CreatedAt = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
            
            await transaction.CommitAsync();

            //SignalR

                await notificationService.SendNotificationAsync(
                    newTeam.ManagerId,
                    $"Task: {task.Title} was transfered to you by {oldManagerName}");

            foreach (var userId in oldAssignedUsers)
            {
                await notificationService.SendNotificationAsync(
                    userId,
                    $"You were unassigned from task: {task.Title}");
            }

            return (true, null);

        } catch (Exception) {

            await transaction.RollbackAsync();

            return (false, "Transfer failed");
        }
    }
    

    public async Task<(bool status, string? error)> AdminRecoverTask(RecoverOrArchiveDto request)
    {
        var task = await context.TaskItems
            .Include(t => t.Team)
                .ThenInclude(t => t.ManagerId)
            .Where(t => t.IsArchived).FirstAsync(t => t.Id == request.Id);
        if (task.Team.IsArchived == true) return (false, "Cannot recover task due it's team is archived");
        task.IsArchived = false;
        
        await context.SaveChangesAsync();
            //SignalR 
            await notificationService.SendNotificationAsync(
                task.Team.ManagerId,
                $"Your task: {task.Title} was recovered");
        return (true, null);
    }

    public async Task<(bool status, string? error)> DeleteArchivedTaskAsync(int taskId)
    {
        var task = await context.TaskItems
            .FirstOrDefaultAsync(t =>
                t.Id == taskId &&
                t.IsArchived);

        if (task == null)
            return (false, "Archived task not found");

        context.TaskItems.Remove(task);

        await context.SaveChangesAsync();

        return (true, null);
    }
    public async Task<(bool?, string?)> ChangeStausOnTaskAsync(int userid, int taskid,ChangeStatusOnTaskDto request)
    {
        var task = await context.TaskItems
            .Include(t => t.Team)
            .FirstOrDefaultAsync(t => t.Team.ManagerId == userid &&
            t.Id == taskid
            && !t.IsArchived);

        if (task == null) return (null, "No task was found");
        
        task.Status = request.status;

        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool?, string?)> EditTaskAsync(int userid, int taskid, EditTaskDto request)
    {
        var task = await context.TaskItems
            .Include(t => t.Team)
            .Include(t => t.Assignments)
            .FirstOrDefaultAsync(t =>
                t.Team.ManagerId == userid &&
                t.Id == taskid &&
                !t.IsArchived);

        if (task == null) return (null, "No task was found");

        if (!string.IsNullOrWhiteSpace(request.Name)) task.Title = request.Name;

        if (!string.IsNullOrWhiteSpace(request.Description))  task.Description = request.Description;

        if (request.Deadline.HasValue) task.Deadline = request.Deadline.Value;

        if (request.Members != null)
        {
            var oldAssignedUserIds = task.Assignments
                  .Select(a => a.UserId)
                  .ToList();

            var newAssignedUserIds = request.Members
                .Distinct()
                .ToList();

            var removedUsers = oldAssignedUserIds
                .Except(newAssignedUserIds)
                .ToList();

            var addedUsers = newAssignedUserIds
                .Except(oldAssignedUserIds)
                .ToList();

            context.TaskAssignments.RemoveRange(task.Assignments);

            task.Assignments.Clear();

            foreach (var memberId in newAssignedUserIds)
            {
                task.Assignments.Add(new TaskAssignment
                {
                    UserId = memberId
                });
            }

            await context.SaveChangesAsync();
            //SignalR
            foreach (var userId in removedUsers)
            {
                await notificationService.SendNotificationAsync(
                    userId,
                    $"You were unassigned from task: {task.Title}");
            }
            //SignalR
            foreach (var userId in addedUsers)
            {
                await notificationService.SendNotificationAsync(
                    userId,
                    $"You were assigned to task: {task.Title}");
            }
        }
        else
        {
            await context.SaveChangesAsync();
        }

        return (true, null);
    }

}
