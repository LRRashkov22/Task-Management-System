using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Options;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Data.Options;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Identity.Application.DTOs;
using TaskManagementSystem.Modules.Identity.Application.Services;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;
using Xunit;

namespace TaskManagementSystem.Tests.Identity;

public class IdentityModuleUnitTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    private readonly Mock<IIdentityLogger> _mockLogger;
    private readonly IOptions<JwtOptions> _jwtOptions;

    // Services Under Test
    private readonly AuthService _authService;
    private readonly CreateUserService _createUserService;
    private readonly ManageUsersService _manageUsersService;

    private const int AdminId = 1;
    private const int ManagerId = 2;
    private const int EmployeeId = 3;

    public IdentityModuleUnitTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new TaskManagementDbContext(options);
        _mockLogger = new Mock<IIdentityLogger>();

        // Mock JWT configurations
        var jwtConfig = new JwtOptions
        {
            Key = "SuperSecretSecureTestingKeyThatIsLongEnoughToSatisfyHmacSha512Requirements!",
            Issuer = "TestIssuer",
            Audience = "TestAudience"
        };
        _jwtOptions = Options.Create(jwtConfig);

        _authService = new AuthService(_context, _jwtOptions, _mockLogger.Object);
        _createUserService = new CreateUserService(_context, _mockLogger.Object);
        _manageUsersService = new ManageUsersService(_context, _mockLogger.Object);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        var hasher = new PasswordHasher<User>();
        
        var admin = new User { Id = AdminId, Username = "AdminUser", Role = Role.Admin };
        admin.PasswordHash = hasher.HashPassword(admin, "SecurePass123!");

        var manager = new User { Id = ManagerId, Username = "ManagerUser", Role = Role.Manager };
        manager.PasswordHash = hasher.HashPassword(manager, "SecurePass123!");

        var employee = new User { Id = EmployeeId, Username = "EmployeeUser", Role = Role.Employee, ManagerId = ManagerId };
        employee.PasswordHash = hasher.HashPassword(employee, "SecurePass123!");

        _context.Users.AddRange(admin, manager, employee);
        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    #region AuthService Tests

    [Fact]
    public async Task LoginAsync_ShouldSucceed_WithCorrectCredentials()
    {
        var dto = new UserDto { Username = "EmployeeUser", Password = "SecurePass123!" };

        var (response, error) = await _authService.LoginAsync(dto);

        Assert.NotNull(response);
        Assert.Null(error);
        Assert.NotNull(response.AccessToken);
        _mockLogger.Verify(l => l.LoginLog(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_ShouldFail_WithIncorrectPassword()
    {
        var dto = new UserDto { Username = "EmployeeUser", Password = "WrongPassword!" };

        var (response, error) = await _authService.LoginAsync(dto);

        Assert.Null(response);
        Assert.Equal("User not found", error);
    }

    [Fact]
    public async Task ChangePassword_ShouldFail_WhenPasswordDoesNotMeetComplexity()
    {
        var dto = new ChangePasswordDto { Password = "SecurePass123!", NewPassword = "weak" };

        var (response, error) = await _authService.ChangePassword(dto, EmployeeId);

        Assert.Null(response);
        Assert.Contains("must be at least 8 characters long", error);
    }

    #endregion

    #region CreateUserService Tests

    [Fact]
    public async Task RegisterUser_ShouldSuccessfullyCreateEmployee_WithValidPayload()
    {
        var dto = new CreateUserDto
        {
            Username = "NewEmployee",
            Password = "ValidPass123!",
            Role = Role.Employee,
            ManagerId = ManagerId
        };

        var (user, error) = await _createUserService.RegisterUser(dto);

        Assert.NotNull(user);
        Assert.Null(error);
        Assert.Equal(Role.Employee, user.Role);
        _mockLogger.Verify(l => l.UserCreatedLog(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task RegisterUser_ShouldFail_WhenUsernameContainsNumbersOrSpecialCharacters()
    {
        var dto = new CreateUserDto { Username = "User123!", Password = "ValidPass123!", Role = Role.Employee };

        var (user, error) = await _createUserService.RegisterUser(dto);

        Assert.Null(user);
        Assert.Equal("Username cannot contain special symbols", error);
    }

    #endregion

    #region ManageUsersService Tests

    [Fact]
    public async Task EditUser_ShouldModifyPropertiesAndTriggerLogs()
    {
        var dto = new EditUserDto { Id = EmployeeId, Username = "UpdatedName" };

        var result = await _manageUsersService.EditUser(dto);

        Assert.NotNull(result);
        Assert.Equal("UpdatedName", result.Username);
        
        var updatedDbUser = await _context.Users.FindAsync(EmployeeId);
        Assert.Equal("UpdatedName", updatedDbUser.Username);
        _mockLogger.Verify(l => l.UserEditedLog(It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task TransferOwnershipAsync_ShouldCascadeManagersAndTeams()
    {
        const int TargetNewManagerId = 99;
        _context.Users.Add(new User { Id = TargetNewManagerId, Username = "NewManager", Role = Role.Manager });
        
        var team = new Team { Id = 10, Name = "Team Alpha", ManagerId = ManagerId };
        var task = new TaskItem { Id = 20, Title = "Task Delta", CreatedById = ManagerId };
        _context.Teams.Add(team);
        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        var dto = new TransferManagerOwnershipDto { CurrentManagerId = ManagerId, NewManagerId = TargetNewManagerId };

        var (status, error) = await _manageUsersService.TransferOwnershipAsync(dto);

        Assert.True(status);
        Assert.Null(error);

        Assert.Equal(TargetNewManagerId, (await _context.Users.FindAsync(EmployeeId)).ManagerId);
        Assert.Equal(TargetNewManagerId, (await _context.Teams.FindAsync(10)).ManagerId);
        Assert.Equal(TargetNewManagerId, (await _context.TaskItems.FindAsync(20)).CreatedById);
        _mockLogger.Verify(l => l.OwnershipTransferredLog(It.IsAny<User>(), It.IsAny<User>()), Times.Once);
    }

    [Fact]
    public async Task ForceDeleteManagerAsync_ShouldPurgeAllOwnedEntitiesCascade()
    {
        var team = new Team { Id = 50, Name = "Orphaned Team", ManagerId = ManagerId };
        var task = new TaskItem { Id = 60, Title = "Orphaned Task", TeamId = 50 };
        _context.Teams.Add(team);
        _context.TaskItems.Add(task);
        await _context.SaveChangesAsync();

        var (status, error) = await _manageUsersService.ForceDeleteManagerAsync(ManagerId);

        Assert.True(status);
        Assert.Null(error);

        // Assert cascading deletions
        Assert.Null(await _context.Users.FindAsync(ManagerId));
        Assert.Null(await _context.Users.FindAsync(EmployeeId)); // Reporting employee deleted
        Assert.Null(await _context.Teams.FindAsync(50));
        Assert.Null(await _context.TaskItems.FindAsync(60));
        _mockLogger.Verify(l => l.ManagerForceDeletedLog(It.IsAny<User>()), Times.Once);
    }

    #endregion
}