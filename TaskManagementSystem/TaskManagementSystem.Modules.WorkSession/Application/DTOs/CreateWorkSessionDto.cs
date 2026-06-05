using System.ComponentModel.DataAnnotations;

namespace TaskManagementSystem.Modules.WorkSessions.Application.DTOs;

public class CreateWorkSessionDto
{
    [Required]
    public int TaskId { get; set; }

    [Required]
    [Range(0.1, 24, ErrorMessage = "Hours must be between 0.1 and 24.")]
    public double Hours { get; set; }

    [Required]
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
}