using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Tasks.Application.Dto;
using TaskManagementSystem.Modules.Tasks.Application.Interface;
namespace TaskManagementSystem.Modules.Tasks.Presentation;

[ApiController]
[Route("api/Task")]
public class ManageTasksController : ControllerBase
{
    private readonly IManageTasks task;
    public ManageTasksController(IManageTasks task)
    {
        this.task = task;
    }

    [Authorize(Roles = "Manager")]
    [HttpPost("Create-team")]
    public async Task<ActionResult<CreateTaskDto>> CreateTask(CreateTaskDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await task.CreateTaskAsync(request, userid);
        return Ok(result);
    }
}
