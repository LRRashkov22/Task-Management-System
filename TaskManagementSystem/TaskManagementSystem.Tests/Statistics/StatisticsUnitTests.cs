using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.AdminDto;
using TaskManagementSystem.Modules.Statistics.Application.DTOs.ManagersDto;
using TaskManagementSystem.Modules.Statistics.Application.Services.AdminPanel;
using TaskManagementSystem.Modules.Statistics.Application.Services.EmployeePanel;
using TaskManagementSystem.Modules.Statistics.Application.Services.ManagerPanel;
using TaskManagementSystem.Modules.Statistics.Application.Services;
using Xunit;

namespace TaskManagementSystem.Tests.Statistics;

public class StatisticsModuleUnitTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    
    // Services under test
    private readonly GetAdminInformation _adminService;
    private readonly GetEmployeeInformation _employeeService;
    private readonly GetManagerInformation _managerService;
    private readonly GetManagerAnalytics _analyticsService;

    private const int AdminId = 1;
    private const int ManagerId = 2;
    private const int Employee1Id = 3;
    private const int Employee2Id = 4;

    public StatisticsModuleUnitTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagementDbContext(options);

        // Initialize all services
        _adminService = new GetAdminInformation(_context);
        _employeeService = new GetEmployeeInformation(_context);
        _managerService = new GetManagerInformation(_context);
        _analyticsService = new GetManagerAnalytics(_context);

        SeedData();
    }

    private void SeedData()
    {
        // 1. Seed Users
        var admin = new User { Id = AdminId, Username = "AdminUser", Role = Role.Admin };
        var manager = new User { Id = ManagerId, Username = "ManagerUser", Role = Role.Manager };
        var emp1 = new User { Id = Employee1Id, Username = "Employee1", Role = Role.Employee, ManagerId = ManagerId };
        var emp2 = new User { Id = Employee2Id, Username = "Employee2", Role = Role.Employee, ManagerId = ManagerId };
        _context.Users.AddRange(admin, manager, emp1, emp2);

        // 2. Seed Teams
        var activeTeam = new Team { Id = 10, Name = "Alpha Team", ManagerId = ManagerId, IsArchived = false };
        var archivedTeam = new Team { Id = 11, Name = "Old Team", ManagerId = ManagerId, IsArchived = true };
        _context.Teams.AddRange(activeTeam, archivedTeam);

        // Memberships
        _context.TeamMemberships.Add(new TeamMembership { TeamId = 10, UserId = Employee1Id });
        _context.TeamMemberships.Add(new TeamMembership { TeamId = 10, UserId = Employee2Id });

        // 3. Seed Tasks
        var task1 = new TaskItem 
        { 
            Id = 100, Title = "Task One", TeamId = 10, Status = Status.Done, Priority = Priority.High, 
            CreatedAt = DateTime.UtcNow.AddDays(-5), Deadline = DateTime.UtcNow.AddDays(2), IsArchived = false 
        };
        var task2 = new TaskItem 
        { 
            Id = 101, Title = "Task Two", TeamId = 10, Status = Status.InProgress, Priority = Priority.Medium, 
            CreatedAt = DateTime.UtcNow.AddDays(-2), Deadline = DateTime.UtcNow.AddDays(-1), IsArchived = false // Overdue
        };
        _context.TaskItems.AddRange(task1, task2);

        // Assignments
        _context.TaskAssignments.Add(new TaskAssignment { TaskId = 100, UserId = Employee1Id });
        _context.TaskAssignments.Add(new TaskAssignment { TaskId = 101, UserId = Employee1Id });

        // Work Sessions
        _context.WorkSessions.Add(new WorkSession { Id = 50, TaskId = 100, UserId = Employee1Id, Hours = 5, Date = DateTime.UtcNow });
        _context.WorkSessions.Add(new WorkSession { Id = 51, TaskId = 101, UserId = Employee1Id, Hours = 3, Date = DateTime.UtcNow });

        // Notifications
        _context.Notifications.Add(new Notification { Id = 1, UserId = AdminId, Message = "Test Alert", IsRead = false, CreatedAt = DateTime.UtcNow });

        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    #region Admin Panel Statistics Tests

    [Fact]
    public async Task GetAdminDashboardInformation_ShouldReturnCorrectMetrics()
    {
        var result = await _adminService.GetAdminDashboardInformation();

        Assert.Equal(2, result.FirstEntity);   // Employees count
        Assert.Equal(1, result.SecondEntitu);  // Managers count
        Assert.Equal(2, result.ThirdEntity);   // Active Tasks count
        Assert.Equal(1, result.FourthEntity);  // Active Teams count
    }

    [Fact]
    public async Task GetPreviewOnDeletingManager_ShouldCalculateCorrectAssociatedEntities()
    {
        var (preview, error) = await _adminService.GetPreviewOnDeletingManager(ManagerId);

        Assert.Null(error);
        Assert.NotNull(preview);
        Assert.Equal("ManagerUser", preview.ManagerName);
        Assert.Equal(2, preview.teams);      // 1 Active + 1 Archived
        Assert.Equal(2, preview.tasks);      // 2 tasks under manager's teams
        Assert.Equal(2, preview.employees);  // 2 employees report to this manager
    }

    [Fact]
    public async Task GetAdminArchivedTeams_ShouldReturnArchivedTeamsWithCounts()
    {
        var result = await _adminService.GetAdminArchivedTeams();

        var archived = Assert.Single(result);
        Assert.Equal(11, archived.Id);
        Assert.Equal("Old Team", archived.Name);
        Assert.Equal("ManagerUser", archived.ManagerName);
    }

    #endregion

    #region Employee Panel Statistics Tests

    [Fact]
    public async Task GetEmployeeDashboardAsync_ShouldAccuratelyComputeAggregates()
    {
        // Employee 1 is assigned to 2 tasks (1 Done, 1 InProgress & Overdue)
        var dashboard = await _employeeService.GetEmployeeDashboardAsync(Employee1Id);

        Assert.Equal(2, dashboard.MyTasks);
        Assert.Equal(1, dashboard.InProgressTasks);
        Assert.Equal(1, dashboard.CompletedTasks);
        Assert.Equal(1, dashboard.OverdueTasks); // task2 deadline is in the past
        Assert.Equal(8, dashboard.TotalHoursLogged); // 5 + 3 hours
        Assert.Equal(4, dashboard.AvgTimePerTask); // Average of (5 + 3) hours over 2 tasks
        Assert.Equal(2, dashboard.RecentTasks.Count);
    }

    [Fact]
    public async Task GetEmployeeTaskDetailsAsync_ShouldLoadNestedEntities()
    {
        var details = await _employeeService.GetEmployeeTaskDetailsAsync(taskId: 100, userid: Employee1Id);

        Assert.NotNull(details);
        Assert.Equal("Task One", details.Title);
        Assert.Equal("Done", details.Status);
        Assert.Equal(5, details.WorkHours);
        Assert.Single(details.AssignedUsers);
        Assert.Equal("Employee1", details.AssignedUsers.First().Username);
    }

    #endregion

    #region Manager Panel Statistics Tests

    [Fact]
    public async Task GetAllTeamsManagerListAsync_ShouldReturnActiveTeamsOnly()
    {
        var result = await _managerService.GetAllTeamsManagerListAsync(ManagerId);

        // Should return only "Alpha Team" (Id 10); "Old Team" (Id 11) is archived
        var teamDto = Assert.Single(result);
        Assert.Equal(10, teamDto.Id);
        Assert.Equal("Alpha Team", teamDto.Name);
        Assert.Equal(2, teamDto.EmployeesCount);
        Assert.Equal(2, teamDto.TasksCount);
    }

    [Fact]
    public async Task GetCalendarTaskInformation_ShouldReturnMappedTimeline()
    {
        var result = await _managerService.GetCalendarTaskInformation(ManagerId);

        Assert.Equal(2, result.Count);
        Assert.All(result, item => Assert.Equal("Alpha Team", item.TeamName));
        Assert.Contains(result, item => item.TaskName == "Task One");
    }

    #endregion

    #region Manager Analytics Tests

    [Fact]
    public async Task GetAnalyticsDashboardAsync_ShouldCompileCorrectPercentagesAndGroupings()
    {
        var analytics = await _analyticsService.GetAnalyticsDashboardAsync(ManagerId);

        // Verify Summary Cards
        Assert.Equal(1, analytics.Cards.TasksCompleted);
        Assert.Equal(8, analytics.Cards.TotalHours);
        Assert.Equal(50.0, analytics.Cards.CompletionRate); // 1 completed out of 2 total = 50%

        // Verify Status Distribution Groupings
        Assert.Equal(1, analytics.TasksByStatus.InProgress);
        Assert.Equal(1, analytics.TasksByStatus.Done);
        Assert.Equal(0, analytics.TasksByStatus.Todo);

        // Verify Priority Groupings
        Assert.Equal(1, analytics.TasksByPriority.High);
        Assert.Equal(1, analytics.TasksByPriority.Medium);
        Assert.Equal(0, analytics.TasksByPriority.Low);

        // Verify Individual Employee Productivity Matrix
        var emp1Productivity = analytics.Productivity.First(p => p.UserId == Employee1Id);
        Assert.Equal("Employee1", emp1Productivity.Username);
        Assert.Equal(1, emp1Productivity.CompletedTasks);
        Assert.Equal(8, emp1Productivity.HoursLogged);
    }

    #endregion
}