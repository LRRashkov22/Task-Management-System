using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Services;
using Xunit;

namespace TaskManagementSystem.Tests.Logs;

public class LogsModuleUnitTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    
    // Services under test
    private readonly CRUDLogService _crudLogService;
    private readonly IdentityLogger _identityLogger;
    private readonly TaskLogger _taskLogger;
    private readonly TeamLogger _teamLogger;

    private const int AdminUserId = 1;
    private const int ManagerUserId = 2;
    private const int EmployeeUserId1 = 3;
    private const int EmployeeUserId2 = 4;

    public LogsModuleUnitTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new TaskManagementDbContext(options);

        // Instantiate implementations directly to verify structural alignment
        _crudLogService = new CRUDLogService(_context);
        _identityLogger = new IdentityLogger(_crudLogService, _context);
        _taskLogger = new TaskLogger(_crudLogService, _context);
        _teamLogger = new TeamLogger(_crudLogService, _context);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        var admin = new User { Id = AdminUserId, Username = "SystemAdmin", Role = Role.Admin };
        var manager = new User { Id = ManagerUserId, Username = "ManagerBob", Role = Role.Manager };
        var emp1 = new User { Id = EmployeeUserId1, Username = "AliceSmith", Role = Role.Employee };
        var emp2 = new User { Id = EmployeeUserId2, Username = "CharlieBrown", Role = Role.Employee };

        _context.Users.AddRange(admin, manager, emp1, emp2);
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    #region CRUDLogService Tests

    [Fact]
    public async Task CreateLog_ShouldSucceed_WhenValidPayloadProvided()
    {
        var dto = new CreateLogDto
        {
            UserId = EmployeeUserId1,
            Module = LogModule.Tasks,
            ActionType = ActionType.Create,
            Action = "Created baseline task blueprint"
        };

        var (isCreated, error) = await _crudLogService.CreateLog(dto);

        Assert.True(isCreated);
        Assert.Null(error);

        var logRecord = Assert.Single(_context.Logs.ToList());
        Assert.Equal("Created baseline task blueprint", logRecord.Action);
        Assert.Equal(LogModule.Tasks, logRecord.Module);
    }

    [Fact]
    public async Task CreateLog_ShouldFail_WhenUserDoesNotExist()
    {
        var dto = new CreateLogDto { UserId = 999, Action = "Ghost action" };

        var (isCreated, error) = await _crudLogService.CreateLog(dto);

        Assert.False(isCreated);
        Assert.Equal("no user found", error);
    }

    [Fact]
    public async Task GetLogs_ShouldFilterAndPageCorrectly()
    {
        // Seed 3 baseline log entries directly
        _context.Logs.AddRange(
            new Log { UserId = EmployeeUserId1, Module = LogModule.Identity, ActionType = ActionType.Create, Action = "L1", CreatedAt = DateTime.UtcNow.AddMinutes(-10) },
            new Log { UserId = EmployeeUserId1, Module = LogModule.Tasks, ActionType = ActionType.Modify, Action = "L2", CreatedAt = DateTime.UtcNow.AddMinutes(-5) },
            new Log { UserId = ManagerUserId, Module = LogModule.Tasks, ActionType = ActionType.Create, Action = "L3", CreatedAt = DateTime.UtcNow }
        );
        await _context.SaveChangesAsync();

        var request = new GetLogsRequestDto
        {
            UserId = EmployeeUserId1,
            Page = 1,
            PageSize = 10,
            SortBy = "createdat",
            SortDirection = "desc"
        };

        var (logs, error) = await _crudLogService.GetLogs(request);

        Assert.Null(error);
        Assert.NotNull(logs);
        Assert.Equal(2, logs.Count);
        Assert.Equal("L2", logs.First().Action); // Descending order validation
    }

    [Fact]
    public async Task DeleteLog_ShouldRemoveRecord_WhenIdIsValid()
    {
        var log = new Log { Id = 50, UserId = EmployeeUserId1, Action = "Disposable action" };
        _context.Logs.Add(log);
        await _context.SaveChangesAsync();

        var (isDeleted, error) = await _crudLogService.DeleteLog(50);

        Assert.True(isDeleted);
        Assert.Null(error);
        Assert.Null(await _context.Logs.FindAsync(50));
    }

    #endregion

    #region IdentityLogger Tests

    [Fact]
    public async Task UserCreatedLog_ShouldFormatMessageWithAdminName()
    {
        var targetUser = new User { Id = EmployeeUserId2, Username = "CharlieBrown" };

        await _identityLogger.UserCreatedLog(targetUser);

        var log = Assert.Single(_context.Logs.ToList());
        Assert.Equal(LogModule.Identity, log.Module);
        Assert.Equal(ActionType.Create, log.ActionType);
        Assert.Equal("User 'CharlieBrown' was created by SystemAdmin.", log.Action);
    }

    [Fact]
    public async Task OwnershipTransferredLog_ShouldLogManagerExchange()
    {
        var oldMgr = new User { Id = ManagerUserId, Username = "ManagerBob" };
        var newMgr = new User { Id = 10, Username = "ManagerSarah" };

        await _identityLogger.OwnershipTransferredLog(oldMgr, newMgr);

        var log = Assert.Single(_context.Logs.ToList());
        Assert.Contains("Ownership was transferred from 'ManagerBob' to 'ManagerSarah' by SystemAdmin.", log.Action);
    }

    #endregion

    #region TaskLogger Tests

    [Fact]
    public async Task TaskAssignedLog_ShouldResolveUsernamesAndBuildString()
    {
        var task = new TaskItem { Id = 200, Title = "Deploy Production Services" };
        var dto = new CreateLogDto { UserId = ManagerUserId, ActionType = ActionType.Create };
        var explicitAssignees = new List<int> { EmployeeUserId1, EmployeeUserId2 };

        await _taskLogger.TaskAssignedLog(dto, task, explicitAssignees, "ManagerBob");

        var log = Assert.Single(_context.Logs.ToList());
        Assert.Equal(LogModule.Tasks, log.Module);
        // Usernames should be resolved from backend state definitions dynamically via Join
        Assert.Contains("Task 'Deploy Production Services' was assigned by ManagerBob to AliceSmith, CharlieBrown", log.Action);
    }

    [Fact]
    public async Task TaskEditLog_ShouldOutputAddedAndRemovedUsernames()
    {
        var task = new TaskItem { Id = 201, Title = "UI Sandbox Diagnostics" };
        var dto = new CreateLogDto { UserId = ManagerUserId, ActionType = ActionType.Modify };

        await _taskLogger.TaskEditLog(dto, task, removedUsers: new[] { EmployeeUserId1 }, addedUsers: new[] { EmployeeUserId2 });

        var log = Assert.Single(_context.Logs.ToList());
        Assert.Contains("Removed: AliceSmith", log.Action);
        Assert.Contains("Added: CharlieBrown", log.Action);
    }

    #endregion

    #region TeamLogger Tests

    [Fact]
    public async Task LogCreateTeam_ShouldCaptureCorrectMetadata()
    {
        var team = new Team { Id = 300, Name = "Data Engineering Core" };
        var dto = new CreateLogDto { UserId = ManagerUserId, ActionType = ActionType.Create };

        await _teamLogger.LogCreateTeam(dto, team, new[] { EmployeeUserId1 }, "ManagerBob");

        var log = Assert.Single(_context.Logs.ToList());
        Assert.Equal(LogModule.Teams, log.Module);
        Assert.Equal("Team 'Data Engineering Core' was created by ManagerBob and assigned to AliceSmith", log.Action);
    }

    [Fact]
    public async Task LogTeamTransferred_ShouldCompileBothManagersUsernames()
    {
        var team = new Team { Id = 301, Name = "QA Taskforce" };
        var dto = new CreateLogDto { UserId = AdminUserId, ActionType = ActionType.Modify };

        await _teamLogger.LogTeamTransferred(dto, team, oldManagerId: ManagerUserId, newManagerId: AdminUserId);

        var log = Assert.Single(_context.Logs.ToList());
        Assert.Equal($"Team 'QA Taskforce' was transferred from ManagerBob to SystemAdmin", log.Action);
    }

    #endregion
}