using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Comments.Application.DTOs;
using TaskManagementSystem.Modules.Comments.Application.Interfaces;

namespace TaskManagementSystem.Modules.Comments.Application.Services
{
    public class CommentService : ICommentService
    {
        private readonly TaskManagementDbContext _context;

        public CommentService(TaskManagementDbContext context)
        {
            _context = context;
        }

        public async Task<CommentDto> AddCommentAsync(CreateCommentDto dto, int currentUserId)
        {
            //  Verify target Task item exists
            var taskExists = await _context.Set<TaskItem>().AnyAsync(t => t.Id == dto.TaskId);
            if (!taskExists)
                throw new KeyNotFoundException($"Task with ID {dto.TaskId} does not exist.");

            //  Map payload to Base Entity
            var comment = new Comment
            {
                Content = dto.Content,
                TaskId = dto.TaskId,
                UserId = currentUserId,
                CreatedAt = DateTime.UtcNow
            };

            //  Process Mentioned Users if any exist
            if (dto.MentionedUserIds != null && dto.MentionedUserIds.Any())
            {
                // Verify IDs are actual real users to safeguard data integrity
                var validUserIds = await _context.Set<User>()
                    .Where(u => dto.MentionedUserIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();

                foreach (var userId in validUserIds)
                {
                    comment.Mentions.Add(new CommentMention
                    {
                        MentionedUserId = userId
                    });
                }
            }

            _context.Set<Comment>().Add(comment);
            await _context.SaveChangesAsync();

            // Fetch author's name for returning accurate DTO mapping
            var username = await _context.Set<User>()
                .Where(u => u.Id == currentUserId)
                .Select(u => u.Username)
                .FirstOrDefaultAsync() ?? "Unknown";

            return MapToDto(comment, username);
        }

        public async Task<CommentDto> UpdateCommentAsync(int commentId, UpdateCommentDto dto, int currentUserId)
        {
            var comment = await _context.Set<Comment>()
                .Include(c => c.User)
                .Include(c => c.Mentions)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null)
                throw new KeyNotFoundException($"Comment with ID {commentId} was not found.");

            // Author protection check
            if (comment.UserId != currentUserId)
                throw new UnauthorizedAccessException("You are not authorized to modify this comment.");

            comment.Content = dto.Content;

            // Reset and reconcile Mentions
            _context.Set<CommentMention>().RemoveRange(comment.Mentions);
            comment.Mentions.Clear();

            if (dto.MentionedUserIds != null && dto.MentionedUserIds.Any())
            {
                var validUserIds = await _context.Set<User>()
                    .Where(u => dto.MentionedUserIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync();

                foreach (var userId in validUserIds)
                {
                    comment.Mentions.Add(new CommentMention
                    {
                        CommentId = commentId,
                        MentionedUserId = userId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return MapToDto(comment, comment.User?.Username ?? "Unknown");
        }

        public async Task<bool> DeleteCommentAsync(int commentId, int currentUserId)
        {
            var comment = await _context.Set<Comment>().FindAsync(commentId);
            if (comment == null) return false;

            // Ensure user owns the comment before allowing a delete operation
            if (comment.UserId != currentUserId)
                throw new UnauthorizedAccessException("You do not have permission to delete this comment.");

            _context.Set<Comment>().Remove(comment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<CommentDto>> GetCommentsByTaskIdAsync(int taskId)
        {
            return await _context.Set<Comment>()
                .AsNoTracking()
                .Where(c => c.TaskId == taskId)
                .Include(c => c.User)
                .Include(c => c.Mentions)
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto
                {
                    Id = c.Id,
                    Content = c.Content,
                    UserId = c.UserId,
                    Username = c.User != null ? c.User.Username : "Deleted User",
                    TaskId = c.TaskId,
                    CreatedAt = c.CreatedAt,
                    MentionedUserIds = c.Mentions.Select(m => m.MentionedUserId).ToList()
                })
                .ToListAsync();
        }

        public async Task<CommentDto?> GetCommentByIdAsync(int commentId)
        {
            var comment = await _context.Set<Comment>()
                .AsNoTracking()
                .Include(c => c.User)
                .Include(c => c.Mentions)
                .FirstOrDefaultAsync(c => c.Id == commentId);

            if (comment == null) return null;

            return MapToDto(comment, comment.User?.Username ?? "Deleted User");
        }

        // Helper method to keep code DRY
        private static CommentDto MapToDto(Comment comment, string username)
        {
            return new CommentDto
            {
                Id = comment.Id,
                Content = comment.Content,
                UserId = comment.UserId,
                Username = username,
                TaskId = comment.TaskId,
                CreatedAt = comment.CreatedAt,
                MentionedUserIds = comment.Mentions.Select(m => m.MentionedUserId).ToList()
            };
        }
    }
}
