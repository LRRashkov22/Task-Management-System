using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Notification.Infrastructure.Hubs;
using TaskManagementSystem.Modules.Notification.Application.Services;
using Xunit;

namespace TaskManagementSystem.Tests.Notifications;

public class NotificationModuleUnitTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    private readonly Mock<IHubContext<NotificationHub>> _mockHubContext;
    private readonly Mock<IHubClients> _mockHubClients;
    private readonly Mock<ISingleClientProxy> _mockClientProxy;

    // Services Under Test
    private readonly NotificationService _notificationService;
    private readonly TaskNotificationService _taskNotificationService;
    private readonly TeamNotificationService _teamNotificationService;

    private const int AdminId = 1;
    private const int ManagerId = 2;
    private const int EmployeeId = 3;

    public NotificationModuleUnitTests()
    {
        // 1. Setup DB Context
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        _context = new TaskManagementDbContext(options);

        // 2. Setup SignalR Mocks (Chaining HubContext -> Clients -> User -> SendAsync)
        _mockHubContext = new Mock<IHubContext<NotificationHub>>();
        _mockHubClients = new Mock<IHubClients>();
        _mockClientProxy = new Mock<ISingleClientProxy>();

        _mockHubClients.Setup(c => c.User(It.IsAny<string>())).Returns(_mockClientProxy.Object);
        _mockHubContext.Setup(h => h.Clients).Returns(_mockHubClients.Object);

        // 3. Instantiate Services
        _notificationService = new NotificationService(_context, _mockHubContext.Object);
        _taskNotificationService = new TaskNotificationService(_notificationService);
        _teamNotificationService = new TeamNotificationService(_notificationService);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        var admin = new User { Id = AdminId, Username = "AdminUser", Role = Role.Admin };
        var manager = new User { Id = ManagerId, Username = "ManagerUser", Role = Role.Manager };
        var employee = new User { Id = EmployeeId, Username = "EmpUser", Role = Role.Employee };
        _context.Users.AddRange(admin, manager, employee);

        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    #region NotificationService Base Tests

    [Fact]
    public async Task GetAdminIdAsync_ShouldReturnCorrectAdminUserId()
    {
        var adminId = await _notificationService.GetAdminIdAsync();
        Assert.Equal(AdminId, adminId);
    }

    [Fact]
    public async Task SendNotificationAsync_ShouldSaveToDatabaseAndTriggerSignalR()
    {
        string msg = "Hello Realtime World";
        
        await _notificationService.SendNotificationAsync(EmployeeId, msg);

        // Verify it hits DB
        var savedNotification = Assert.Single(_context.Notifications.Where(n => n.UserId == EmployeeId));
        Assert.Equal(msg, savedNotification.Message);
        Assert.False(savedNotification.IsRead);

        // Verify SignalR push triggered for specific user ID string
        _mockHubClients.Verify(c => c.User(EmployeeId.ToString()), Times.Once);
        _mockClientProxy.Verify(p => p.SendCoreAsync("ReceiveNotification", It.IsAny<object[]>(), default), Times.Once);
    }

    [Fact]
    public async Task MarkAsReadAsync_ShouldChangeStatus_WhenNotificationExists()
    {
        var notif = new Notification { Id = 500, UserId = EmployeeId, Message = "Read me", IsRead = false };
        _context.Notifications.Add(notif);
        await _context.SaveChangesAsync();

        var (status, error) = await _notificationService.MarkAsReadAsync(EmployeeId, 500);

        Assert.True(status);
        Assert.Null(error);
        Assert.True(notif.IsRead);
    }

    [Fact]
    public async Task MarkAsReadAllAsync_ShouldTurnAllUnreadToReadForTargetUser()
    {
        _context.Notifications.AddRange(
            new Notification { Id = 600, UserId = EmployeeId, Message = "N1", IsRead = false },
            new Notification { Id = 601, UserId = EmployeeId, Message = "N2", IsRead = false },
            new Notification { Id = 602, UserId = ManagerId, Message = "N3", IsRead = false } // Separate user
        );
        await _context.SaveChangesAsync();

        var (status, error) = await _notificationService.MarkAsReadAllAsync(EmployeeId);

        Assert.True(status);
        Assert.Null(error);
        Assert.Equal(2, _context.Notifications.Count(n => n.UserId == EmployeeId && n.IsRead));
        Assert.False(_context.Notifications.First(n => n.UserId == ManagerId).IsRead); // Untouched
    }

    #endregion

    #region TaskNotificationService Tests

    [Fact]
    public async Task NotifyTaskAssignedAsync_ShouldNotifyEmployeesAndAdmin()
    {
        var task = new TaskItem { Id = 10, Title = "Build Core API" };
        var assignees = new List<int> { EmployeeId };

        await _taskNotificationService.NotifyTaskAssignedAsync(task, assignees, "ManagerUser");

        // Asserts database recorded message string maps correctly
        var employeeNotif = _context.Notifications.FirstOrDefault(n => n.UserId == EmployeeId);
        var adminNotif = _context.Notifications.FirstOrDefault(n => n.UserId == AdminId);

        Assert.NotNull(employeeNotif);
        Assert.Contains("You were assigned to task: Build Core API", employeeNotif.Message);
        
        Assert.NotNull(adminNotif);
        Assert.Contains("Task: Build Core API was created by ManagerUser", adminNotif.Message);
    }

    [Fact]
    public async Task NotifyTaskEditAsync_ShouldHandleUnassignmentsAndNewAssignments()
    {
        var task = new TaskItem { Id = 12, Title = "Refactor Database" };

        await _taskNotificationService.NotifyTaskEditAsync(task, removedUsers: new[] { EmployeeId }, addedUsers: new[] { ManagerId });

        var removedUserMsg = _context.Notifications.First(n => n.UserId == EmployeeId);
        var addedUserMsg = _context.Notifications.First(n => n.UserId == ManagerId);

        Assert.Contains("You were unassigned from task", removedUserMsg.Message);
        Assert.Contains("You were assigned to task", addedUserMsg.Message);
    }

    #endregion

    #region TeamNotificationService Tests

    [Fact]
    public async Task NotifyCreateTeamAsync_ShouldAlertMembersAndAdmin()
    {
        var team = new Team { Id = 100, Name = "DevOps Squad" };

        await _teamNotificationService.NotifyCreateTeamAsync(team, new[] { EmployeeId }, "ManagerUser");

        var empNotif = _context.Notifications.FirstOrDefault(n => n.UserId == EmployeeId);
        var adminNotif = _context.Notifications.FirstOrDefault(n => n.UserId == AdminId);

        Assert.NotNull(empNotif);
        Assert.Contains("You were assigned to team: DevOps Squad", empNotif.Message);
        Assert.Contains("Team: DevOps Squad was created by ManagerUser", adminNotif!.Message);
    }

    [Fact]
    public async Task NotifyTeamTransferredAsync_ShouldNotifyBothManagers()
    {
        var team = new Team { Id = 101, Name = "Frontend Team" };

        await _teamNotificationService.NotifyTeamTransferredAsync(team, oldManagerId: ManagerId, newManagerId: 99);

        var oldManagerNotif = _context.Notifications.FirstOrDefault(n => n.UserId == ManagerId);
        var newManagerNotif = _context.Notifications.FirstOrDefault(n => n.UserId == 99);

        Assert.Equal("Team: Frontend Team was transferred", oldManagerNotif!.Message);
        Assert.Equal("You received team: Frontend Team", newManagerNotif!.Message);
    }

    #endregion
}