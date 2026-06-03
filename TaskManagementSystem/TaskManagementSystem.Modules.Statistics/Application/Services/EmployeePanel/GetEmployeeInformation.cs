using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.AdminDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.EmployeeDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.Shared;
using TaskManagementSystem.Modules.Statistics.Application.Interfaces;

namespace TaskManagementSystem.Modules.Statistics.Application.Services.EmployeePanel;

public class GetEmployeeInformation : IGetEmployeeInformation
{
    private readonly TaskManagementDbContext context;

    public GetEmployeeInformation(TaskManagementDbContext context)
    {
        this.context = context;
    }

    public async Task<EmployeeDashboardDto> GetEmployeeDashboardAsync(int userid)
    {
        var tasks = await context.TaskItems
            .AsNoTracking()
            .Include(t => t.Assignments)
            .Where(t =>
                !t.IsArchived &&
                t.Assignments.Any(a => a.UserId == userid))
            .ToListAsync();

        var recentTasks = tasks
            .OrderByDescending(t => t.CreatedAt)
            .Take(3)
            .Select(t => new EmployeeRecentTaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Priority = t.Priority.ToString(),
                Status = t.Status.ToString(),
                Deadline = t.Deadline
            })
            .ToList();

        return new EmployeeDashboardDto
        {
            MyTasks = tasks.Count,

            InProgressTasks = tasks.Count(t =>
                t.Status == Status.InProgress),

            CompletedTasks = tasks.Count(t =>
                t.Status == Status.Done),

            OverdueTasks = tasks.Count(t =>
                t.Deadline < DateTime.UtcNow &&
                t.Status != Status.Done),

            TotalHoursLogged = 0,

            TasksCompleted = tasks.Count(t =>
                t.Status == Status.Done),

            AvgTimePerTask = 0,

            RecentTasks = recentTasks
        };
    }


    public async Task<List<EmployeeTaskPreviewDto>> GetEmployeeTasksPreviewAsync(int userid)
    {
        return await context.TaskItems
            .AsNoTracking()
            .Where(t =>
                !t.IsArchived &&
                t.Assignments.Any(a => a.UserId == userid))
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new EmployeeTaskPreviewDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status.ToString(),
                Priority = t.Priority.ToString(),
                CreatedAt = t.CreatedAt,
                Deadline = t.Deadline,
                WorkHours = t.WorkSessions.Sum(w => w.Hours)
            })
            .ToListAsync();
    }


    public async Task<TaskDetailsDto?> GetEmployeeTaskDetailsAsync( int taskId, int userid)
    {
        return await context.TaskItems
            .AsNoTracking()
            .Where(t =>
                t.Id == taskId &&
                !t.IsArchived &&
                t.Assignments.Any(a => a.UserId == userid))
            .Select(t => new TaskDetailsDto
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority.ToString(),
                Status = t.Status.ToString(),
                Deadline = t.Deadline,

                WorkHours = t.WorkSessions
                    .Sum(w => w.Hours),

                AssignedUsers = t.Assignments
                    .Select(a => new MemberDto
                    {
                        Id = a.UserId,
                        Username = a.User.Username
                    })
                    .ToList(),

                Comments = t.Comments
                    .OrderByDescending(c => c.CreatedAt)
                    .Select(c => new CommentDto
                    {
                        Id = c.Id,
                        Content = c.Content,
                        Username = c.User != null ? c.User.Username : "Deleted User",

                        CreatedAt = c.CreatedAt
                    })
                    .ToList(),

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

                        ChangedByUsername =
                            h.ChangedBy != null
                            ? h.ChangedBy.Username
                            : "Deleted User",

                        CreatedAt = h.CreatedAt
                    })
                    .ToList()
            })
            .FirstOrDefaultAsync();
    }

    public Task<List<GetCommentMentionedNamesDto>> GetCommentMentionSearchAsync(
        string? search,
        int taskId) =>
        GetSearchEmployees(search, taskId);

    public async Task<List<GetCommentMentionedNamesDto>> GetSearchEmployees(string? search, int taskId)
    {
        var query = context.Users
            .AsNoTracking()
            .Where(u =>
                u.Role == Role.Employee &&
                u.TaskAssignments.Any(a => a.TaskId == taskId));

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(u => u.Username.Contains(search));
        }

        return await query
            .OrderBy(u => u.Username)
            .Select(u => new GetCommentMentionedNamesDto
            {
                Id = u.Id,
                Username = u.Username,
            })
            .ToListAsync();
    }
}
