using System;
using System.Collections.Generic;
using System.Text;
using TaskManagementSystem.Modules.Comments.Application.DTOs;

namespace TaskManagementSystem.Modules.Comments.Application.Interfaces
{
    public interface ICommentService
    {
        Task<CommentDto> AddCommentAsync(CreateCommentDto dto, int currentUserId);
        Task<CommentDto> UpdateCommentAsync(int commentId, UpdateCommentDto dto, int currentUserId);
        Task<bool> DeleteCommentAsync(int commentId, int currentUserId);
        Task<IEnumerable<CommentDto>> GetCommentsByTaskIdAsync(int taskId);
        Task<CommentDto?> GetCommentByIdAsync(int commentId);
    }
}
