using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.Logs.Application.DTOs;
using TaskManagementSystem.Modules.Logs.Application.Interfaces;

namespace TaskManagementSystem.Modules.Logs.Presentation;

[ApiController]
[Route("api/logs")]
public class LogsController : ControllerBase
{
    private readonly TaskManagementDbContext _context;
    private readonly ICRUDLogService _logService;
    public LogsController(TaskManagementDbContext context, ICRUDLogService logService)
    {
        _context = context;
        _logService = logService;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("get-logs")]
    public async Task<ActionResult> GetLog()
    {
        var logs = await _context.Logs
            .Include(x => x.User)
            .ToListAsync();

        if (logs.Count == 0)
        {
            return BadRequest("empty logs");
        }

        return Ok(logs);
    }


    [Authorize(Roles = "Admin")]
    [HttpDelete("delete-logs")]
    public async Task<ActionResult> DeleteLog(DeleteLogDto deleteLogDto)
    {
        var (isDelete, error) = await _logService.DeleteLog(deleteLogDto.Id);

        if (!isDelete)
        {
            return BadRequest(error);
        }

        return Ok(isDelete);
    }
}

