using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics; // Required for suppressing the transaction warning
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using TaskManagementSystem.Modules.Teams.Application.DTOs;
using TaskManagementSystem.Modules.Teams.Application.Services;
using Xunit;

namespace TaskManagementSystem.Tests.Teams;

public class CrudTeamServiceTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    private readonly Mock<ITeamNotificationService> _mockNotificationService;
    private readonly Mock<ITeamLogger> _mockLogger;
    private readonly CRUDTeamService _service;
    
    private const int CurrentManagerId = 1;
    private const int OtherManagerId = 2;

    public CrudTeamServiceTests()
    {
        // Setup fresh In-Memory database for every single test instance
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            // Instruct EF Core to bypass/ignore implicit transaction errors caused by .BeginTransactionAsync()
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new TaskManagementDbContext(options);
        _mockNotificationService = new Mock<ITeamNotificationService>();
        _mockLogger = new Mock<ITeamLogger>();

        _service = new CRUDTeamService(_context, _mockNotificationService.Object, _mockLogger.Object);
        
        SeedDatabase();
    }

    private void SeedDatabase()
    {
        // Seed standard users
        var manager = new User { Id = CurrentManagerId, Username = "Manager1", Role = Role.Manager };
        var otherManager = new User { Id = OtherManagerId, Username = "Manager2", Role = Role.Manager };
        var employee1 = new User { Id = 10, Username = "Emp1", ManagerId = CurrentManagerId };
        var employee2 = new User { Id = 11, Username = "Emp2", ManagerId = CurrentManagerId };
        var foreignEmployee = new User { Id = 20, Username = "Emp3", ManagerId = OtherManagerId };

        _context.Users.AddRange(manager, otherManager, employee1, employee2, foreignEmployee);

        // Seed an existing team
        var existingTeam = new Team { Id = 100, Name = "Existing Team", ManagerId = CurrentManagerId };
        existingTeam.Memberships.Add(new TeamMembership { UserId = 10 });
        _context.Teams.Add(existingTeam);

        // Seed an archived team
        var archivedTeam = new Team { Id = 200, Name = "Archived Team", ManagerId = CurrentManagerId, IsArchived = true };
        _context.Teams.Add(archivedTeam);

        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    #region CreateTeamAsync Tests

    [Fact]
    public async Task CreateTeamAsync_ShouldFail_WhenNameAlreadyExists()
    {
        var dto = new CreateTeamDto { Name = "Existing Team", MemberIds = new List<int> { 10 } };

        var (team, error) = await _service.CreateTeamAsync(dto, CurrentManagerId);

        Assert.Null(team);
        Assert.Equal("this name is already taken", error);
    }

    [Fact]
    public async Task CreateTeamAsync_ShouldFail_WhenNameIsEmpty()
    {
        var dto = new CreateTeamDto { Name = string.Empty, MemberIds = new List<int> { 10 } };

        var (team, error) = await _service.CreateTeamAsync(dto, CurrentManagerId);

        Assert.Null(team);
        Assert.Equal("Name cannot be empty", error);
    }

    [Fact]
    public async Task CreateTeamAsync_ShouldFail_WhenEmployeeBelongsToOtherManager()
    {
        // Member 20 belongs to OtherManagerId
        var dto = new CreateTeamDto { Name = "New Team", MemberIds = new List<int> { 10, 20 } };

        var (team, error) = await _service.CreateTeamAsync(dto, CurrentManagerId);

        Assert.Null(team);
        Assert.Equal("Some users do not belong to this manager", error);
    }

    [Fact]
    public async Task CreateTeamAsync_ShouldSucceed_AndTriggerNotificationsAndLogs()
    {
        var dto = new CreateTeamDto { Name = "Unique New Team", MemberIds = new List<int> { 10, 11 } };

        var (team, error) = await _service.CreateTeamAsync(dto, CurrentManagerId);

        Assert.NotNull(team);
        Assert.Null(error);
        Assert.Equal("Unique New Team", team.Name);
        Assert.Equal(2, team.Memberships.Count);

        // Verify side effects
        _mockNotificationService.Verify(x => x.NotifyCreateTeamAsync(team, dto.MemberIds, "Manager1"), Times.Once);
        _mockLogger.Verify(x => x.LogCreateTeam(It.IsAny<CreateLogDto>(), team, dto.MemberIds, "Manager1"), Times.Once);
    }

    #endregion

    #region TransferTeamAsync Tests

    [Fact]
    public async Task TransferTeamAsync_ShouldFail_WhenUserIsNotAdminAndDoesNotOwnTeam()
    {
        var dto = new TransferDto { TeamId = 100, NewManagerId = OtherManagerId };

        // Calling with user ID 999 who is not an admin and doesn't own team 100
        var (status, error) = await _service.TransferTeamAsync(dto, userid: 999, isAdmin: false);

        Assert.False(status);
        Assert.Equal("You do not own this team", error);
    }

    [Fact]
    public async Task TransferTeamAsync_ShouldSucceed_WhenUserIsAdmin()
    {
        var dto = new TransferDto { TeamId = 100, NewManagerId = OtherManagerId };

        var (status, error) = await _service.TransferTeamAsync(dto, userid: 999, isAdmin: true);

        Assert.True(status);
        Assert.Null(error);
        
        var updatedTeam = await _context.Teams.FindAsync(100);
        Assert.Equal(OtherManagerId, updatedTeam.ManagerId);
        Assert.Empty(updatedTeam.Memberships); // Should clear existing memberships
    }

    #endregion

    #region UpdateTeamAsync Tests

    [Fact]
    public async Task UpdateTeamAsync_ShouldCorrectlySyncMemberships()
    {
        var dto = new EditTeamDto 
        { 
            Id = 100, 
            Name = "Updated Team Name", 
            Members = new List<int> { 11 } // Remove 10, Add 11
        };

        var (response, error) = await _service.UpdateTeamAsync(dto, CurrentManagerId);

        Assert.NotNull(response);
        Assert.Null(error);
        Assert.Equal("Updated Team Name", response.Name);
        Assert.Single(response.Members);
        Assert.Equal(11, response.Members.First().Id);

        _mockNotificationService.Verify(x => x.NotifyTeamEditedAsync(It.IsAny<Team>(), It.IsAny<List<int>>(), It.IsAny<List<int>>()), Times.Once);
    }

    #endregion

    #region Archive and Delete Tests

    [Fact]
    public async Task ArchiveTeam_ShouldArchiveTeamAndAllItsTasks()
    {
        // Add explicit active task to Team 100
        var task = new TaskItem { Id = 50, Title = "Task 1", TeamId = 100, IsArchived = false };
        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        var dto = new RecoverOrArchiveDto { Id = 100 };
        var (isDeleted, error) = await _service.ArchiveTeam(dto, CurrentManagerId);

        Assert.True(isDeleted);
        Assert.Null(error);
        
        var updatedTeam = await _context.Teams.Include(t => t.Tasks).FirstAsync(t => t.Id == 100);
        Assert.True(updatedTeam.IsArchived);
        Assert.True(updatedTeam.Tasks.First().IsArchived);
    }

    [Fact]
    public async Task DeleteArchivedTeamAsync_ShouldFail_WhenTeamHasActiveTasks()
    {
        // Add an unarchived task to an archived team
        var activeTask = new TaskItem { Id = 60, Title = "Active Task", TeamId = 200, IsArchived = false };
        _context.TaskItems.Add(activeTask);
        await _context.SaveChangesAsync();

        var (status, error) = await _service.DeleteArchivedTeamAsync(200, CurrentManagerId);

        Assert.False(status);
        Assert.Equal("Cannot delete team with active tasks", error);
    }

    [Fact]
    public async Task DeleteArchivedTeamAsync_ShouldSucceed_WhenAllTasksAreArchived()
    {
        var archivedTask = new TaskItem { Id = 70, Title = "Archived Task", TeamId = 200, IsArchived = true };
        _context.TaskItems.Add(archivedTask);
        await _context.SaveChangesAsync();

        var (status, error) = await _service.DeleteArchivedTeamAsync(200, CurrentManagerId);

        Assert.True(status);
        Assert.Null(error);
        Assert.Null(await _context.Teams.FindAsync(200));
    }

    #endregion
}