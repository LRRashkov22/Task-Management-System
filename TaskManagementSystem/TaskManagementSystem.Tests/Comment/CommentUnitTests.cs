using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Comments.Application.DTOs;
using TaskManagementSystem.Modules.Comments.Application.Services;
using TaskManagementSystem.Modules.Notification.Application.Interfaces;
using Xunit;

namespace TaskManagementSystem.Tests.Comments;

public class CommentsModuleUnitTests : IDisposable
{
    private readonly TaskManagementDbContext _context;
    private readonly Mock<ITaskNotificationService> _mockNotificationService;
    private readonly CommentService _commentService;

    private const int AuthorUserId = 1;
    private const int MentionedUserId = 2;
    private const int OtherUserId = 3;
    private const int TargetTaskId = 100;

    public CommentsModuleUnitTests()
    {
        var options = new DbContextOptionsBuilder<TaskManagementDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TaskManagementDbContext(options);
        _mockNotificationService = new Mock<ITaskNotificationService>();

        _commentService = new CommentService(_context, _mockNotificationService.Object);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        // 1. Seed Users
        var author = new User { Id = AuthorUserId, Username = "AuthorUser" };
        var taggedUser = new User { Id = MentionedUserId, Username = "Bob" };
        var intruder = new User { Id = OtherUserId, Username = "IntruderUser" };
        _context.Users.AddRange(author, taggedUser, intruder);

        // 2. Seed Task and explicit Assignments for matching context validation
        var task = new TaskItem { Id = TargetTaskId, Title = "Telemetry Deployment Sprint" };
        _context.TaskItems.Add(task);

        _context.TaskAssignments.Add(new TaskAssignment { TaskId = TargetTaskId, UserId = AuthorUserId });
        _context.TaskAssignments.Add(new TaskAssignment { TaskId = TargetTaskId, UserId = MentionedUserId });

        _context.SaveChanges();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    #region AddCommentAsync Tests

    [Fact]
    public async Task AddCommentAsync_ShouldSaveComment_AndTriggerBothMentionAndAddedNotifications()
    {
        var dto = new CreateCommentDto
        {
            TaskId = TargetTaskId,
            Content = "Hey @Bob review this update please.",
            MentionedUserIds = new List<int> { MentionedUserId }
        };

        var result = await _commentService.AddCommentAsync(dto, AuthorUserId);

        // Assert basic tracking mappings
        Assert.NotNull(result);
        Assert.Equal("Hey @Bob review this update please.", result.Content);
        Assert.Equal("AuthorUser", result.Username);
        Assert.Contains(MentionedUserId, result.MentionedUserIds);

        // Verify notification service mock anchors fired cleanly 
        _mockNotificationService.Verify(n => n.NotifyCommentMentionAsync(
            It.Is<TaskItem>(t => t.Id == TargetTaskId),
            "AuthorUser",
            It.Is<IEnumerable<int>>(ids => ids.Contains(MentionedUserId))), Times.Once);

        _mockNotificationService.Verify(n => n.NotifyCommentAddedAsync(
            It.Is<TaskItem>(t => t.Id == TargetTaskId),
            It.IsAny<IEnumerable<int>>(),
            "AuthorUser"), Times.Once);
    }

    [Fact]
    public async Task AddCommentAsync_ShouldThrowKeyNotFoundException_WhenTaskIdIsInvalid()
    {
        var dto = new CreateCommentDto { TaskId = 999, Content = "Orphan message context." };

        await Assert.ThrowsAsync<KeyNotFoundException>(() => 
            _commentService.AddCommentAsync(dto, AuthorUserId));
    }

    #endregion

    #region UpdateCommentAsync Tests

    [Fact]
    public async Task UpdateCommentAsync_ShouldModifyContent_WhenUserIsAuthor()
    {
        // Setup initial unedited base comment
        var initialComment = new Comment { Id = 10, TaskId = TargetTaskId, UserId = AuthorUserId, Content = "Draft version" };
        _context.Comments.Add(initialComment);
        await _context.SaveChangesAsync();

        var updateDto = new UpdateCommentDto { Content = "Finalized production version", MentionedUserIds = new List<int>() };

        var result = await _commentService.UpdateCommentAsync(10, updateDto, AuthorUserId);

        Assert.Equal("Finalized production version", result.Content);
        var dbComment = await _context.Comments.FindAsync(10);
        Assert.Equal("Finalized production version", dbComment.Content);
    }

    [Fact]
    public async Task UpdateCommentAsync_ShouldThrowUnauthorizedAccessException_WhenUserIsNotAuthor()
    {
        var comment = new Comment { Id = 11, TaskId = TargetTaskId, UserId = AuthorUserId, Content = "Original content" };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var updateDto = new UpdateCommentDto { Content = "Hacked modifications" };

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _commentService.UpdateCommentAsync(11, updateDto, OtherUserId)); // OtherUserId is not the owner
    }

    #endregion

    #region DeleteCommentAsync Tests

    [Fact]
    public async Task DeleteCommentAsync_ShouldSucceed_WhenUserOwnsComment()
    {
        var comment = new Comment { Id = 20, TaskId = TargetTaskId, UserId = AuthorUserId, Content = "To be deleted" };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var status = await _commentService.DeleteCommentAsync(20, AuthorUserId);

        Assert.True(status);
        Assert.Null(await _context.Comments.FindAsync(20));
    }

    [Fact]
    public async Task DeleteCommentAsync_ShouldThrowUnauthorizedAccessException_WhenUserDoesNotOwnComment()
    {
        var comment = new Comment { Id = 21, TaskId = TargetTaskId, UserId = AuthorUserId, Content = "Safe content" };
        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => 
            _commentService.DeleteCommentAsync(21, OtherUserId));
    }

    #endregion

    #region Read/Query Operations Tests

    [Fact]
    public async Task GetCommentsByTaskIdAsync_ShouldReturnOrderedList()
    {
        _context.Comments.AddRange(
            new Comment { Id = 30, TaskId = TargetTaskId, UserId = AuthorUserId, Content = "Second comment", CreatedAt = DateTime.UtcNow.AddMinutes(5) },
            new Comment { Id = 31, TaskId = TargetTaskId, UserId = AuthorUserId, Content = "First comment", CreatedAt = DateTime.UtcNow }
        );
        await _context.SaveChangesAsync();

        var results = (await _commentService.GetCommentsByTaskIdAsync(TargetTaskId)).ToList();

        Assert.Equal(2, results.Count);
        Assert.Equal("First comment", results[0].Content);  // Ascending date sorting check
        Assert.Equal("Second comment", results[1].Content);
    }

    #endregion
}