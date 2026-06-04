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
    public async Task<ActionResult<IEnumerable<WorkSessionDto>>> GetAll()
    {
        var sessions = await _workSessionService.GetAllSessionsAsync();
        return Ok(sessions);
    }

    [HttpGet("task/{taskId}")]
    public async Task<ActionResult<IEnumerable<WorkSessionDto>>> GetByTaskId(int taskId)
    {
        var sessions = await _workSessionService.GetSessionsByTaskIdAsync(taskId);
        return Ok(sessions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkSessionDto dto)
    {
        // Extract the User ID from the JWT claims (e.g., NameIdentifier or 'sub')
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            return Unauthorized(new { message = "User ID not found in token." });
        }

        var createdSession = await _workSessionService.CreateSessionAsync(dto, userId);

        return CreatedAtAction(nameof(GetByTaskId), new { taskId = createdSession.TaskId }, createdSession);
    }
}