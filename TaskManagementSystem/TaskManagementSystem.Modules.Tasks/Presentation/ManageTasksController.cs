using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagementSystem.Data.Domain.Entities;
using TaskManagementSystem.Data.Domain.Enums;
using TaskManagementSystem.Modules.Tasks.Application.DTOs;
using TaskManagementSystem.Modules.Tasks.Application.Interfaces;
using static System.Runtime.InteropServices.JavaScript.JSType;
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


    [Authorize(Roles = "Manager,Admin")]
    [HttpPatch("transfer-task")]
    public async Task<ActionResult> TransferTask(TransferTaskDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var isAdmin = User.IsInRole("Admin");
        var (status, error) = await task.TransferTaskAsync(request, userid, isAdmin);
        if (error != null)return BadRequest(error);
        return Ok(status);
    }


    [Authorize(Roles = "Manager")]
    [HttpGet("get-tasks-board")]
    public async Task<ActionResult> GetBoardTasks()
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var tasks = await task.GetBoardTasks(userid);
        return Ok(tasks);
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("get-tasks-board/details/{taskId}")]
    public async Task<ActionResult<TaskDetailsDto>> GetTaskDetails(int taskId)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var tasks = await task.GetTaskDetails(taskId, userid);

        if (tasks == null)
            return NotFound();

        return Ok(tasks);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("get-archived-tasks")]
    public async Task<ActionResult> GetArchivedTasks()
    {
        var tasks = await task.GetAdminArchivedTasks();
        return Ok(tasks);
    }

    [Authorize(Roles = "Manager")]
    [HttpPatch("Change-task-status/{taskid}")]
    public async Task<ActionResult<ChangeStatusOnTaskDto>> ChangeStatusTask(int taskid, ChangeStatusOnTaskDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var (result, error) = await task.ChangeStausOnTaskAsync(userid, taskid, request);
        if (error != null) return BadRequest(error);
        return Ok(result);
    }

    [Authorize(Roles = "Manager")]
    [HttpPost("Create-task")]
    public async Task<ActionResult<CreateTaskDto>> CreateTask(CreateTaskDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var result = await task.CreateTaskAsync(request, userid);
        return Ok(result);
    }

    [Authorize(Roles = "Manager")]
    [HttpPatch("Remove-task")]
    public async Task<ActionResult> RemoveTask(RecoverOrArchiveDto request)
    {
        var userid = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        var archivetask = await task.ArchiveTask(request, userid);
        return Ok(archivetask);
    }
    [Authorize(Roles = "Admin")]
    [HttpPatch("Recover-task")]
    public async Task<ActionResult> RecoverTask(RecoverOrArchiveDto request)
    {
        var (status, error) = await task.AdminRecoverTask(request);
        if (error != null)
            return BadRequest(error);
        return Ok(status);
    }
    [Authorize(Roles = "Admin")]
    [HttpDelete("force-delete-task/{taskId}")]
    public async Task<ActionResult> ForceDeleteTask(int taskId)
    {
        var (status, error) = await task.DeleteArchivedTaskAsync(taskId);

        if (error != null)  return BadRequest(error);

        return Ok(status);
    }


}
