namespace TaskManagementSystem.Modules.WorkSessions.Application.DTOs;

public class WorkSessionDto
{
    public int Id { get; set; }
    public int TaskId { get; set; }
    public string Username { get; set; } = string.Empty;
    public double Hours { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; }
}