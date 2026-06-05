using Microsoft.EntityFrameworkCore;
using TaskManagementSystem.Data.Persistance;
using TaskManagementSystem.Modules.WorkSessions.Application.Interfaces;
using TaskManagementSystem.Modules.WorkSessions.Application.DTOs;
using TaskManagementSystem.Data.Domain.Entities;

namespace TaskManagementSystem.Modules.WorkSessions.Application.Services;

public class WorkSessionService : IWorkSessionService
{
    private readonly TaskManagementDbContext _context;

    public WorkSessionService(TaskManagementDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<WorkSessionDto>> GetAllSessionsAsync()
    {
        return await _context.WorkSessions
            .Include(ws => ws.User) //include user to access username
            .Select(ws => new WorkSessionDto
            {
                Id = ws.Id,
                TaskId = ws.TaskId,
                Username = ws.User != null ? ws.User.Username : "Unknown",
                Hours = ws.Hours,
                Description = ws.Description ?? "",
                Date = ws.Date
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<WorkSessionDto>> GetSessionsByTaskIdAsync(int taskId)
    {
        return await _context.WorkSessions
            .Include(ws => ws.User)
            .Where(ws => ws.TaskId == taskId)
            .Select(ws => new WorkSessionDto
            {
                Id = ws.Id,
                TaskId = ws.TaskId,
                Username = ws.User != null ? ws.User.Username : "Unknown",
                Hours = ws.Hours,
                Description = ws.Description ?? "",
                Date = ws.Date
            })
            .ToListAsync();
    }

    public async Task<WorkSessionDto> CreateSessionAsync(CreateWorkSessionDto dto, int userId)
    {
        var session = new WorkSession
        {
            TaskId = dto.TaskId,
            UserId = userId,
            Hours = (int)dto.Hours,
            Description = dto.Description,
            Date = DateTime.UtcNow
        };

        _context.WorkSessions.Add(session);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return new WorkSessionDto
        {
            Id = session.Id,
            TaskId = session.TaskId,
            Username = user?.Username ?? "Unknown",
            Hours = session.Hours,
            Description = session.Description,
            Date = session.Date
        };
    }
}