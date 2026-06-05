using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using TaskManagementSystem.Modules.Comments.Application.DTOs;
using TaskManagementSystem.Modules.Comments.Application.Interfaces;

namespace TaskManagementSystem.Modules.Comments.Presentation
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentsController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        [HttpPost]
        [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CreateComment([FromBody] CreateCommentDto dto)
        {
            try
            {
                int currentUserId = GetCurrentUserId();
                var result = await _commentService.AddCommentAsync(dto, currentUserId);

                // Returns a 201 Created status and links to the GetById endpoint
                return CreatedAtAction(nameof(GetCommentById), new { id = result.Id }, result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(CommentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] UpdateCommentDto dto)
        {
            try
            {
                int currentUserId = GetCurrentUserId();
                var result = await _commentService.UpdateCommentAsync(id, dto, currentUserId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                int currentUserId = GetCurrentUserId();
                var deleted = await _commentService.DeleteCommentAsync(id, currentUserId);

                if (!deleted)
                    return NotFound(new { message = $"Comment with ID {id} not found." });

                return NoContent(); // 204 Standard response for successful deletes
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status401Unauthorized, new { message = ex.Message });
            }
        }

        [HttpGet("task/{taskId:int}")]
        [ProducesResponseType(typeof(IEnumerable<CommentDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCommentsByTaskId(int taskId)
        {
            var comments = await _commentService.GetCommentsByTaskIdAsync(taskId);
            return Ok(comments);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(CommentDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCommentById(int id)
        {
            var comment = await _commentService.GetCommentByIdAsync(id);
            if (comment == null)
                return NotFound(new { message = $"Comment with ID {id} not found." });

            return Ok(comment);
        }

        /// <summary>
        /// Helper method to safely extract the current User ID from the JWT Token claims
        /// </summary>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                              ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("User identification token claim is missing or malformed.");
            }

            return userId;
        }
    }
}
