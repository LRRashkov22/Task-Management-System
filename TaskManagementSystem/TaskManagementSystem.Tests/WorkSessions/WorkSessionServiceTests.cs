using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.WorkSessions.Application.DTOs;
using TaskManagementSystem.Modules.WorkSessions.Application.Services;

namespace TaskManagementSystem.Modules.WorkSessions.Tests;

public class WorkSessionServiceTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    private readonly WorkSessionService _service;

    public WorkSessionServiceTests()
    {
        // Setup an isolated In-Memory database configuration for every test execution
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagementDbContext(options);
        _service = new WorkSessionService(_context);
    }

    [Fact]
    public async Task GetAllSessionsAsync_ShouldReturnAllSessionsWithUsernames()
    {
        // Arrange
        var user1 = new User { Id = 1, Username = "Alice", PasswordHash = "hash1" };
        var user2 = new User { Id = 2, Username = "Bob", PasswordHash = "hash2" };

        var session1 = new WorkSession { Id = 10, TaskId = 100, UserId = 1, Hours = 5, Date = DateTime.UtcNow, User = user1, Description = "Task 1 QA" };
        var session2 = new WorkSession { Id = 11, TaskId = 101, UserId = 2, Hours = 3, Date = DateTime.UtcNow, User = user2, Description = "Task 1 Dev" };

        await _context.Users.AddRangeAsync(user1, user2);
        await _context.WorkSessions.AddRangeAsync(session1, session2);
        await _context.SaveChangesAsync();

        // Act
        var result = (await _service.GetAllSessionsAsync()).ToList();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);

        var firstResult = result.FirstOrDefault(r => r.Id == 10);
        Assert.NotNull(firstResult);
        Assert.Equal("Alice", firstResult.Username);
        Assert.Equal(5, firstResult.Hours);
    }

    [Fact]
    public async Task GetSessionsByTaskIdAsync_ShouldReturnOnlyMatchingTaskSessions()
    {
        // Arrange
        int targetTaskId = 55;
        var user = new User { Id = 3, Username = "Charlie", PasswordHash = "hash3" };
        var targetTask = new TaskItem
        {
            Id = targetTaskId,
            Title = "Target",
            CreatedById = user.Id,
            TeamId = null,
            Deadline = DateTime.UtcNow.AddDays(1)
        };

        var matchingSession = new WorkSession { Id = 20, TaskId = targetTaskId, UserId = 3, Hours = 4, Date = DateTime.UtcNow, User = user, Description = "Task 1 QA" };
        var otherSession = new WorkSession { Id = 21, TaskId = 999, UserId = 3, Hours = 2, Date = DateTime.UtcNow, User = user, Description = "Task 1 Dev" };

        await _context.Users.AddAsync(user);
        await _context.TaskItems.AddAsync(targetTask);
        await _context.WorkSessions.AddRangeAsync(matchingSession, otherSession);
        await _context.SaveChangesAsync();

        // Act
        var result =
            (await _service.GetSessionsByTaskIdAsync(targetTaskId, user.Id)).ToList();

        // Assert
        Assert.Single(result);
        Assert.Equal(20, result[0].Id);
        Assert.Equal(targetTaskId, result[0].TaskId);
        Assert.Equal("Charlie", result[0].Username);
    }

    [Fact]
    public async Task CreateSessionAsync_ShouldPersistSessionAndReturnCorrectDto()
    {
        // Arrange
        int testUserId = 99;
        var existingUser = new User { Id = testUserId, Username = "DeveloperX", PasswordHash = "securehash" };
        var personalTask = new TaskItem
        {
            Id = 500,
            Title = "Personal task",
            CreatedById = testUserId,
            TeamId = null,
            Deadline = DateTime.UtcNow.AddDays(1)
        };

        await _context.Users.AddAsync(existingUser);
        await _context.TaskItems.AddAsync(personalTask);
        await _context.SaveChangesAsync();

        var createDto = new CreateWorkSessionDto
        {
            TaskId = 500,
            Hours = 6,
            Description = "Refactoring legacy codebase"
        };

        // Act
        var result = await _service.CreateSessionAsync(createDto, testUserId);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.Id > 0); // Verify Identity generation
        Assert.Equal(500, result.TaskId);
        Assert.Equal(6, result.Hours);
        Assert.Equal("DeveloperX", result.Username);
        Assert.Equal("Refactoring legacy codebase", result.Description);

        // Verify database actually contains the record
        var dbSession = await _context.WorkSessions.FindAsync(result.Id);
        Assert.NotNull(dbSession);
        Assert.Equal(testUserId, dbSession.UserId);
        Assert.Equal(6, dbSession.Hours); // Cast explicitly checked as (int) in your production logic
    }

    [Fact]
    public async Task CreateSessionAsync_ShouldRejectUserWithoutTaskAccess()
    {
        // Arrange
        int nonExistentUserId = 9999;
        var createDto = new CreateWorkSessionDto
        {
            TaskId = 200,
            Hours = 2,
            Description = "Isolated entry"
        };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => _service.CreateSessionAsync(createDto, nonExistentUserId));
    }

    public void Dispose()
    {
        // Clean database footprint upon test conclusion
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
