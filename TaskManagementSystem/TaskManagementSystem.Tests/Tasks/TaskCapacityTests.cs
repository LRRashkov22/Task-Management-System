using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using TaskManagementSystem.Modules.Tasks.Application.DTOs;
using TaskManagementSystem.Modules.Tasks.Application.Services;

namespace TaskManagementSystem.Tests.Tasks;

public class TaskCapacityTests : IDisposable
{
    private static readonly DateTime Monday =
        new(2026, 6, 22, 8, 0, 0, DateTimeKind.Utc);

    private static readonly DateTime Friday =
        new(2026, 6, 26, 17, 0, 0, DateTimeKind.Utc);

    private static readonly DateTime NextMonday =
        new(2026, 6, 29, 17, 0, 0, DateTimeKind.Utc);

    private readonly TaskManagementDbContext _context;
    private readonly ManageTasks _service;

    public TaskCapacityTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagementDbContext(options);

        var manager = new User
        {
            Id = 1,
            Username = "Manager",
            PasswordHash = "password",
            Role = Role.Manager
        };
        var employee = new User
        {
            Id = 2,
            Username = "Ivan",
            PasswordHash = "password",
            Role = Role.Employee
        };
        var team = new Team
        {
            Id = 1,
            Name = "Capacity team",
            ManagerId = manager.Id,
            Manager = manager
        };

        _context.Users.AddRange(manager, employee);
        _context.Teams.Add(team);
        _context.TeamMemberships.Add(new TeamMembership
        {
            TeamId = team.Id,
            Team = team,
            UserId = employee.Id,
            User = employee
        });
        _context.SaveChanges();

        _service = new ManageTasks(
            _context,
            new NoOpTaskNotificationService(),
            new NoOpTaskLogger(),
            new FixedTimeProvider(Monday));
    }

    [Fact]
    public async Task FridayCapacity_AllowsExactlyFortyHours_ThenRejectsOneMore()
    {
        Assert.Null((await CreateTask(32, Friday, "Task A")).Item2);
        Assert.Null((await CreateTask(8, Friday, "Task B")).Item2);

        var result = await CreateTask(1, Friday, "Task C");

        Assert.Equal("Employee 2 exceeds capacity before deadline", result.Item2);
    }

    [Fact]
    public async Task LongerDeadline_ProvidesAdditionalWorkingDayCapacity()
    {
        Assert.Null((await CreateTask(32, Friday, "Task A")).Item2);

        var result = await CreateTask(16, Monday.AddMonths(3), "Task B");

        Assert.Null(result.Item2);
    }

    [Fact]
    public async Task NextMondayDeadline_AllowsFortyEightHours()
    {
        Assert.Null((await CreateTask(32, Friday, "Task A")).Item2);

        var result = await CreateTask(16, NextMonday, "Task B");

        Assert.Null(result.Item2);
    }

    [Fact]
    public async Task NextMondayDeadline_RejectsWorkloadAboveFortyEightHours()
    {
        Assert.Null((await CreateTask(35, Friday, "Task A")).Item2);

        var result = await CreateTask(16, NextMonday, "Task B");

        Assert.Equal("Employee 2 exceeds capacity before deadline", result.Item2);
    }

    [Fact]
    public async Task DoneTasks_DoNotConsumeCapacity()
    {
        Assert.Null((await CreateTask(32, Friday, "Task A")).Item2);

        var taskA = await _context.TaskItems.SingleAsync(task => task.Title == "Task A");
        taskA.Status = Status.Done;
        await _context.SaveChangesAsync();

        var result = await CreateTask(32, Friday, "Task B");

        Assert.Null(result.Item2);
    }

    private Task<(CreateTaskDto?, string?)> CreateTask(
        int estimatedHours,
        DateTime deadline,
        string title)
    {
        return _service.CreateTaskAsync(new CreateTaskDto
        {
            Title = title,
            Description = "Capacity test",
            Priority = Priority.Medium,
            Deadline = deadline,
            EstimatedHours = estimatedHours,
            TeamId = 1,
            Assignments = new[] { 2 }
        }, 1);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private sealed class FixedTimeProvider(DateTime utcNow) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => new(utcNow);
    }

    private sealed class NoOpTaskNotificationService : ITaskNotificationService
    {
        public Task NotifyTaskAssignedAsync(
            TaskItem task,
            IEnumerable<int> assignedUserIdss,
            string managerName) => Task.CompletedTask;

        public Task NotifyTaskRecoverAsync(TaskItem task) => Task.CompletedTask;
        public Task NotifyTaskArchivedAsync(TaskItem task, int userid) => Task.CompletedTask;
        public Task NotifyTaskTransferedAsync(
            TaskItem task,
            IEnumerable<int> oldAssignedUsers) => Task.CompletedTask;

        public Task NotifyTaskEditAsync(
            TaskItem task,
            IEnumerable<int> removedUsers,
            IEnumerable<int> addedUsers) => Task.CompletedTask;

        public Task NotifyCommentAddedAsync(
            TaskItem task,
            IEnumerable<int> asssignedUsers,
            string authorName) => Task.CompletedTask;

        public Task NotifyCommentMentionAsync(
            TaskItem task,
            string taggerName,
            IEnumerable<int> mentionedUsers) => Task.CompletedTask;
    }

    private sealed class NoOpTaskLogger : ITaskLogger
    {
        public Task TaskAssignedLog(
            CreateLogDto createLogDto,
            TaskItem task,
            IEnumerable<int> assignedUserIdss,
            string managerName) => Task.CompletedTask;

        public Task TaskRecoverLog(CreateLogDto createLogDto, TaskItem task) =>
            Task.CompletedTask;

        public Task TaskArchivedLog(CreateLogDto createLogDto, TaskItem task) =>
            Task.CompletedTask;

        public Task TaskTransferedLog(
            CreateLogDto createLogDto,
            TaskItem task,
            IEnumerable<int> oldAssignedUsers) => Task.CompletedTask;

        public Task TaskEditLog(
            CreateLogDto createLogDto,
            TaskItem task,
            IEnumerable<int> removedUsers,
            IEnumerable<int> addedUsers) => Task.CompletedTask;
    }
}
