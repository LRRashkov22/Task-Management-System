using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Modules.WorkSessions.Application.DTOs;
using TaskManagementSystem.Modules.WorkSessions.Application.Interfaces;

namespace TaskManagementSystem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WorkSessionsController : ControllerBase
{
    private readonly IWorkSessionService _workSessionService;

    public WorkSessionsController(IWorkSessionService workSessionService)
    {
        _workSessionService = workSessionService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Manager")]
    public async Task<ActionResult<IEnumerable<WorkSessionDto>>> GetAll()
    {
        var sessions = await _workSessionService.GetAllSessionsAsync();
        return Ok(sessions);
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<WorkSessionDto>>> GetByTaskId(int taskId)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "User ID not found in token." });
        }

        try
        {
            var sessions =
                await _workSessionService.GetSessionsByTaskIdAsync(taskId, userId);
            return Ok(sessions);
        }
        catch (UnauthorizedAccessException error)
        {
            return StatusCode(403, error.Message);
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkSessionDto dto)
    {
        // Extract the User ID from the JWT claims (e.g., NameIdentifier or 'sub')
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new { message = "User ID not found in token." });
        }

        try
        {
            var createdSession =
                await _workSessionService.CreateSessionAsync(dto, userId);

            return CreatedAtAction(
                nameof(GetByTaskId),
                new { taskId = createdSession.TaskId },
                createdSession);
        }
        catch (UnauthorizedAccessException error)
        {
            return StatusCode(403, error.Message);
        }
    }

    private bool TryGetUserId(out int userId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        return int.TryParse(userIdClaim, out userId);
    }
}
