using TaskManagementSystem.Modules.WorkSessions.Application.DTOs;

namespace TaskManagementSystem.Modules.WorkSessions.Application.Interfaces;

public interface IWorkSessionService
{
    Task<IEnumerable<WorkSessionDto>> GetAllSessionsAsync();
    Task<IEnumerable<WorkSessionDto>> GetSessionsByTaskIdAsync(int taskId);
    Task<WorkSessionDto> CreateSessionAsync(CreateWorkSessionDto dto, int userId);
}